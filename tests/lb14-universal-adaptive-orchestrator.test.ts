import { describe, expect, it } from "vitest";
import { UniversalAdaptiveActionExecutor, UniversalAdaptiveEnginePort } from "../src/application/intake/lb14/UniversalAdaptiveActionExecutor";
import { UniversalAdaptiveOrchestrator } from "../src/application/intake/lb14/UniversalAdaptiveOrchestrator";
import { UniversalAdaptiveQuestionEngine } from "../src/application/intake/lb14/UniversalAdaptiveQuestionEngine";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";
import { KnowledgeRepository } from "../src/domain/conocimiento/KnowledgeRepository";
import { KnowledgeManager } from "../src/domain/conocimiento/KnowledgeManager";
import { CPVEntry } from "../src/domain/cpv/CPVEntry";
import { CPVEngine } from "../src/engines/CPVEngine";
import { ProcedimientoEngine } from "../src/engines/ProcedimientoEngine";
import { CanonicalExpedienteEngine } from "../src/engines/CanonicalExpedienteEngine";
import { UniversalExpedienteEngine, UniversalEngineRunResult } from "../src/engines/UniversalExpedienteEngine";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb14-orchestrator" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function proposal<T>(key: string, value: T, sourceId: string): EvidenceField<T> {
  return {
    key,
    value,
    status: "SYSTEM_PROPOSAL",
    sources: [{ kind: "SYSTEM_PROPOSAL", sourceId }],
    humanValidationRequired: true,
    humanValidated: false,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB14-ORCHESTRATOR-001",
    lifecycleState: EstadoExpediente.OBJETO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de limpieza de oficinas"),
      cpvMain: validated("cpvMain", "90910000-9"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 12000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 6000000),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", []),
      solvency: validated("solvency", []),
      publicity: validated("publicity", "PENDING_PROCEDURE"),
    },
  };
}

function noOpEngine(): UniversalAdaptiveEnginePort {
  return {
    ejecutarIdentificacion(expediente): UniversalEngineRunResult {
      return { expediente, executed: [], blockers: ["No configurado"] };
    },
    resolverPlazos(expediente): UniversalEngineRunResult {
      return { expediente, executed: [], blockers: ["No configurado"] };
    },
  };
}

function realEngine(): UniversalExpedienteEngine {
  const repository = new KnowledgeRepository();
  const cpv = new CPVEntry();
  cpv.codigo = "90910000-9";
  cpv.descripcion = "Servicios de limpieza";
  cpv.palabrasClave = ["limpieza", "oficinas"];
  repository.registrarCPV(cpv);
  return new UniversalExpedienteEngine(
    new CanonicalExpedienteEngine(
      new CPVEngine(new KnowledgeManager(repository)),
      new ProcedimientoEngine(),
    ),
  );
}

function orchestrator(engine: UniversalAdaptiveEnginePort): UniversalAdaptiveOrchestrator {
  return new UniversalAdaptiveOrchestrator(
    new UniversalAdaptiveQuestionEngine(),
    new UniversalAdaptiveActionExecutor(engine),
  );
}

describe("Bloque 14.3 - orquestación automática hasta intervención humana", () => {
  it("clasifica automáticamente la naturaleza y se detiene para validación humana", () => {
    const state = canonical();
    state.fields.contractType = createPendingEvidenceField("contractType");
    state.fields.cpvMain = createPendingEvidenceField("cpvMain");
    const universal = createUniversalExpedienteFromCanonical(state);

    const result = orchestrator(noOpEngine()).advance(universal);

    expect(result.automaticSteps).toHaveLength(1);
    expect(result.automaticSteps[0].engine).toBe("CONTRACT_NATURE_CLASSIFIER");
    expect(result.expediente.canonical.fields.contractType.value).toBe("SERVICE");
    expect(result.expediente.canonical.fields.contractType.status).toBe("SYSTEM_PROPOSAL");
    expect(result.next.kind).toBe("VALIDATE_HUMAN");
    expect(result.next.fieldKey).toBe("contractType");
    expect(result.blockers).toEqual([]);
  });

  it("ejecuta CPV automáticamente y se detiene en su validación, sin preguntar el código", () => {
    const state = canonical();
    state.fields.cpvMain = createPendingEvidenceField("cpvMain");
    const universal = createUniversalExpedienteFromCanonical(state);

    const result = orchestrator(realEngine()).advance(universal);

    expect(result.automaticSteps[0].engine).toBe("CPVEngine");
    expect(result.expediente.canonical.fields.cpvMain.value).toBe("90910000-9");
    expect(result.expediente.canonical.fields.cpvMain.status).toBe("SYSTEM_PROPOSAL");
    expect(result.next.kind).toBe("VALIDATE_HUMAN");
    expect(result.next.fieldKey).toBe("cpvMain");
  });

  it("conserva el CPV validado y pide los criterios antes de ejecutar ProcedimientoEngine", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const originalCpv = universal.canonical.fields.cpvMain;

    const result = orchestrator(realEngine()).advance(universal);

    expect(result.automaticSteps).toEqual([]);
    expect(result.expediente.canonical.fields.cpvMain).toBe(originalCpv);
    expect(result.expediente.canonical.fields.cpvMain.status).toBe("HUMAN_VALIDATED");
    expect(result.expediente.canonical.fields.procedure.status).toBe("PENDING");
    expect(result.next.kind).toBe("ASK_USER");
    expect(result.next.fieldKey).toBe("criteria.awardCriteria");
  });

  it("propone procedimiento cuando criterios y umbral aplicable ya están acreditados", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.criteria.awardCriteria = validated("criteria.awardCriteria", []);
    universal.regulation.threshold = validated("regulation.threshold", 216_000);

    const result = orchestrator(realEngine()).advance(universal);

    expect(result.automaticSteps[0].engine).toBe("ProcedimientoEngine");
    expect(result.expediente.canonical.fields.procedure.value).toBe("ABIERTO_SIMPLIFICADO");
    expect(result.expediente.canonical.fields.procedure.status).toBe("SYSTEM_PROPOSAL");
    expect(result.next.kind).toBe("VALIDATE_HUMAN");
    expect(result.next.fieldKey).toBe("procedure");
  });

  it("se detiene ante un bloqueo del motor y no entra en bucle", () => {
    const state = canonical();
    state.fields.cpvMain = createPendingEvidenceField("cpvMain");
    const universal = createUniversalExpedienteFromCanonical(state);

    const result = orchestrator(noOpEngine()).advance(universal);

    expect(result.automaticSteps).toHaveLength(1);
    expect(result.blockers).toEqual(["No configurado"]);
    expect(result.next.kind).toBe("RUN_ENGINE");
    expect(result.next.engine).toBe("CPVEngine");
  });

  it("no ejecuta automáticamente una propuesta ya existente: exige intervención humana", () => {
    const state = canonical();
    state.fields.procedure = proposal("procedure", "ABIERTO", "PROC-001");
    const universal: UniversalExpedienteV13 = createUniversalExpedienteFromCanonical(state);

    const result = orchestrator(realEngine()).advance(universal);

    expect(result.automaticSteps).toEqual([]);
    expect(result.next.kind).toBe("VALIDATE_HUMAN");
    expect(result.next.fieldKey).toBe("procedure");
  });
});
