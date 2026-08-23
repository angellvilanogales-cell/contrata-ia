import { describe, expect, it } from "vitest";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import {
  evaluateSupplyAsaProtectedPipelineReadiness,
  JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD,
} from "../src/application/intake/lb29/UniversalSupplyAsaProtectedPipeline";
import { JDA_SUPPLY_ASA_VERIFIED_MANIFEST } from "../src/application/intake/lb25/JuntaSupplyAsaOfficialActivation";
import { JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET } from "../src/application/intake/lb34/JuntaSupplyAsaModificationSection";

function pendingCanonical(): CanonicalExpedienteState {
  return {
    id: "LB29-PENDING",
    lifecycleState: EstadoExpediente.BORRADOR,
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
      modificationPercent: createPendingEvidenceField("modificationPercent"),
      awardCriteria: createPendingEvidenceField("awardCriteria"),
      solvency: createPendingEvidenceField("solvency"),
      publicity: createPendingEvidenceField("publicity"),
    },
    blockers: [],
    warnings: [],
  };
}

describe("LB29/LB34 - pipeline universal protegido suministro ASA", () => {
  it("registra el activo oficial exacto con el inventario físico final", () => {
    expect(JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.status).toBe("HUMAN_VALIDATED");
    expect(JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.templateId).toBe(JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId);
    expect(JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.contentHash).toBe(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash);
    expect(JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.styleFingerprint).toBe(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint);
    expect(JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.slotIds).toEqual(JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.slotIds);
    expect(JDA_SUPPLY_ASA_PRODUCTION_REGISTRY_RECORD.slotIds).toContain("pcap.anexoI.14.da33.limites");
  });

  it("bloquea expedientes incompletos antes de considerar bytes o generación", () => {
    const expediente = createUniversalExpedienteFromCanonical(pendingCanonical());
    const result = evaluateSupplyAsaProtectedPipelineReadiness(expediente, "2026-08-23", true);
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_UNIVERSAL_EVIDENCE");
    expect(result.blockers.length).toBeGreaterThan(0);
    expect(result.legacyGenerationAllowed).toBe(false);
  });

  it("no tiene fallback legacy aunque falten los requisitos de producción", () => {
    const expediente = createUniversalExpedienteFromCanonical(pendingCanonical());
    const withoutBinary = evaluateSupplyAsaProtectedPipelineReadiness(expediente, "2026-08-23", false);
    expect(withoutBinary.legacyGenerationAllowed).toBe(false);
    expect(withoutBinary.ready).toBe(false);
  });

  it("rechaza una fecha anterior a la vigencia registrada del modelo", () => {
    const expediente = createUniversalExpedienteFromCanonical(pendingCanonical());
    const result = evaluateSupplyAsaProtectedPipelineReadiness(expediente, "2025-12-16", true);
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_OFFICIAL_TEMPLATE");
    expect(result.blockers.join(" ")).toMatch(/No existe modelo oficial validado y vigente/i);
  });
});
