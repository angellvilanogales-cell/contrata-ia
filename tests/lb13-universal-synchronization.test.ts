import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { synchronizeCanonicalIntoUniversal } from "../src/domain/expediente/UniversalCanonicalSynchronization";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "sync-source", locator: key }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "EXP-13-SYNC",
    lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SUPPLY"),
      object: validated("object", "Suministro por necesidades"),
      cpvMain: validated("cpvMain", "44316000-8"),
      lots: validated("lots", ["Lote 1", "Lote 2"]),
      estimatedValueCents: validated("estimatedValueCents", 12345678),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 9000000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24),
      extensionMonths: validated("extensionMonths", 12),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: validated("awardCriteria", ["Precio", "Calidad"]),
      solvency: validated("solvency", ["Solvencia general"]),
      publicity: validated("publicity", "PLACSP_Y_DOUE"),
    },
  };
}

describe("Bloque 13 - sincronización segura entre compatibilidad y universal", () => {
  it("sincroniza únicamente el VE jurídico cuando el destino está pendiente y conserva la evidencia", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = synchronizeCanonicalIntoUniversal(universal);

    expect(result.blockers).toEqual([]);
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(12345678);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("HUMAN_VALIDATED");
    expect(result.expediente.economic.legalEstimatedValueCents.sources).toEqual(
      universal.canonical.fields.estimatedValueCents.sources,
    );
    expect(result.records.some(record => record.status === "SYNCED_EXACT")).toBe(true);
  });

  it("no convierte el PBL en presupuesto máximo aprobado", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = synchronizeCanonicalIntoUniversal(universal);

    expect(result.expediente.economic.maximumApprovedBudgetCents.status).toBe("PENDING");
    expect(result.expediente.economic.maximumApprovedBudgetCents.value).toBeNull();
    expect(result.records).toContainEqual(expect.objectContaining({
      targetKey: "economic.maximumApprovedBudgetCents",
      status: "BLOCKED_NON_ISOMORPHIC",
    }));
  });

  it("no fabrica criterios estructurados a partir de nombres antiguos", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = synchronizeCanonicalIntoUniversal(universal);

    expect(result.expediente.criteria.awardCriteria.status).toBe("PENDING");
    expect(result.expediente.criteria.awardCriteria.value).toBeNull();
    expect(result.records).toContainEqual(expect.objectContaining({
      targetKey: "criteria.awardCriteria",
      status: "BLOCKED_NON_ISOMORPHIC",
    }));
  });

  it("bloquea una divergencia de VE sin sobrescribir la evidencia universal", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.economic.legalEstimatedValueCents = validated(
      "economic.legalEstimatedValueCents",
      12345679,
    );

    const result = synchronizeCanonicalIntoUniversal(universal);

    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(12345679);
    expect(result.blockers).toHaveLength(1);
    expect(result.blockers[0]).toContain("Divergencia entre VE canónico");
    expect(result.records).toContainEqual(expect.objectContaining({
      status: "BLOCKED_EXACT_DIVERGENCE",
    }));
  });

  it("considera alineadas dos evidencias exactas con el mismo valor sin sustituir la evidencia universal", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const ownUniversalEvidence = validated("economic.legalEstimatedValueCents", 12345678);
    universal.economic.legalEstimatedValueCents = ownUniversalEvidence;

    const result = synchronizeCanonicalIntoUniversal(universal);

    expect(result.blockers).toEqual([]);
    expect(result.expediente.economic.legalEstimatedValueCents).toBe(ownUniversalEvidence);
    expect(result.records).toContainEqual(expect.objectContaining({ status: "ALIGNED_EXACT" }));
  });
});
