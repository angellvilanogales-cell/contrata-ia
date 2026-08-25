import { describe, expect, it } from "vitest";
import {
  REPOSITORY_CAPABILITY_INVENTORY,
  getCapabilityInventory,
  getMissingUniversalCapabilities,
} from "../src/domain/capabilities/RepositoryCapabilityInventory";

describe("LB91.3 - inventario antes de crear motores", () => {
  it("cubre una sola vez cada capacidad universal", () => {
    const names = REPOSITORY_CAPABILITY_INVENTORY.map(item => item.capability);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBe(16);
  });

  it("reutiliza motores saneados en lugar de crear duplicados", () => {
    expect(getCapabilityInventory("PROCEDURE").universalComponent).toBe("ProcedimientoEngine");
    expect(getCapabilityInventory("CPV").universalComponent).toBe("CPVEngine");
    expect(getCapabilityInventory("ECONOMICS").universalComponent).toBe("UniversalEconomicEngine");
  });

  it("no promociona catálogos o motores especializados como universales", () => {
    expect(getCapabilityInventory("AWARD_CRITERIA").disposition).toBe("KNOWLEDGE_ONLY");
    expect(getCapabilityInventory("GUARANTEES").disposition).toBe("SPECIALIZED_REFERENCE");
    expect(getCapabilityInventory("EXECUTION").disposition).toBe("KNOWLEDGE_ONLY");
  });

  it("mantiene visibles los huecos universales prioritarios", () => {
    const missing = getMissingUniversalCapabilities().map(item => item.capability);
    expect(missing).toContain("REMEDIES");
    expect(missing).toContain("PRICE_REVISION");
    expect(missing).toContain("AWARD_CRITERIA");
    expect(missing).toContain("GUARANTEES");
  });
});
