import { UniversalAnnuality } from "../expediente/UniversalExpedienteDomains";
import { EconomicDifferenceDiagnostic } from "./UniversalEconomicCalculation";

export interface VatCalculationResult {
  baseExVatCents: number;
  vatPercent: number;
  vatCents: number;
  totalVatIncludedCents: number;
}

export interface AnnualityAuditResult {
  arithmeticTotalCents: number;
  declaredTotalCents?: number;
  selectedTotalCents: number;
  selectedValueOrigin: "DECLARED_SOURCE" | "DERIVED_CALCULATION";
  diagnostic?: EconomicDifferenceDiagnostic;
  allRowsVatIncluded: boolean;
  years: readonly number[];
}

function assertIntegerMoney(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} debe expresarse como céntimos enteros no negativos.`);
  }
}

export function calculateVat(baseExVatCents: number, vatPercent: number): VatCalculationResult {
  assertIntegerMoney(baseExVatCents, "baseExVatCents");
  if (!Number.isFinite(vatPercent) || vatPercent < 0 || vatPercent > 100) {
    throw new Error("vatPercent debe estar comprendido entre 0 y 100.");
  }

  const vatCents = Math.round((baseExVatCents * vatPercent) / 100);
  return {
    baseExVatCents,
    vatPercent,
    vatCents,
    totalVatIncludedCents: baseExVatCents + vatCents,
  };
}

export function auditAnnualities(
  annualities: readonly UniversalAnnuality[],
  declaredTotalCents?: number,
): AnnualityAuditResult {
  for (const [index, row] of annualities.entries()) {
    assertIntegerMoney(row.amountCents, `annualities[${index}].amountCents`);
    if (!Number.isInteger(row.year) || row.year < 2000 || row.year > 2200) {
      throw new Error(`annualities[${index}].year no es válido.`);
    }
  }

  const arithmeticTotalCents = annualities.reduce((sum, row) => sum + row.amountCents, 0);
  if (declaredTotalCents !== undefined) assertIntegerMoney(declaredTotalCents, "declaredTotalCents");

  const diagnostic = declaredTotalCents !== undefined && declaredTotalCents !== arithmeticTotalCents
    ? {
        declaredCents: declaredTotalCents,
        arithmeticCents: arithmeticTotalCents,
        declaredMinusArithmeticCents: declaredTotalCents - arithmeticTotalCents,
        treatment: "PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT" as const,
      }
    : undefined;

  return {
    arithmeticTotalCents,
    declaredTotalCents,
    selectedTotalCents: declaredTotalCents ?? arithmeticTotalCents,
    selectedValueOrigin: declaredTotalCents === undefined ? "DERIVED_CALCULATION" : "DECLARED_SOURCE",
    diagnostic,
    allRowsVatIncluded: annualities.every(row => row.vatIncluded),
    years: [...new Set(annualities.map(row => row.year))].sort((a, b) => a - b),
  };
}
