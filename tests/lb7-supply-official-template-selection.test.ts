import { describe, expect, it } from "vitest";
import { SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT } from "../src/interfaces/lb7/SupplyOfficialTemplateSelectionScript";
import { SUPPLY_FINALIZATION_SCRIPT } from "../src/interfaces/lb7/SupplyFinalizationScript";

describe("selección del modelo oficial de suministro", () => {
  it("identifica el modelo exacto para suministro abreviado autofinanciado", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("JDA-PCAP-SUPPLY-OSA-SELF-2025-12");
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("Procedimiento abierto simplificado abreviado");
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("Autofinanciado");
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt");
  });

  it("bloquea plantillas genéricas y exige validación humana", () => {
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("no se utilizará una plantilla genérica");
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("Validación humana obligatoria");
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("validateSupplyOfficialTemplate");
  });

  it("queda integrado después del mapeo documental", () => {
    expect(SUPPLY_FINALIZATION_SCRIPT).toContain("6. Selección y verificación del modelo oficial DPCAF / PCAP");
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("supplyDocumentMappingValidated===true");
    expect(SUPPLY_OFFICIAL_TEMPLATE_SELECTION_SCRIPT).toContain("OFFICIAL_MODEL_VALIDATED_READY_FOR_PARAMETERIZATION");
  });
});
