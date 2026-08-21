import { describe, expect, it } from "vitest";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { buildUniversalDocumentContext } from "../src/engines/UniversalDocumentContextBuilder";
import { evaluateUniversalDocumentGeneration, requiredUniversalDomainsForDocument } from "../src/engines/UniversalDocumentGenerationGate";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "lb13-doc" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB13-DOC-001",
    lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA,
    blockers: [],
    warnings: [],
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

describe("Bloque 13 - frontera documental universal", () => {
  it("construye el DocumentContext desde la autoridad universal y marca su versión", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = buildUniversalDocumentContext(universal, new Date("2026-08-21T12:00:00Z"));

    expect(result.ready).toBe(true);
    expect(result.context?.version).toBe("UNIVERSAL-DOCUMENT-CONTEXT-13.1-v1");
    expect(result.context?.request.metadata.universalAuthority).toBe(true);
    expect(result.context?.request.metadata.universalSchemaVersion).toBe(universal.schemaVersion);
  });

  it("el PCAP exige dominios universales completos además del modelo documental", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = evaluateUniversalDocumentGeneration(
      universal,
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.selection.status).toBe("SELECTED");
    expect(result.ready).toBe(false);
    expect(result.blockers).toContain("Dominio universal requerido no completo para PCAP: economic");
    expect(result.blockers).toContain("Dominio universal requerido no completo para PCAP: guarantees");
    expect(result.blockers).toContain("Dominio universal requerido no completo para PCAP: criteria");
  });

  it("el PPT exige específicamente administración, técnica y lotes", () => {
    expect(requiredUniversalDomainsForDocument(DocumentType.PPT)).toEqual([
      "administrative",
      "technical",
      "lots",
    ]);
  });
});
