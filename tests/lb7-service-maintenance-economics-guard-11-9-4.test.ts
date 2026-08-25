import { describe, expect, it } from "vitest";
import {
  MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT,
  MAINTENANCE_007_ECONOMICS_REGRESSION_VERSION,
} from "../src/regression/ServiceRegressionCase007MaintenanceSevilleEconomicsGuard";

const g = MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT;

describe("Paso 11.9.4 - guarda económica mantenimiento SAE Sevilla", () => {
  it("registra la guarda sin bloqueantes internos", () => {
    expect(MAINTENANCE_007_ECONOMICS_REGRESSION_VERSION).toBe("REG-SERVICE-007-MAINTENANCE-ECONOMICS-GUARD-11.9.4-v1");
    expect(g.caseId).toBe("REG-SERVICE-007");
    expect(g.step).toBe("11.9.4");
    expect(g.sourceStep).toBe("11.9.3");
    expect(g.passed).toBe(true);
    expect(g.blockers).toHaveLength(0);
    expect(g.checks).toHaveLength(12);
    expect(g.checks.every((check) => check.ok)).toBe(true);
  });

  it("protege los valores económicos declarados sin normalizar céntimos", () => {
    expect(g.protectedEconomicScope.declaredLotEstimatedValuesCents).toEqual([
      34_915_294,
      22_543_526,
      45_112_162,
      79_828_134,
    ]);
    expect(g.protectedEconomicScope.declaredGlobalEstimatedValueCents).toBe(182_399_114);
    expect(g.protectedEconomicScope.declaredTenderTotalExVatCents).toBe(82_908_688);
    expect(g.protectedEconomicScope.declaredModificationCents).toBe(16_581_738);
    expect(g.protectedEconomicScope.declaredExtensionCents).toBe(82_908_688);
    expect(g.sourceRoundingGuard.lot2DeclaredMinusArithmeticCents).toBe(1);
    expect(g.sourceRoundingGuard.lot4DeclaredMinusArithmeticCents).toBe(1);
    expect(g.sourceRoundingGuard.lotSumMinusDeclaredGlobalCents).toBe(2);
    expect(g.sourceRoundingGuard.treatment).toBe("PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT");
  });

  it("protege modificación, prórroga, anualidades y aplicación presupuestaria", () => {
    expect(g.protectedEconomicScope.modificationArticle204Percent).toBe(20);
    expect(g.protectedEconomicScope.extensionMonths).toBe(24);
    expect(g.protectedEconomicScope.annualitiesVatIncludedTotalCents).toBe(100_319_513);
    expect(g.protectedEconomicScope.budgetApplication).toBe("1439030000 G/32L/21200/41 01");
    expect(g.protectedEconomicScope.expenditureProcessing).toBe("ORDINARIA");
  });

  it("mantiene abiertos criterios, solvencia y el conflicto de lotes", () => {
    expect(g.deliberatelyStillOpen).toHaveLength(8);
    expect(g.deliberatelyStillOpen.some((x) => x.includes("criterios de adjudicación"))).toBe(true);
    expect(g.deliberatelyStillOpen.some((x) => x.includes("solvencia económica y técnica"))).toBe(true);
    expect(g.deliberatelyStillOpen.some((x) => x.includes("máximo de lotes ofertables"))).toBe(true);
    expect(g.promotionRule).toBe("NO_PROMOTION_WITHOUT_NEW_PRIMARY_EVIDENCE_AND_HUMAN_VALIDATION");
  });
});
