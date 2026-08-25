import { describe, expect, it } from "vitest";
import {
  REPOSITORY_CAPABILITY_INVENTORY,
  getCapabilityInventory,
  getMissingUniversalCapabilities,
} from "../src/domain/capabilities/RepositoryCapabilityInventory";

describe("LB91.3/19 - inventario antes de crear motores", () => {
  it("cubre una sola vez cada capacidad universal", () => {
    const names = REPOSITORY_CAPABILITY_INVENTORY.map(item => item.capability);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBe(16);
  });

  it("reutiliza motores saneados y perfiles familiares en lugar de crear rutas paralelas", () => {
    expect(getCapabilityInventory("PROCEDURE").universalComponent).toBe("ProcedimientoEngine");
    expect(getCapabilityInventory("CPV").universalComponent).toBe("CPVEngine");
    expect(getCapabilityInventory("ECONOMICS").universalComponent).toContain("UniversalEconomicEngine");
    expect(getCapabilityInventory("ECONOMICS").existingAssets).toContain("src/engines/UniversalWorksEconomicEngine.ts");
    expect(getCapabilityInventory("ECONOMICS").existingAssets).toContain("src/engines/UniversalConcessionEconomicEngine.ts");
    expect(getCapabilityInventory("LOTS").universalComponent).toBe("UniversalLotsEngine");
    expect(getCapabilityInventory("AWARD_CRITERIA").universalComponent).toBe("UniversalAwardCriteriaEngine");
    expect(getCapabilityInventory("GUARANTEES").universalComponent).toBe("UniversalGuaranteeEngine");
    expect(getCapabilityInventory("EXECUTION").universalComponent).toBe("UniversalExecutionEngine");
    expect(getCapabilityInventory("MODIFICATIONS").universalComponent).toBe("UniversalModificationEngine");
    expect(getCapabilityInventory("PRICE_REVISION").universalComponent).toBe("UniversalPriceRevisionEngine");
    expect(getCapabilityInventory("REMEDIES").universalComponent).toBe("UniversalRemediesEngine");
    expect(getCapabilityInventory("CROSS_DOCUMENT_AUDIT").universalComponent).toBe("UniversalAdministrativePackageAudit");
  });

  it("no deja catálogos o motores especializados como sustitutos de los módulos universales", () => {
    expect(REPOSITORY_CAPABILITY_INVENTORY.every(item => item.disposition !== "KNOWLEDGE_ONLY" && item.disposition !== "SPECIALIZED_REFERENCE")).toBe(true);
  });

  it("cierra el inventario técnico sin confundirlo con cobertura documental operativa", () => {
    expect(getMissingUniversalCapabilities()).toEqual([]);
    const editable = getCapabilityInventory("EDITABLE_DOCUMENT_GENERATION");
    expect(editable.universalComponent).toBe("UniversalPhysicalDocumentGenerationGate");
    expect(editable.constraints[0]).toContain("FULL_MODEL");
    expect(editable.constraints[0]).toContain("ODT/DOCX verificado");
  });
});
