import { describe, expect, it } from "vitest";
import { SUPPLY_DOCUMENT_MAPPING_SCRIPT } from "../src/interfaces/lb7/SupplyDocumentMappingScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("LB-7 supply document mapping", () => {
  it("opens only after document preparation validation", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain('supplyDocumentPreparationStatus==="READY_FOR_TEMPLATE_MAPPING"');
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("SUPPLY_DOCUMENT_MAPPING_SCRIPT");
  });

  it("maps the single source of truth to Memoria, PCAP and PPT", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("Memoria justificativa");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("PCAP · Anexo I y cláusulas variables");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("PPT · prescripciones y anexo de artículos");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("referencias que se incorporarán al anexo técnico");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("supplyCatalogueProjectedEstimatedValueExVat");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("supplyPcapLegalDraft").toBe(false);
  });

  it("does not treat the legacy cleaning generator as a supply template", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("modelo recomendado oficial vigente");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("no genera todavía el PCAP completo");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("READY_FOR_OFFICIAL_TEMPLATE_SELECTION");
  });

  it("keeps price-only award criteria under legal verification", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("Control jurídico pendiente sobre el criterio único de precio");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("pluralidad de criterios automáticos");
  });
});
