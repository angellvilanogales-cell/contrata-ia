import { describe, expect, it } from "vitest";
import { UniversalAdaptiveActionExecutor, UniversalAdaptiveEnginePort } from "../src/application/intake/lb14/UniversalAdaptiveActionExecutor";
import { UniversalAdaptiveOrchestrator } from "../src/application/intake/lb14/UniversalAdaptiveOrchestrator";
import { UniversalAdaptiveQuestionEngine } from "../src/application/intake/lb14/UniversalAdaptiveQuestionEngine";
import { UniversalEconomicAdaptiveBridge } from "../src/application/intake/lb14/UniversalEconomicAdaptiveBridge";
import { buildEconomicInputFromUniversal } from "../src/domain/economic/UniversalEconomicInputBuilder";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField, createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";
import { UniversalEngineRunResult } from "../src/engines/UniversalExpedienteEngine";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb15.4" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function confirmed<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "SOURCE_CONFIRMED",
    sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "economic-source" }],
    humanValidationRequired: false,
    humanValidated: false,
  };
}

function notApplicable(key: string): EvidenceField<number> {
  return {
    key,
    value: null,
    status: "NOT_APPLICABLE",
    sources: [{ kind: "USER_INPUT", sourceId: "lb15.4-na" }],
    humanValidationRequired: false,
    humanValidated: false,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB15-ADAPTIVE-001",
    lifecycleState: EstadoExpediente.VALOR_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de mantenimiento"),
      cpvMain: validated("cpvMain", "50000000-5"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: createPendingEvidenceField("estimatedValueCents"),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 10_000_000),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 12),
      modificationPercent: validated("modificationPercent", 10),
      awardCriteria: validated("awardCriteria", []),
      solvency: validated("solvency", []),
      publicity: validated("publicity", "PENDING_PROCEDURE"),
    },
  };
}

function withComponents(): UniversalExpedienteV13 {
  const expediente = createUniversalExpedienteFromCanonical(canonical());
  return {
    ...expediente,
    economic: {
      ...expediente.economic,
      initialEstimatedValueBaseCents: confirmed("economic.initialEstimatedValueBaseCents", 10_000_000),
      extensionAmountExVatCents: confirmed("economic.extensionAmountExVatCents", 10_000_000),
      modificationAmountExVatCents: confirmed("economic.modificationAmountExVatCents", 1_000_000),
      optionsAmountExVatCents: notApplicable("economic.optionsAmountExVatCents"),
      otherEstimatedValueComponentsCents: notApplicable("economic.otherEstimatedValueComponentsCents"),
    },
  };
}

function noOpEngine(): UniversalAdaptiveEnginePort {
  return {
    ejecutarIdentificacion(expediente): UniversalEngineRunResult {
      return { expediente, executed: [], blockers: ["No configurado para esta prueba"] };
    },
    resolverPlazos(expediente): UniversalEngineRunResult {
      return { expediente, executed: [], blockers: ["No configurado para esta prueba"] };
    },
  };
}

describe("Bloque 15.4 - puente económico con el flujo adaptativo", () => {
  it("construye la entrada económica solo cuando todos los componentes necesarios están disponibles", () => {
    const result = buildEconomicInputFromUniversal(withComponents());
    expect(result.ready).toBe(true);
    expect(result.input?.initialAmountExVatCents).toBe(10_000_000);
    expect(result.input?.extensionAmountExVatCents).toBe(10_000_000);
    expect(result.input?.modificationAmountExVatCents).toBe(1_000_000);
    expect(result.input?.optionsAmountExVatCents).toBe(0);
    expect(result.input?.otherEstimatedValueComponentsCents).toBe(0);
  });

  it("no calcula si falta un componente económico y enumera exactamente el dato ausente", () => {
    const expediente = withComponents();
    expediente.economic.extensionAmountExVatCents = createPendingEvidenceField("economic.extensionAmountExVatCents");
    const result = buildEconomicInputFromUniversal(expediente);
    expect(result.ready).toBe(false);
    expect(result.missingFields).toContain("economic.extensionAmountExVatCents");
  });

  it("ejecuta el motor económico antes de preguntar el VE y se detiene para validarlo", () => {
    const orchestrator = new UniversalAdaptiveOrchestrator(
      new UniversalAdaptiveQuestionEngine(),
      new UniversalAdaptiveActionExecutor(noOpEngine()),
      8,
      new UniversalEconomicAdaptiveBridge(),
    );

    const result = orchestrator.advance(withComponents());

    expect(result.automaticSteps[0].engine).toBe("UniversalEconomicEngine");
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(21_000_000);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("SYSTEM_PROPOSAL");
    expect(result.expediente.canonical.fields.estimatedValueCents.value).toBe(21_000_000);
    expect(result.next.kind).toBe("VALIDATE_HUMAN");
    expect(result.next.fieldKey).toBe("economic.legalEstimatedValueCents");
    expect(result.blockers).toEqual([]);
  });

  it("si los componentes no bastan, el puente no inventa el VE", () => {
    const expediente = withComponents();
    expediente.economic.modificationAmountExVatCents = createPendingEvidenceField("economic.modificationAmountExVatCents");
    const result = new UniversalEconomicAdaptiveBridge().tryAdvance(expediente);
    expect(result.executed).toBe(false);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("PENDING");
    expect(result.missingFields).toContain("economic.modificationAmountExVatCents");
  });
});
