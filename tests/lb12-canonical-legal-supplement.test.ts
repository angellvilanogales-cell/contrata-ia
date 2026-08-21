import { describe, expect, it } from "vitest";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { DeadlineRule } from "../src/domain/legal/modules/plazos/DeadlineRule";
import { resolveCanonicalDeadlineDecision } from "../src/engines/CanonicalLegalSupplement";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb12.7-deadline-test" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function state(): CanonicalExpedienteState {
  return {
    id: "EXP-DEADLINES-12.7",
    lifecycleState: EstadoExpediente.PROCEDIMIENTO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio"),
      cpvMain: validated("cpvMain", "50000000-5"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 20000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 10000000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", ["Precio"]),
      solvency: validated("solvency", ["Solvencia"]),
    },
  };
}

const openRule: DeadlineRule = {
  id: "TEST-DEADLINE-OPEN",
  name: "Regla de prueba de plazo abierto",
  priority: 100,
  version: "1",
  module: "PLAZOS",
  isApplicable: context => context.procedimiento === "ABIERTO",
  evaluate: context => ({
    applied: context.procedimiento === "ABIERTO",
    decision: context.procedimiento === "ABIERTO" ? {
      ofertasDias: 35,
      adjudicacionDias: 15,
      formalizacionDias: 15,
      subsanacionDias: 3,
      recursoDias: 15,
      ejecucionDias: 0,
      justificacion: "Regla de prueba",
      normativa: "LCSP",
      articulo: "156",
      confidence: 100,
    } : undefined,
    justification: "Regla de prueba",
    legalReferences: [{ normativa: "LCSP", articulo: "156", descripcion: "Procedimiento abierto" }],
  }),
};

describe("Bloque 12.7 - integración canónica del motor de plazos", () => {
  it("no ejecuta el motor si falta una entrada jurídica validada", () => {
    const result = resolveCanonicalDeadlineDecision(
      state(),
      {
        processingType: validated("processingType", "ORDINARIA"),
        harmonizedRegulation: { ...validated("harmonizedRegulation", false), status: "PENDING", value: null, humanValidated: false },
        urgency: validated("urgency", false),
        emergency: validated("emergency", false),
        europeanFunding: validated("europeanFunding", false),
      },
      [openRule],
    );

    expect(result.ready).toBe(false);
    expect(result.blockers).toContain("Entrada no promocionable para motor de plazos: harmonizedRegulation");
  });

  it("promueve la decisión del motor como propuesta normativa pendiente de validación humana", () => {
    const result = resolveCanonicalDeadlineDecision(
      state(),
      {
        processingType: validated("processingType", "ORDINARIA"),
        harmonizedRegulation: validated("harmonizedRegulation", false),
        urgency: validated("urgency", false),
        emergency: validated("emergency", false),
        europeanFunding: validated("europeanFunding", false),
      },
      [openRule],
    );

    expect(result.ready).toBe(true);
    expect(result.field?.value?.ofertasDias).toBe(35);
    expect(result.field?.status).toBe("SYSTEM_PROPOSAL");
    expect(result.field?.humanValidationRequired).toBe(true);
    expect(result.field?.humanValidated).toBe(false);
    expect(result.field?.legalBasis).toContain("156");
  });
});
