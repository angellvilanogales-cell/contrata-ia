import { describe, expect, it } from "vitest";
import { CanonicalExpedienteEngine } from "../src/engines/CanonicalExpedienteEngine";
import { UniversalExpedienteEngine } from "../src/engines/UniversalExpedienteEngine";
import { buildUniversalDocumentContext } from "../src/engines/UniversalDocumentContextBuilder";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import {
  BLOCK_13_STATUS,
  createUniversalExpedienteFromCanonical,
  UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION,
} from "../src/domain/expediente/UniversalExpedienteV13";
import { synchronizeCanonicalIntoUniversal } from "../src/domain/expediente/UniversalCanonicalSynchronization";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "lb13-closure", locator: key }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "EXP-LB13-CLOSURE",
    lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de mantenimiento"),
      cpvMain: validated("cpvMain", "50000000-5"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 10_000_000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 5_000_000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24),
      extensionMonths: validated("extensionMonths", 12),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: validated("awardCriteria", ["Precio", "Calidad"]),
      solvency: validated("solvency", ["Económica", "Técnica"]),
      publicity: validated("publicity", "PLACSP_Y_DOUE"),
    },
  };
}

describe("Bloque 13 - cierre definitivo del expediente universal", () => {
  it("publica un esquema estable 13.0.0 y estado de cierre", () => {
    expect(UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION).toBe("13.0.0");
    expect(BLOCK_13_STATUS).toBe("UNIVERSAL_EXPEDIENTE_STABLE");
  });

  it("sincroniza únicamente el valor estimado cuando el destino universal está pendiente", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = synchronizeCanonicalIntoUniversal(universal);

    expect(result.blockers).toEqual([]);
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(10_000_000);
    expect(result.expediente.economic.legalEstimatedValueCents.status).toBe("HUMAN_VALIDATED");
    expect(result.records).toContainEqual(expect.objectContaining({
      targetKey: "economic.legalEstimatedValueCents",
      status: "SYNCED_EXACT",
    }));
    expect(result.expediente.economic.maximumApprovedBudgetCents.status).toBe("PENDING");
  });

  it("declara no isomorfos PBL/presupuesto máximo, criterios, solvencia y lotes", () => {
    const result = synchronizeCanonicalIntoUniversal(createUniversalExpedienteFromCanonical(canonical()));
    const blockedTargets = result.records
      .filter(record => record.status === "BLOCKED_NON_ISOMORPHIC")
      .map(record => record.targetKey);

    expect(blockedTargets).toContain("economic.maximumApprovedBudgetCents");
    expect(blockedTargets).toContain("criteria.awardCriteria");
    expect(blockedTargets).toContain("criteria.economicSolvency/technicalSolvency");
    expect(blockedTargets).toContain("lots.lots");
  });

  it("bloquea una divergencia exacta de VE y conserva ambos valores para revisión humana", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 9_999_999);

    const result = synchronizeCanonicalIntoUniversal(universal);
    expect(result.blockers).toHaveLength(1);
    expect(result.records).toContainEqual(expect.objectContaining({ status: "BLOCKED_EXACT_DIVERGENCE" }));
    expect(result.expediente.canonical.fields.estimatedValueCents.value).toBe(10_000_000);
    expect(result.expediente.economic.legalEstimatedValueCents.value).toBe(9_999_999);
  });

  it("impide ejecutar motores heredados cuando existe divergencia universal/canónica", () => {
    let invoked = false;
    const legacy = {
      ejecutarIdentificacion: () => {
        invoked = true;
        throw new Error("No debe ejecutarse");
      },
      ejecutarRegimen: () => {
        invoked = true;
        throw new Error("No debe ejecutarse");
      },
    } as unknown as CanonicalExpedienteEngine;

    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 1);
    const result = new UniversalExpedienteEngine(legacy).ejecutarIdentificacion(universal);

    expect(invoked).toBe(false);
    expect(result.executed).toEqual([]);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("impide crear contexto documental cuando la vista de compatibilidad contradice la autoridad universal", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 1);

    const result = buildUniversalDocumentContext(universal);
    expect(result.ready).toBe(false);
    expect(result.blockers.some(blocker => blocker.includes("Divergencia"))).toBe(true);
  });
});
