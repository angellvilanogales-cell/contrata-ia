import { describe, expect, it } from "vitest";
import { calculateUniversalEconomics } from "../src/domain/economic/UniversalEconomicCalculation";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS as CASE007 } from "../src/regression/ServiceRegressionCase007MaintenanceSevilleEconomics";

describe("Bloque 15.6 - auditoría económica por lotes", () => {
  const source = CASE007.estimatedValue;
  const input = {
    contractKind: "SERVICE" as const,
    initialAmountExVatCents: source.declaredTotals.tenderAmountExVatCents,
    extensionAmountExVatCents: source.declaredTotals.extensionCents,
    modificationAmountExVatCents: source.declaredTotals.modificationCents,
    declaredEstimatedValueCents: source.declaredTotals.estimatedValueCents,
    lots: source.lots.map(lot => ({
      lotId: String(lot.lot),
      initialAmountExVatCents: lot.tenderAmountExVatCents,
      extensionAmountExVatCents: lot.extensionCents,
      modificationAmountExVatCents: lot.modificationCents,
      declaredEstimatedValueCents: lot.declaredEstimatedValueCents,
    })),
  };

  it("suma de forma independiente los componentes de los cuatro lotes", () => {
    const result = calculateUniversalEconomics(input);
    expect(result.lotComponentTotals).toEqual({
      initialAmountExVatCents: 82_908_688,
      extensionAmountExVatCents: 82_908_688,
      modificationAmountExVatCents: 16_581_738,
      optionsAmountExVatCents: 0,
      otherEstimatedValueComponentsCents: 0,
      arithmeticEstimatedValueCents: 182_399_114,
    });
  });

  it("preserva los VE declarados de los lotes 2 y 4 pese a la diferencia de un céntimo", () => {
    const result = calculateUniversalEconomics(input);
    expect(result.lots[1].declaredEstimatedValueCents).toBe(22_543_526);
    expect(result.lots[1].arithmeticEstimatedValueCents).toBe(22_543_525);
    expect(result.lots[1].diagnostic?.declaredMinusArithmeticCents).toBe(1);
    expect(result.lots[1].diagnostic?.treatment).toBe("PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT");
    expect(result.lots[3].declaredEstimatedValueCents).toBe(79_828_134);
    expect(result.lots[3].arithmeticEstimatedValueCents).toBe(79_828_133);
    expect(result.lots[3].diagnostic?.declaredMinusArithmeticCents).toBe(1);
  });

  it("conserva simultáneamente el VE global declarado y la suma declarada de lotes con diferencia de dos céntimos", () => {
    const result = calculateUniversalEconomics(input);
    expect(result.selectedEstimatedValueCents).toBe(182_399_114);
    expect(result.selectedValueOrigin).toBe("DECLARED_SOURCE");
    expect(result.lotDeclaredSumCents).toBe(182_399_116);
    expect(result.lotDeclaredSumDiagnostic?.declaredMinusArithmeticCents).toBe(-2);
    expect(result.lotDeclaredSumDiagnostic?.treatment).toBe("PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT");
  });

  it("mantiene separada la comprobación aritmética por componentes de la suma de VE declarados por lote", () => {
    const result = calculateUniversalEconomics(input);
    expect(result.lotComponentTotals?.arithmeticEstimatedValueCents).toBe(182_399_114);
    expect(result.lotDeclaredSumCents).toBe(182_399_116);
    expect(result.diagnostics.some(message => message.includes("comprobación aritmética independiente"))).toBe(true);
  });
});
