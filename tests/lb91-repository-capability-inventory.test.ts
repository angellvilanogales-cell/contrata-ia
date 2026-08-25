import { describe, expect, it } from "vitest";
import {
  REPOSITORY_CAPABILITY_INVENTORY,
  getCapabilityInventory,
  getMissingUniversalCapabilities,
} from "../src/domain/capabilities/RepositoryCapabilityInventory";

describe("LB91.3/10 - inventario antes de crear motores", () => {
  it("cubre una sola vez cada capacidad universal", () => {
    const names = REPOSITORY_CAPABILITY_INVENTORY.map(item => item.capability);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBe(16);
  });

  it("reutiliza motores saneados en lugar de crear duplicados", () => {
    expect(getCapabilityInventory("PROCEDURE").universalComponent).toBe("ProcedimientoEngine");
    expect(getCapabilityInventory("CPV").universalComponent).toBe("CPVEngine");
    expect(getCapabilityInventory("ECONOMICS").universalComponent).toBe("UniversalEconomicEngine");
    expect(getCapabilityInventory("LOTS").universalComponent).toBe("UniversalLotsEngine");
    expect(getCapabilityInventory("AWARD_CRITERIA").universalComponent).toBe("UniversalAwardCriteriaEngine");
    expect(getCapabilityInventory("GUARANTEES").universalComponent).toBe("UniversalGuaranteeEngine");
    expect(getCapabilityInventory("MODIFICATIONS").universalComponent).toBe("UniversalModificationEngine");
    expect(getCapabilityInventory("PRICE_REVISION").universalComponent).toBe("UniversalPriceRevisionEngine");
    expect(getCapabilityInventory("REMEDIES").universalComponent).toBe("UniversalRemediesEngine");
  });

  it("no promociona el catálogo de ejecución como motor universal", () => {
    expect(getCapabilityInventory("EXECUTION").disposition).toBe("KNOWLEDGE_ONLY");
  });

  it("reduce los huecos de motor universal al ámbito todavía no consolidado", () => {
    const missing = getMissingUniversalCapabilities().map(item => item.capability);
    expect(missing).toEqual(["EXECUTION"]);
  });
});
