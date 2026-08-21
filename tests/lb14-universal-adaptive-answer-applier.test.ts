import { describe, expect, it } from "vitest";
import { UniversalAdaptiveAnswerApplier } from "../src/application/intake/lb14/UniversalAdaptiveAnswerApplier";
import { UniversalAdaptiveQuestionEngine } from "../src/application/intake/lb14/UniversalAdaptiveQuestionEngine";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "USER_INPUT", sourceId: "lb14-answer-test" }], humanValidationRequired: true, humanValidated: true };
}

function state(): CanonicalExpedienteState {
  return {
    id: "LB14-ANS-001",
    lifecycleState: EstadoExpediente.BORRADOR,
    blockers: [],
    warnings: [],
    fields: {
      contractType: createPendingEvidenceField("contractType"),
      object: createPendingEvidenceField("object"),
      cpvMain: createPendingEvidenceField("cpvMain"),
      lots: createPendingEvidenceField("lots"),
      estimatedValueCents: createPendingEvidenceField("estimatedValueCents"),
      baseTenderBudgetCents: createPendingEvidenceField("baseTenderBudgetCents"),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: createPendingEvidenceField("durationMonths"),
      extensionMonths: createPendingEvidenceField("extensionMonths"),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: createPendingEvidenceField("awardCriteria"),
      solvency: createPendingEvidenceField("solvency"),
    },
  };
}

const planner = new UniversalAdaptiveQuestionEngine();
const applier = new UniversalAdaptiveAnswerApplier(planner);

describe("Bloque 14.2 - aplicación trazable de respuestas adaptativas", () => {
  it("incorpora la necesidad como declaración del usuario y recalcula la siguiente acción", () => {
    const expediente = createUniversalExpedienteFromCanonical(state());
    const action = planner.next(expediente);
    const result = applier.apply(expediente, action, "Servicio de mantenimiento integral de instalaciones");

    expect(result.expediente.canonical.fields.object.value).toContain("mantenimiento");
    expect(result.expediente.canonical.fields.object.status).toBe("SOURCE_DECLARED");
    expect(result.expediente.canonical.fields.object.sources[0]?.kind).toBe("USER_INPUT");
    expect(result.expediente.traceability.sourceRegistry).toContainEqual({ kind: "USER_INPUT", sourceId: "adaptive:ask:contract-need" });
    expect(result.next.kind).toBe("RUN_ENGINE");
    expect(result.next.engine).toBe("CONTRACT_NATURE_CLASSIFIER");
  });

  it("separa la decisión de dividir en lotes de la lista de lotes y crea lote único solo cuando no hay división", () => {
    const base = state();
    base.fields.object = validated("object", "Servicio de mantenimiento");
    base.fields.contractType = validated("contractType", "SERVICE");
    base.fields.cpvMain = validated("cpvMain", "50000000-5");
    const expediente = createUniversalExpedienteFromCanonical(base);
    const action = planner.next(expediente);

    expect(action.id).toBe("ask:lot-separability");
    expect(action.fieldKey).toBe("lots.divisionIntoLots");

    const result = applier.apply(expediente, action, false);
    expect(result.expediente.lots.divisionIntoLots.value).toBe(false);
    expect(result.expediente.canonical.fields.lots.value).toEqual(["Lote único"]);
    expect(result.next.id).toBe("ask:initial-duration");
  });

  it("cuando sí hay división, pide después identificar los lotes concretos", () => {
    const base = state();
    base.fields.object = validated("object", "Suministro de materiales");
    base.fields.contractType = validated("contractType", "SUPPLY");
    base.fields.cpvMain = validated("cpvMain", "44100000-1");
    const expediente = createUniversalExpedienteFromCanonical(base);
    const first = planner.next(expediente);
    const result = applier.apply(expediente, first, true);

    expect(result.expediente.lots.divisionIntoLots.value).toBe(true);
    expect(result.expediente.canonical.fields.lots.status).toBe("PENDING");
    expect(result.next.id).toBe("ask:lot-configuration");
    expect(result.next.fieldKey).toBe("lots");
  });

  it("rechaza aplicar una respuesta humana sobre una acción automática", () => {
    const base = state();
    base.fields.object = validated("object", "Servicio de limpieza");
    const expediente = createUniversalExpedienteFromCanonical(base);
    const action = planner.next(expediente);
    expect(action.kind).toBe("RUN_ENGINE");
    expect(() => applier.apply(expediente, action, "SERVICE")).toThrow("Solo pueden aplicarse respuestas");
  });
});
