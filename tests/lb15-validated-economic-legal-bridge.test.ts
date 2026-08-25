import { describe, expect, it } from "vitest";
import { UniversalValidatedEconomicLegalBridge } from "../src/application/intake/lb15/UniversalValidatedEconomicLegalBridge";
import { UniversalAdaptiveQuestionEngine } from "../src/application/intake/lb14/UniversalAdaptiveQuestionEngine";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";
import { UniversalEngineRunResult } from "../src/engines/UniversalExpedienteEngine";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [
      { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP:REG-SERVICE-007" },
      { kind: "USER_INPUT", sourceId: "human-validation:tester" },
    ],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB15-9-MAINTENANCE-007",
    lifecycleState: EstadoExpediente.VALOR_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Mantenimiento de edificios e instalaciones SAE Sevilla"),
      cpvMain: validated("cpvMain", "50700000-2"),
      lots: validated("lots", ["Lote 1", "Lote 2", "Lote 3", "Lote 4"]),
      estimatedValueCents: validated("estimatedValueCents", 182_399_114),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 82_908_688),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: validated("durationMonths", 24),
      extensionMonths: validated("extensionMonths", 24),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: createPendingEvidenceField("awardCriteria"),
      solvency: createPendingEvidenceField("solvency"),
      publicity: createPendingEvidenceField("publicity"),
    },
  };
}

function expediente(): UniversalExpedienteV13 {
  const result = createUniversalExpedienteFromCanonical(canonical());
  result.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_114);
  result.economic.initialEstimatedValueBaseCents = validated("economic.initialEstimatedValueBaseCents", 82_908_688);
  return result;
}

function procedureEngine(): { ejecutarIdentificacion(expediente: UniversalExpedienteV13): UniversalEngineRunResult } {
  return {
    ejecutarIdentificacion(current) {
      const proposal: EvidenceField<string> = {
        key: "procedure",
        value: "ABIERTO",
        status: "SYSTEM_PROPOSAL",
        sources: [{ kind: "NORMATIVE_RULE", sourceId: "PROC-004", note: "Artículo 131 LCSP" }],
        legalBasis: ["LCSP art. 131"],
        humanValidationRequired: true,
        humanValidated: false,
        diagnostics: ["Propuesta normativa; requiere validación humana."],
      };
      return {
        expediente: {
          ...current,
          canonical: {
            ...current.canonical,
            fields: { ...current.canonical.fields, procedure: proposal },
          },
        },
        executed: ["ProcedimientoEngine"],
        blockers: [],
      };
    },
  };
}

describe("Bloque 15.9 - puente entre economía validada y procedimiento jurídico", () => {
  it("propone procedimiento abierto usando el VE ya validado sin modificarlo", () => {
    const input = expediente();
    const result = new UniversalValidatedEconomicLegalBridge(procedureEngine()).tryAdvance(input);

    expect(result.blockers).toEqual([]);
    expect(result.executedProcedure).toBe(true);
    expect(result.executed).toContain("ProcedimientoEngine");
    expect(result.expediente.canonical.fields.procedure.value).toBe("ABIERTO");
    expect(result.expediente.canonical.fields.procedure.status).toBe("SYSTEM_PROPOSAL");
    expect(result.expediente.canonical.fields.procedure.humanValidationRequired).toBe(true);
    expect(result.expediente.canonical.fields.estimatedValueCents.value).toBe(182_399_114);
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(182_399_114);
  });

  it("no vuelve a preguntar por el VE: la siguiente intervención humana es validar el procedimiento", () => {
    const result = new UniversalValidatedEconomicLegalBridge(procedureEngine()).tryAdvance(expediente());
    const next = new UniversalAdaptiveQuestionEngine().next(result.expediente);

    expect(next.kind).toBe("VALIDATE_HUMAN");
    expect(next.fieldKey).toBe("procedure");
    expect(next.id).toBe("validate:procedure");
    expect(next.id).not.toBe("ask:estimated-value");
  });

  it("no presume SARA a partir del importe económico", () => {
    const input = expediente();
    expect(input.regulation.harmonizedRegulation.status).toBe("PENDING");

    const result = new UniversalValidatedEconomicLegalBridge(procedureEngine()).tryAdvance(input);

    expect(result.blockers).toEqual([]);
    expect(result.expediente.regulation.harmonizedRegulation.status).toBe("PENDING");
    expect(result.expediente.regulation.harmonizedRegulation.value).toBeNull();
  });

  it("bloquea la decisión jurídica si VE canónico y VE económico divergen", () => {
    const input = expediente();
    input.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_116);

    const result = new UniversalValidatedEconomicLegalBridge(procedureEngine()).tryAdvance(input);

    expect(result.executedProcedure).toBe(false);
    expect(result.executed).toEqual([]);
    expect(result.blockers[0]).toContain("no coinciden");
    expect(result.expediente.canonical.fields.procedure.status).toBe("PENDING");
  });

  it("exige validación humana del VE antes de usarlo para determinar procedimiento", () => {
    const input = expediente();
    input.economic.legalEstimatedValueCents = {
      ...input.economic.legalEstimatedValueCents,
      status: "SOURCE_DECLARED",
      humanValidated: false,
    };

    const result = new UniversalValidatedEconomicLegalBridge(procedureEngine()).tryAdvance(input);

    expect(result.executedProcedure).toBe(false);
    expect(result.blockers[0]).toContain("validado humanamente");
  });

  it("preserva un conflicto de procedimiento y no lo sustituye por PROC-004", () => {
    const input = expediente();
    input.canonical.fields.procedure = {
      key: "procedure",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP" },
        { kind: "PRIMARY_DOCUMENT", sourceId: "MEMORIA" },
      ],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: { statements: ["ABIERTO", "OTRO"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };

    const result = new UniversalValidatedEconomicLegalBridge(procedureEngine()).tryAdvance(input);

    expect(result.executedProcedure).toBe(false);
    expect(result.blockers[0]).toContain("conflicto de fuente sobre el procedimiento");
    expect(result.expediente.canonical.fields.procedure.status).toBe("SOURCE_CONFLICT");
  });
});
