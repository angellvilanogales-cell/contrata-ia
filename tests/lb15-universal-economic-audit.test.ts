import { describe, expect, it } from "vitest";
import { auditAnnualities, calculateVat } from "../src/domain/economic/UniversalEconomicAudit";

describe("Bloque 15.2 - auditoría de IVA y anualidades", () => {
  it("calcula IVA en céntimos con redondeo monetario explícito", () => {
    const result = calculateVat(82_908_688, 21);
    expect(result.vatCents).toBe(17_410_824);
    expect(result.totalVatIncludedCents).toBe(100_319_512);
  });

  it("preserva un total anual declarado aunque difiera un céntimo del cálculo", () => {
    const rows = [
      { year: 2026, amountCents: 33_439_838, vatIncluded: true },
      { year: 2027, amountCents: 50_159_755, vatIncluded: true },
      { year: 2028, amountCents: 16_719_920, vatIncluded: true },
    ] as const;

    const result = auditAnnualities(rows, 100_319_513);
    expect(result.arithmeticTotalCents).toBe(100_319_513);
    expect(result.selectedTotalCents).toBe(100_319_513);
    expect(result.diagnostic).toBeUndefined();
    expect(result.years).toEqual([2026, 2027, 2028]);
  });

  it("convierte discrepancias en diagnóstico, no en autocorrección", () => {
    const result = auditAnnualities(
      [{ year: 2027, amountCents: 10_000, vatIncluded: true }],
      10_001,
    );

    expect(result.selectedTotalCents).toBe(10_001);
    expect(result.selectedValueOrigin).toBe("DECLARED_SOURCE");
    expect(result.diagnostic?.declaredMinusArithmeticCents).toBe(1);
    expect(result.diagnostic?.treatment).toBe("PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT");
  });

  it("detecta si las anualidades mezclan importes con y sin IVA", () => {
    const result = auditAnnualities([
      { year: 2026, amountCents: 100, vatIncluded: true },
      { year: 2027, amountCents: 100, vatIncluded: false },
    ]);
    expect(result.allRowsVatIncluded).toBe(false);
  });
});
