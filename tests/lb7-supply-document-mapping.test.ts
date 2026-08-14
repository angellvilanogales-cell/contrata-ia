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
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("supplyCatalogueProjectedTotalConsumptionExVat");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("supplyMaximumApprovedBudgetExVat");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("Valor estimado: pendiente de cálculo jurídico final");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("Solvencia y garantías");
  });

  it("does not treat the legacy cleaning generator as a supply template", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("modelo recomendado oficial vigente");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("no genera todavía el PCAP completo");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("READY_FOR_OFFICIAL_TEMPLATE_SELECTION");
  });

  it("keeps price-only award criteria as a case-specific motivated option", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("Precio como criterio único: motivación reforzada disponible");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("CONTR/2026/240267");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("145.3.f");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("CASE_SPECIFIC_MOTIVATION_REQUIRES_FINAL_LEGAL_CHECK");
  });

  it("uses the validated Spanish-number parser for lot subtotals", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("function parseNumber");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("function lotAmount");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("subtotal=Number(c.total)");
  });

  it("maps needs-based budget and modification safeguards", () => {
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("presupuesto máximo aprobado opera como límite económico para toda la vigencia");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("una prórroga no produce incremento automático del presupuesto");
    expect(SUPPLY_DOCUMENT_MAPPING_SCRIPT).toContain("no se incorporarán nuevos artículos con precios unitarios no previstos");
  });
});
