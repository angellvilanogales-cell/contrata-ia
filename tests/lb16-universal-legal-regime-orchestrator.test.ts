import { describe, expect, it } from "vitest";
import { UniversalLegalRegimeEnginePort, UniversalLegalRegimeOrchestrator, evaluateUniversalLegalRegimeClosure } from "../src/application/intake/lb16/UniversalLegalRegimeOrchestrator";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";
import { DeadlineRule } from "../src/domain/legal/modules/plazos/DeadlineRule";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "USER_INPUT", sourceId: "human" }], humanValidationRequired: true, humanValidated: true };
}
function proposed<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "SYSTEM_PROPOSAL", sources: [{ kind: "NORMATIVE_RULE", sourceId: "fixture" }], humanValidationRequired: true, humanValidated: false };
}

function base(): UniversalExpedienteV13 {
  const canonical: CanonicalExpedienteState = {
    id: "LB16", lifecycleState: EstadoExpediente.VALOR_VALIDADO, blockers: [], warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"), object: validated("object", "Servicio"), cpvMain: validated("cpvMain", "50700000-2"), lots: validated("lots", ["Lote 1"]),
      estimatedValueCents: validated("estimatedValueCents", 182_399_114), baseTenderBudgetCents: validated("baseTenderBudgetCents", 80_000_000), procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24), extensionMonths: validated("extensionMonths", 24), modificationPercent: validated("modificationPercent", 20),
      awardCriteria: createPendingEvidenceField("awardCriteria"), solvency: createPendingEvidenceField("solvency"), publicity: createPendingEvidenceField("publicity"),
    },
  };
  const e = createUniversalExpedienteFromCanonical(canonical);
  e.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_114);
  e.regulation.threshold = validated("regulation.threshold", 1_000_000);
  e.regulation.harmonizedRegulation = validated("regulation.harmonizedRegulation", true);
  return e;
}

class FakePort implements UniversalLegalRegimeEnginePort {
  public ejecutarRegimen(expediente: UniversalExpedienteV13) {
    return {
      expediente: {
        ...expediente,
        canonical: {
          ...expediente.canonical,
          fields: {
            ...expediente.canonical.fields,
            solvency: proposed("solvency", ["solvencia propuesta"]),
            publicity: proposed("publicity", "publicidad propuesta"),
          },
        },
      },
      executed: ["SolvenciaEngine", "PublicidadEngine"],
      blockers: [],
    };
  }

  public resolverPlazos(expediente: UniversalExpedienteV13, _rules: DeadlineRule[]) {
    return {
      expediente: {
        ...expediente,
        regulation: {
          ...expediente.regulation,
          deadlines: proposed("regulation.deadlines", {
            ofertasDias: 30, adjudicacionDias: 15, formalizacionDias: 15, subsanacionDias: 3, recursoDias: 15, ejecucionDias: 0,
            justificacion: "fixture", normativa: "fixture", articulo: "fixture", confidence: 100,
          }),
        },
      },
      executed: ["DeadlineDecisionEngine"],
      blockers: [],
    };
  }
}

function withValidatedRegime(e: UniversalExpedienteV13): UniversalExpedienteV13 {
  e.canonical.fields.solvency = validated("solvency", ["solvencia validada"]);
  e.canonical.fields.publicity = validated("publicity", "publicidad validada");
  return e;
}
function withDeadlineInputs(e: UniversalExpedienteV13): UniversalExpedienteV13 {
  e.processing.processingType = validated("processing.processingType", "ORDINARY");
  e.processing.urgency = validated("processing.urgency", false);
  e.processing.emergency = validated("processing.emergency", false);
  e.regulation.europeanFunding = validated("regulation.europeanFunding", false);
  return e;
}

describe("Bloque 16 - orquestación universal del régimen jurídico", () => {
  it("16.1 ejecuta solvencia/publicidad solo cuando ambas están pendientes", () => {
    const result = new UniversalLegalRegimeOrchestrator(new FakePort()).advance(base());
    expect(result.stage).toBe("VALIDATE_REGIME_PROPOSALS");
    expect(result.executed).toEqual(["SolvenciaEngine", "PublicidadEngine"]);
    expect(result.expediente.canonical.fields.solvency.status).toBe("SYSTEM_PROPOSAL");
  });

  it("16.2 no sobrescribe un paquete parcialmente protegido", () => {
    const input = base();
    input.canonical.fields.solvency = validated("solvency", ["existente"]);
    const result = new UniversalLegalRegimeOrchestrator(new FakePort()).advance(input);
    expect(result.stage).toBe("NEEDS_REGIME_EVIDENCE");
    expect(result.executed).toEqual([]);
    expect(result.expediente.canonical.fields.solvency.value).toEqual(["existente"]);
  });

  it("16.3 identifica hechos jurídicos pendientes antes de plazos sin inventarlos", () => {
    const input = withValidatedRegime(base());
    const result = new UniversalLegalRegimeOrchestrator(new FakePort()).advance(input);
    expect(result.stage).toBe("NEEDS_DEADLINE_INPUT");
    expect(result.missingFields).toContain("processing.processingType");
    expect(result.missingFields).toContain("regulation.europeanFunding");
  });

  it("16.3 exige un banco de reglas de plazos antes de ejecutar el motor", () => {
    const input = withDeadlineInputs(withValidatedRegime(base()));
    const result = new UniversalLegalRegimeOrchestrator(new FakePort()).advance(input, []);
    expect(result.stage).toBe("NEEDS_DEADLINE_RULES");
    expect(result.executed).toEqual([]);
  });

  it("16.3 ejecuta plazos con reglas explícitas y deja la salida pendiente de validación", () => {
    const input = withDeadlineInputs(withValidatedRegime(base()));
    const result = new UniversalLegalRegimeOrchestrator(new FakePort()).advance(input, [{} as DeadlineRule]);
    expect(result.stage).toBe("VALIDATE_DEADLINE_PROPOSAL");
    expect(result.executed).toEqual(["DeadlineDecisionEngine"]);
    expect(result.expediente.regulation.deadlines.status).toBe("SYSTEM_PROPOSAL");
  });

  it("16.4 cierra únicamente cuando todo el régimen jurídico requerido es promocionable", () => {
    const input = withDeadlineInputs(withValidatedRegime(base()));
    input.regulation.deadlines = validated("regulation.deadlines", {
      ofertasDias: 30, adjudicacionDias: 15, formalizacionDias: 15, subsanacionDias: 3, recursoDias: 15, ejecucionDias: 0,
      justificacion: "validado", normativa: "validada", articulo: "validado", confidence: 100,
    });
    const advance = new UniversalLegalRegimeOrchestrator(new FakePort()).advance(input);
    expect(advance.stage).toBe("COMPLETE");
    expect(evaluateUniversalLegalRegimeClosure(input)).toEqual({ ready: true, blockers: [] });
  });

  it("16.4 hereda cualquier bloqueo del cierre 15 y no avanza", () => {
    const input = base();
    input.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_116);
    const result = new UniversalLegalRegimeOrchestrator(new FakePort()).advance(input);
    expect(result.stage).toBe("BLOCKED_LB15");
    expect(result.blockers.join(" ")).toContain("no coinciden");
  });
});
