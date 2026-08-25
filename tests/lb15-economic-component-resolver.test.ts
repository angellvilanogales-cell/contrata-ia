import { describe, expect, it } from "vitest";
import { UniversalAdaptiveActionExecutor, UniversalAdaptiveEnginePort } from "../src/application/intake/lb14/UniversalAdaptiveActionExecutor";
import { UniversalAdaptiveOrchestrator } from "../src/application/intake/lb14/UniversalAdaptiveOrchestrator";
import { UniversalAdaptiveQuestionEngine } from "../src/application/intake/lb14/UniversalAdaptiveQuestionEngine";
import { UniversalEconomicAdaptiveBridge } from "../src/application/intake/lb14/UniversalEconomicAdaptiveBridge";
import { resolveEconomicComponents } from "../src/domain/economic/UniversalEconomicComponentResolver";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField, createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { UniversalEngineRunResult } from "../src/engines/UniversalExpedienteEngine";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb15.5" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function confirmed(key: string, value: number): EvidenceField<number> {
  return {
    key,
    value,
    status: "SOURCE_CONFIRMED",
    sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "lb15.5-source" }],
    humanValidationRequired: false,
    humanValidated: false,
  };
}

function canonical(extensionMonths = 12, modificationPercent = 20): CanonicalExpedienteState {
  return {
    id: "LB15-5",
    lifecycleState: EstadoExpediente.VALOR_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de mantenimiento"),
      cpvMain: validated("cpvMain", "50000000-5"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: createPendingEvidenceField("estimatedValueCents"),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 15_870_588),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", extensionMonths),
      modificationPercent: validated("modificationPercent", modificationPercent),
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

describe("Bloque 15.5 - resolución inteligente de componentes económicos", () => {
  it("convierte 0 meses de prórroga en componente no aplicable sin inventar importe", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical(0, 20));
    const result = resolveEconomicComponents(expediente);
    expect(result.expediente.economic.extensionAmountExVatCents.status).toBe("NOT_APPLICABLE");
    expect(result.expediente.economic.extensionAmountExVatCents.value).toBeNull();
  });

  it("no extrapola una prórroga positiva desde su duración en meses", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical(24, 20));
    expediente.economic.initialEstimatedValueBaseCents = confirmed("economic.initialEstimatedValueBaseCents", 15_870_588);
    const result = resolveEconomicComponents(expediente);
    expect(result.expediente.economic.extensionAmountExVatCents.status).toBe("PENDING");
  });

  it("propone el importe de modificación desde porcentaje y base económica validados, con redondeo a céntimos", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical(12, 20));
    expediente.economic.initialEstimatedValueBaseCents = confirmed("economic.initialEstimatedValueBaseCents", 15_870_588);
    const result = resolveEconomicComponents(expediente);
    expect(result.expediente.economic.modificationAmountExVatCents.status).toBe("SYSTEM_PROPOSAL");
    expect(result.expediente.economic.modificationAmountExVatCents.value).toBe(3_174_118);
    expect(result.expediente.economic.modificationAmountExVatCents.humanValidationRequired).toBe(true);
  });

  it("convierte una modificación validada del 0% en componente no aplicable", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical(12, 0));
    const result = resolveEconomicComponents(expediente);
    expect(result.expediente.economic.modificationAmountExVatCents.status).toBe("NOT_APPLICABLE");
  });

  it("pide el importe económico de la prórroga, no el VE global, cuando ese es el único componente pendiente prioritario", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical(24, 0));
    expediente.economic.initialEstimatedValueBaseCents = confirmed("economic.initialEstimatedValueBaseCents", 15_870_588);
    expediente.economic.optionsAmountExVatCents = confirmed("economic.optionsAmountExVatCents", 0);
    expediente.economic.otherEstimatedValueComponentsCents = confirmed("economic.otherEstimatedValueComponentsCents", 0);

    const orchestrator = new UniversalAdaptiveOrchestrator(
      new UniversalAdaptiveQuestionEngine(),
      new UniversalAdaptiveActionExecutor(noOpEngine()),
      8,
      new UniversalEconomicAdaptiveBridge(),
    );
    const result = orchestrator.advance(expediente);
    expect(result.next.kind).toBe("ASK_USER");
    expect(result.next.fieldKey).toBe("economic.extensionAmountExVatCents");
    expect(result.next.id).toBe("ask:ve-extension-amount");
  });

  it("prioriza validar la propuesta de modificación antes de calcular el VE", () => {
    const expediente = createUniversalExpedienteFromCanonical(canonical(12, 20));
    expediente.economic.initialEstimatedValueBaseCents = confirmed("economic.initialEstimatedValueBaseCents", 15_870_588);
    expediente.economic.extensionAmountExVatCents = confirmed("economic.extensionAmountExVatCents", 15_870_588);
    expediente.economic.optionsAmountExVatCents = confirmed("economic.optionsAmountExVatCents", 0);
    expediente.economic.otherEstimatedValueComponentsCents = confirmed("economic.otherEstimatedValueComponentsCents", 0);

    const orchestrator = new UniversalAdaptiveOrchestrator(
      new UniversalAdaptiveQuestionEngine(),
      new UniversalAdaptiveActionExecutor(noOpEngine()),
      8,
      new UniversalEconomicAdaptiveBridge(),
    );
    const result = orchestrator.advance(expediente);
    expect(result.expediente.economic.modificationAmountExVatCents.value).toBe(3_174_118);
    expect(result.next.kind).toBe("VALIDATE_HUMAN");
    expect(result.next.fieldKey).toBe("economic.modificationAmountExVatCents");
  });
});
