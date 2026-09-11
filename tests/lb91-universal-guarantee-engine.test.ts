import { describe, expect, it } from "vitest";
import { UniversalGuaranteeEngine } from "../src/engines/UniversalGuaranteeEngine";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";

const engine = new UniversalGuaranteeEngine();

describe("LB91.4 - garantías universales conservadoras", () => {
  it("mantiene la garantía provisional como excepción motivada con máximo legal", () => {
    const result = engine.evaluate({
      contractType: "SUPPLY",
      procedure: TipoProcedimiento.ABIERTO,
      contractingEntityIsPublicAdministration: true,
      bestOfferPriceExVatCents: 1_000_000,
    });
    expect(result.provisional.defaultRequired).toBe(false);
    expect(result.provisional.exceptionalMaximumPercent).toBe(3);
  });

  it("no exige garantía definitiva en el abierto simplificado abreviado", () => {
    const result = engine.evaluate({
      contractType: "SUPPLY",
      procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO,
      contractingEntityIsPublicAdministration: true,
    });
    expect(result.definitive.required).toBe(false);
    expect(result.definitive.state).toBe("DETERMINED_BY_LAW");
  });

  it("calcula el 5% ordinario sobre PBL sin IVA cuando hay precios unitarios", () => {
    const result = engine.evaluate({
      contractType: "SUPPLY",
      procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO,
      contractingEntityIsPublicAdministration: true,
      priceUsesUnitPrices: true,
      baseTenderBudgetExVatCents: 1_000_000,
    });
    expect(result.definitive.calculationBasis).toBe("BASE_TENDER_BUDGET_EX_VAT");
    expect(result.definitive.amountCents).toBe(50_000);
  });

  it("no aplica el 5% ordinario a concesiones", () => {
    const result = engine.evaluate({
      contractType: "CONCESSION",
      procedure: TipoProcedimiento.ABIERTO,
      contractingEntityIsPublicAdministration: true,
    });
    expect(result.definitive.calculationBasis).toBe("CONCESSION_PCAC_DECISION");
    expect(result.definitive.ordinaryPercent).toBeUndefined();
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("impide tratar una entidad no Administración como si estuviera en arts. 106-107", () => {
    const result = engine.evaluate({
      contractType: "SERVICE",
      procedure: TipoProcedimiento.ABIERTO,
      contractingEntityIsPublicAdministration: false,
    });
    expect(result.definitive.legalBasis).toContain("art. 114 LCSP");
    expect(result.blockers.length).toBeGreaterThan(0);
  });
});
