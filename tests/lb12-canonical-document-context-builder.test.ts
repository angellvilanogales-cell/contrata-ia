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
    sources: [{ kind: "USER_INPUT", sourceId: "lb12.6-test" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function completeServiceState(): CanonicalExpedienteState {
  return {
    id: "EXP-12.6-SERVICE",
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

describe("Bloque 12.6 - contexto documental desde expediente canónico", () => {
  it("construye el DocumentContext LB-5 sin perder los datos canónicos validados", () => {
    const result = buildCanonicalDocumentContext(completeServiceState(), new Date("2026-08-21T12:00:00Z"));

    expect(result.ready).toBe(true);
    expect(result.context?.expedienteNumber).toBe("EXP-12.6-SERVICE");
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
    expect(result.context?.version).toBe("CANONICAL-DOCUMENT-CONTEXT-12.6-v1");
  });

  it("no inventa umbrales ni plazos que todavía no existen como resultados canónicos", () => {
    const result = buildCanonicalDocumentContext(completeServiceState());

    expect(result.context?.thresholds.value).toBeUndefined();
    expect(result.context?.deadlines.value).toBeUndefined();
    expect(result.warnings.some(warning => warning.includes("Umbrales y plazos"))).toBe(true);
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
