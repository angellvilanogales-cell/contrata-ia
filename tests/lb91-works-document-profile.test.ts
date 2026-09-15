import { describe, expect, it } from "vitest";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { selectCanonicalDocumentProfile } from "../src/engines/CanonicalDocumentProfileSelector";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";

const confirmed = <T>(key: string, value: T): EvidenceField<T> => ({
  key,
  value,
  status: "SOURCE_CONFIRMED",
  sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "test" }],
  humanValidationRequired: false,
  humanValidated: false,
});

function worksState(): CanonicalExpedienteState {
  return {
    id: "WORKS-TEST",
    lifecycleState: EstadoExpediente.BORRADOR,
    fields: {
      contractType: confirmed("contractType", "WORKS" as const),
      object: confirmed("object", "Obras de adecuación"),
      cpvMain: confirmed("cpvMain", "45000000-7"),
      lots: confirmed("lots", [] as readonly string[]),
      estimatedValueCents: confirmed("estimatedValueCents", 100_000_000),
      baseTenderBudgetCents: confirmed("baseTenderBudgetCents", 100_000_000),
      procedure: confirmed("procedure", "ABIERTO"),
      durationMonths: confirmed("durationMonths", 12),
      extensionMonths: confirmed("extensionMonths", 0),
      modificationPercent: confirmed("modificationPercent", 0),
      awardCriteria: confirmed("awardCriteria", ["precio"] as readonly string[]),
      solvency: confirmed("solvency", [] as readonly string[]),
    },
    blockers: [],
    warnings: [],
  };
}

describe("LB91.15 - perfil documental de obras", () => {
  it("registra una estructura real de PCAP de obras sin habilitar generación física", () => {
    const registry = createStandardContractDocumentProfiles();
    const profiles = registry.findAll("WORKS", DocumentType.PCAP);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]?.coverage).toBe("STRUCTURAL_MODEL");
    expect(profiles[0]?.generationAllowed).toBe(false);
  });

  it("permite seleccionar la estructura para análisis pero bloquea un FULL_MODEL inexistente", () => {
    const registry = createStandardContractDocumentProfiles();
    const structural = selectCanonicalDocumentProfile(worksState(), DocumentType.PCAP, registry, "STRUCTURAL_MODEL");
    const full = selectCanonicalDocumentProfile(worksState(), DocumentType.PCAP, registry, "FULL_MODEL");
    expect(structural.status).toBe("SELECTED");
    expect(structural.canGenerateFullDocument).toBe(false);
    expect(full.status).toBe("BLOCKED_BY_COVERAGE");
  });
});
