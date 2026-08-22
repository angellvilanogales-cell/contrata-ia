import { describe, expect, it } from "vitest";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { UniversalEconomicEngine } from "../src/engines/UniversalEconomicEngine";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb15-test" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function state(kind: "SERVICE" | "SUPPLY"): CanonicalExpedienteState {
  return {
    id: `LB15-${kind}`,
    lifecycleState: EstadoExpediente.OBJETO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", kind),
      object: validated("object", "Objeto económico de prueba"),
      cpvMain: validated("cpvMain", "00000000-0"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: createPendingEvidenceField("estimatedValueCents"),
      baseTenderBudgetCents: createPendingEvidenceField("baseTenderBudgetCents"),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 12),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: validated("awardCriteria", []),
      solvency: validated("solvency", []),
    },
  };
}

describe("Bloque 15.3 - motor económico sobre expediente universal", () => {
  it("propone VE simultáneamente en la autoridad universal y su vista canónica exacta", () => {
    const expediente = createUniversalExpedienteFromCanonical(state("SERVICE"));
    const result = new UniversalEconomicEngine().calculateAndApply(expediente, {
      contractKind: "SERVICE",
      initialAmountExVatCents: 10_000_000,
      extensionAmountExVatCents: 10_000_000,
      modificationAmountExVatCents: 2_000_000,
    });

    expect(result.blockers).toEqual([]);
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(22_000_000);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("SYSTEM_PROPOSAL");
    expect(result.expediente.canonical.fields.estimatedValueCents.value).toBe(22_000_000);
    expect(result.expediente.canonical.fields.estimatedValueCents.status).toBe("SYSTEM_PROPOSAL");
    expect(result.expediente.traceability.sourceRegistry.some(source => source.sourceId === "UniversalEconomicEngine:VE")).toBe(true);
  });

  it("no sustituye un VE declarado aunque el cálculo aritmético difiera", () => {
    const expediente = createUniversalExpedienteFromCanonical(state("SERVICE"));
    expediente.canonical.fields.estimatedValueCents = validated("estimatedValueCents", 10_001);
    expediente.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 10_001);

    const result = new UniversalEconomicEngine().calculateAndApply(expediente, {
      contractKind: "SERVICE",
      initialAmountExVatCents: 10_000,
    });

    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(10_001);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("HUMAN_VALIDATED");
    expect(result.expediente.economic.legalEstimatedValueCents.diagnostics?.some(item => item.includes("diferencia 1 céntimos"))).toBe(true);
  });

  it("bloquea un cálculo cuyo tipo económico contradice la naturaleza contractual", () => {
    const expediente = createUniversalExpedienteFromCanonical(state("SERVICE"));
    const result = new UniversalEconomicEngine().calculateAndApply(expediente, {
      contractKind: "SUPPLY",
      initialAmountExVatCents: 10_000,
    });

    expect(result.executed).toEqual([]);
    expect(result.blockers[0]).toContain("no coincide");
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("PENDING");
  });

  it("bloquea mientras exista conflicto de fuente sobre el VE", () => {
    const expediente = createUniversalExpedienteFromCanonical(state("SERVICE"));
    expediente.economic.legalEstimatedValueCents = {
      key: "economic.legalEstimatedValueCents",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [
        { kind: "PRIMARY_DOCUMENT", sourceId: "PCAP" },
        { kind: "PRIMARY_DOCUMENT", sourceId: "MEMORIA" },
      ],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: { statements: ["10.000 €", "10.001 €"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };

    const result = new UniversalEconomicEngine().calculateAndApply(expediente, {
      contractKind: "SERVICE",
      initialAmountExVatCents: 10_000,
    });

    expect(result.executed).toEqual([]);
    expect(result.blockers).toContain("No puede ejecutarse el motor económico mientras exista un conflicto de fuente sobre el valor estimado.");
  });
});
