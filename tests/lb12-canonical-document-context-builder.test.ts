import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { ProcedureType } from "../src/domain/types/ProcedureType";
import { buildCanonicalDocumentContext } from "../src/engines/CanonicalDocumentContextBuilder";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb12.7-test" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function completeServiceState(): CanonicalExpedienteState {
  return {
    id: "EXP-12.7-SERVICE",
    lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA,
    blockers: [],
    warnings: ["Advertencia preservada"],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de mantenimiento"),
      cpvMain: validated("cpvMain", "50000000-5"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 10000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 5000000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24),
      extensionMonths: validated("extensionMonths", 12),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: validated("awardCriteria", ["Precio", "Calidad"]),
      solvency: validated("solvency", ["Solvencia económica", "Solvencia técnica"]),
      publicity: validated("publicity", "PLACSP_Y_DOUE"),
    },
  };
}

describe("Bloque 12.7 - contexto documental desde expediente canónico", () => {
  it("construye el DocumentContext LB-5 sin perder los datos canónicos validados", () => {
    const result = buildCanonicalDocumentContext(completeServiceState(), new Date("2026-08-21T12:00:00Z"));

    expect(result.ready).toBe(true);
    expect(result.context?.expedienteNumber).toBe("EXP-12.7-SERVICE");
    expect(result.context?.procedure.value).toBe(ProcedureType.OPEN);
    expect(result.context?.contractType.value).toBe("SERVICE");
    expect(result.context?.cpv.value).toBe("50000000-5");
    expect(result.context?.lots.value).toEqual(["Lote único"]);
    expect(result.context?.request.contract).toMatchObject({
      estimatedValueCents: 10000000,
      baseTenderBudgetCents: 5000000,
      durationMonths: 24,
      extensionMonths: 12,
      modificationPercent: 20,
    });
    expect(result.context?.version).toBe("CANONICAL-DOCUMENT-CONTEXT-12.7-v1");
  });

  it("no inventa umbrales ni plazos cuando no se aportan resultados jurídicos promocionables", () => {
    const result = buildCanonicalDocumentContext(completeServiceState());

    expect(result.context?.thresholds.value).toBeUndefined();
    expect(result.context?.deadlines.value).toBeUndefined();
    expect(result.warnings.some(warning => warning.includes("Umbral jurídico"))).toBe(true);
    expect(result.warnings.some(warning => warning.includes("Plazos jurídicos"))).toBe(true);
  });

  it("incorpora umbral y plazos cuando llegan como evidencia humana validada", () => {
    const result = buildCanonicalDocumentContext(
      completeServiceState(),
      new Date("2026-08-21T12:00:00Z"),
      {
        threshold: validated("threshold", 143000),
        deadlines: validated("deadlines", {
          ofertasDias: 35,
          adjudicacionDias: 15,
          formalizacionDias: 15,
          subsanacionDias: 3,
          recursoDias: 15,
          ejecucionDias: 0,
          justificacion: "Regla validada",
          normativa: "LCSP",
          articulo: "156",
          confidence: 100,
        }),
      },
    );

    expect(result.ready).toBe(true);
    expect(result.context?.thresholds.value).toBe(143000);
    expect(result.context?.deadlines.value).toMatchObject({ ofertasDias: 35, articulo: "156" });
  });

  it("bloquea un resultado jurídico suplementario todavía no validado", () => {
    const deadlineProposal: EvidenceField<any> = {
      key: "deadlines",
      value: { ofertasDias: 35 },
      status: "SYSTEM_PROPOSAL",
      sources: [{ kind: "NORMATIVE_RULE", sourceId: "rule" }],
      humanValidationRequired: true,
      humanValidated: false,
    };
    const result = buildCanonicalDocumentContext(completeServiceState(), new Date(), { deadlines: deadlineProposal });
    expect(result.ready).toBe(false);
    expect(result.blockers).toContain("El resultado de plazos aportado no es promocionable.");
  });

  it("bloquea la construcción si existe un campo jurídico pendiente", () => {
    const state = completeServiceState();
    state.fields.awardCriteria = {
      key: "awardCriteria",
      value: null,
      status: "PENDING",
      sources: [],
      humanValidationRequired: true,
      humanValidated: false,
    };

    const result = buildCanonicalDocumentContext(state);
    expect(result.ready).toBe(false);
    expect(result.context).toBeUndefined();
    expect(result.blockers).toContain("Campo no promocionable: awardCriteria");
  });

  it("bloquea procedimientos que aún no tengan traducción segura al framework LB-5", () => {
    const state = completeServiceState();
    state.fields.procedure = validated("procedure", "DIALOGO_COMPETITIVO");

    const result = buildCanonicalDocumentContext(state);
    expect(result.ready).toBe(false);
    expect(result.blockers).toContain("Procedimiento no mapeado al framework documental: DIALOGO_COMPETITIVO");
  });
});
