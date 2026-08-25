import { describe, expect, it } from "vitest";
import { calculateUniversalEconomics } from "../src/domain/economic/UniversalEconomicCalculation";

describe("Bloque 15.1 - núcleo económico determinista", () => {
  it("calcula VE aritmético sumando solo componentes económicos explícitos", () => {
    const result = calculateUniversalEconomics({
      contractKind: "SERVICE",
      initialAmountExVatCents: 10_000_000,
      extensionAmountExVatCents: 10_000_000,
      modificationAmountExVatCents: 2_000_000,
      optionsAmountExVatCents: 500_000,
    });

    expect(result.arithmeticEstimatedValueCents).toBe(22_500_000);
    expect(result.selectedEstimatedValueCents).toBe(22_500_000);
    expect(result.selectedValueOrigin).toBe("DERIVED_CALCULATION");
  });

  it("preserva el VE declarado y convierte la diferencia en diagnóstico sin autocorregir", () => {
    const result = calculateUniversalEconomics({
      contractKind: "SERVICE",
      initialAmountExVatCents: 82_908_688,
      extensionAmountExVatCents: 82_908_688,
      modificationAmountExVatCents: 16_581_738,
      declaredEstimatedValueCents: 182_399_114,
    });

    expect(result.arithmeticEstimatedValueCents).toBe(182_399_114);
    expect(result.selectedEstimatedValueCents).toBe(182_399_114);
    expect(result.selectedValueOrigin).toBe("DECLARED_SOURCE");
    expect(result.diagnostic).toBeUndefined();
  });

  it("preserva diferencias de redondeo por lote y entre suma de lotes y total declarado", () => {
    const result = calculateUniversalEconomics({
      contractKind: "SERVICE",
      initialAmountExVatCents: 82_908_688,
      extensionAmountExVatCents: 82_908_688,
      modificationAmountExVatCents: 16_581_738,
      declaredEstimatedValueCents: 182_399_114,
      lots: [
        { lotId: "1", initialAmountExVatCents: 15_870_588, extensionAmountExVatCents: 15_870_588, modificationAmountExVatCents: 3_174_118, declaredEstimatedValueCents: 34_915_294 },
        { lotId: "2", initialAmountExVatCents: 10_247_057, extensionAmountExVatCents: 10_247_057, modificationAmountExVatCents: 2_049_411, declaredEstimatedValueCents: 22_543_526 },
        { lotId: "3", initialAmountExVatCents: 20_505_528, extensionAmountExVatCents: 20_505_528, modificationAmountExVatCents: 4_101_106, declaredEstimatedValueCents: 45_112_162 },
        { lotId: "4", initialAmountExVatCents: 36_285_515, extensionAmountExVatCents: 36_285_515, modificationAmountExVatCents: 7_257_103, declaredEstimatedValueCents: 79_828_134 },
      ],
    });

    expect(result.lots[1].diagnostic?.declaredMinusArithmeticCents).toBe(1);
    expect(result.lots[3].diagnostic?.declaredMinusArithmeticCents).toBe(1);
    expect(result.lotDeclaredSumCents).toBe(182_399_116);
    expect(result.lotDeclaredSumDiagnostic?.declaredMinusArithmeticCents).toBe(-2);
    expect(result.selectedEstimatedValueCents).toBe(182_399_114);
  });

  it("mantiene presupuesto máximo y consumos de suministros fuera de la aritmética del VE", () => {
    const result = calculateUniversalEconomics({
      contractKind: "SUPPLY",
      initialAmountExVatCents: 4_000_000,
      extensionAmountExVatCents: 1_000_000,
      maximumApprovedBudgetCents: 6_000_000,
      referenceConsumption: "consumo histórico 2025",
      projectedConsumption: "proyección 24 meses",
    });

    expect(result.arithmeticEstimatedValueCents).toBe(5_000_000);
    expect(result.supplyNeeds?.maximumApprovedBudgetCents).toBe(6_000_000);
    expect(result.supplyNeeds?.excludedFromEstimatedValueArithmetic).toBe(true);
  });

  it("no extrapola el importe de una prórroga desde meses", () => {
    const result = calculateUniversalEconomics({
      contractKind: "SERVICE",
      initialAmountExVatCents: 5_000_000,
    });

    expect(result.arithmeticEstimatedValueCents).toBe(5_000_000);
    expect(result.diagnostics.some(item => item.includes("nunca se extrapolan automáticamente"))).toBe(true);
  });

  it("rechaza cantidades monetarias negativas o fraccionarias en céntimos", () => {
    expect(() => calculateUniversalEconomics({ contractKind: "SERVICE", initialAmountExVatCents: -1 })).toThrow();
    expect(() => calculateUniversalEconomics({ contractKind: "SERVICE", initialAmountExVatCents: 1.5 })).toThrow();
  });
});
