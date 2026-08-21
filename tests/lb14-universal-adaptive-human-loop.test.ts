import { describe, expect, it } from "vitest";
import { UniversalAdaptiveActionExecutor, UniversalAdaptiveEnginePort } from "../src/application/intake/lb14/UniversalAdaptiveActionExecutor";
import { UniversalAdaptiveHumanDecisionApplier } from "../src/application/intake/lb14/UniversalAdaptiveHumanDecisionApplier";
import { UniversalAdaptiveHumanLoop } from "../src/application/intake/lb14/UniversalAdaptiveHumanLoop";
import { UniversalAdaptiveOrchestrator } from "../src/application/intake/lb14/UniversalAdaptiveOrchestrator";
import { UniversalAdaptiveQuestionEngine } from "../src/application/intake/lb14/UniversalAdaptiveQuestionEngine";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { TipoEvento } from "../src/domain/expediente/ExpedienteJournal";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { UniversalEngineRunResult } from "../src/engines/UniversalExpedienteEngine";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb14-human-base" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function proposal<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "SYSTEM_PROPOSAL",
    sources: [{ kind: "NORMATIVE_RULE", sourceId: "PROC-001" }],
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics: ["Propuesta normativa pendiente de validación."],
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB14-HUMAN-001",
    lifecycleState: EstadoExpediente.PROCEDIMIENTO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de mantenimiento"),
      cpvMain: validated("cpvMain", "50000000-5"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 12000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 6000000),
      procedure: proposal("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", []),
      solvency: validated("solvency", []),
      publicity: validated("publicity", "PLACSP"),
    },
  };
}

function noOpEngine(): UniversalAdaptiveEnginePort {
  return {
    ejecutarIdentificacion(expediente): UniversalEngineRunResult {
      return { expediente, executed: [], blockers: ["No debería ejecutarse motor en esta prueba"] };
    },
    resolverPlazos(expediente): UniversalEngineRunResult {
      return { expediente, executed: [], blockers: ["No debería ejecutarse motor en esta prueba"] };
    },
  };
}

function humanLoop(): UniversalAdaptiveHumanLoop {
  const planner = new UniversalAdaptiveQuestionEngine();
  return new UniversalAdaptiveHumanLoop(
    new UniversalAdaptiveHumanDecisionApplier(),
    new UniversalAdaptiveOrchestrator(planner, new UniversalAdaptiveActionExecutor(noOpEngine())),
  );
}

describe("Bloque 14.4 - cierre del circuito humano", () => {
  it("valida una propuesta conservando su fuente, identifica al validador y reanuda el flujo", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const planner = new UniversalAdaptiveQuestionEngine();
    const action = planner.next(universal);

    expect(action.kind).toBe("VALIDATE_HUMAN");
    expect(action.fieldKey).toBe("procedure");

    const result = humanLoop().validateAndResume(universal, action, {
      actor: "Técnico responsable",
      rationale: "Se valida el procedimiento abierto tras revisar cuantía y reglas aplicables.",
    });

    const field = result.expediente.canonical.fields.procedure;
    expect(field.status).toBe("HUMAN_VALIDATED");
    expect(field.humanValidated).toBe(true);
    expect(field.sources.some(source => source.sourceId === "PROC-001")).toBe(true);
    expect(field.sources.some(source => source.sourceId === "human-decision:validate:procedure")).toBe(true);
    expect(result.expediente.traceability.events.at(-1)?.tipo).toBe(TipoEvento.VALIDACION);
    expect(result.expediente.traceability.events.at(-1)?.origen).toBe("Técnico responsable");
    expect(result.next.kind).toBe("ASK_USER");
    expect(result.next.fieldKey).toBe("processing.processingType");
  });

  it("no permite una validación humana sin identificar validador y motivación", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const action = new UniversalAdaptiveQuestionEngine().next(universal);
    const applier = new UniversalAdaptiveHumanDecisionApplier();

    expect(() => applier.validate(universal, action, { actor: "", rationale: "" }))
      .toThrow("La decisión humana debe identificar al validador");
  });

  it("resuelve una contradicción solo con valor y motivación explícitos, preservando las declaraciones incompatibles", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.canonical.fields.procedure = validated("procedure", "ABIERTO");
    universal.guarantees.definitiveGuaranteePercent = {
      key: "guarantees.definitiveGuaranteePercent",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP-A", note: "Garantía definitiva 5 %" },
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP-B", note: "Garantía no exigida" },
      ],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: {
        statements: ["Garantía definitiva 5 %", "Garantía no exigida"],
        treatment: "DO_NOT_AUTO_RESOLVE",
      },
    };

    const action = new UniversalAdaptiveQuestionEngine().next(universal);
    expect(action.kind).toBe("RESOLVE_SOURCE_CONFLICT");

    const result = humanLoop().resolveConflictAndResume(universal, action, 5, {
      actor: "Responsable jurídico",
      rationale: "Se adopta el 5 % tras contrastar el documento primario aplicable al expediente.",
    });

    const field = result.expediente.guarantees.definitiveGuaranteePercent;
    expect(field.value).toBe(5);
    expect(field.status).toBe("HUMAN_VALIDATED");
    expect(field.conflict?.statements).toEqual(["Garantía definitiva 5 %", "Garantía no exigida"]);
    expect(field.sources.some(source => source.sourceId === "PCAP-A")).toBe(true);
    expect(field.sources.some(source => source.sourceId === "PCAP-B")).toBe(true);
    expect(field.sources.some(source => source.sourceId.startsWith("human-decision:resolve:"))).toBe(true);
    expect(result.expediente.traceability.events.at(-1)?.tipo).toBe(TipoEvento.DECISION);
    expect(result.next.kind).not.toBe("RESOLVE_SOURCE_CONFLICT");
  });

  it("rechaza resolver un conflicto sin valor adoptado", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.guarantees.definitiveGuaranteePercent = {
      key: "guarantees.definitiveGuaranteePercent",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "A" }, { kind: "PRIMARY_DOCUMENT", sourceId: "B" }],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: { statements: ["5 %", "0 %"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };
    const action = new UniversalAdaptiveQuestionEngine().next(universal);
    const applier = new UniversalAdaptiveHumanDecisionApplier();

    expect(() => applier.resolveConflict(universal, action, null, {
      actor: "Responsable jurídico",
      rationale: "Contraste realizado.",
    })).toThrow("debe indicar expresamente el valor adoptado");
  });
});
