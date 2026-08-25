export type EconomicContractKind = "SERVICE" | "SUPPLY" | "WORKS" | "OTHER";

export interface EconomicComponentInput {
  label: string;
  amountCents: number;
  sourceId: string;
}

export interface EconomicLotInput {
  lotId: string;
  initialAmountExVatCents: number;
  extensionAmountExVatCents?: number;
  modificationAmountExVatCents?: number;
  optionsAmountExVatCents?: number;
  otherEstimatedValueComponentsCents?: number;
  declaredEstimatedValueCents?: number;
}

export interface EconomicCalculationInput {
  contractKind: EconomicContractKind;
  initialAmountExVatCents: number;
  extensionAmountExVatCents?: number;
  modificationAmountExVatCents?: number;
  optionsAmountExVatCents?: number;
  otherEstimatedValueComponentsCents?: number;
  declaredEstimatedValueCents?: number;
  lots?: readonly EconomicLotInput[];
  maximumApprovedBudgetCents?: number;
  referenceConsumption?: string;
  projectedConsumption?: string;
}

export interface EconomicDifferenceDiagnostic {
  declaredCents: number;
  arithmeticCents: number;
  declaredMinusArithmeticCents: number;
  treatment: "PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT";
}

export interface EconomicLotResult {
  lotId: string;
  arithmeticEstimatedValueCents: number;
  declaredEstimatedValueCents?: number;
  diagnostic?: EconomicDifferenceDiagnostic;
}

export interface EconomicLotComponentTotals {
  initialAmountExVatCents: number;
  extensionAmountExVatCents: number;
  modificationAmountExVatCents: number;
  optionsAmountExVatCents: number;
  otherEstimatedValueComponentsCents: number;
  arithmeticEstimatedValueCents: number;
}

export interface EconomicCalculationResult {
  arithmeticEstimatedValueCents: number;
  declaredEstimatedValueCents?: number;
  selectedEstimatedValueCents: number;
  selectedValueOrigin: "DECLARED_SOURCE" | "DERIVED_CALCULATION";
  diagnostic?: EconomicDifferenceDiagnostic;
  lots: readonly EconomicLotResult[];
  lotComponentTotals?: EconomicLotComponentTotals;
  lotDeclaredSumCents?: number;
  lotDeclaredSumDiagnostic?: EconomicDifferenceDiagnostic;
  supplyNeeds?: {
    maximumApprovedBudgetCents?: number;
    referenceConsumption?: string;
    projectedConsumption?: string;
    excludedFromEstimatedValueArithmetic: true;
  };
  diagnostics: readonly string[];
}

function assertMoney(value: number | undefined, name: string): number {
  const amount = value ?? 0;
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`${name} debe expresarse como céntimos enteros no negativos.`);
  }
  return amount;
}

function arithmeticEstimatedValue(input: {
  initialAmountExVatCents: number;
  extensionAmountExVatCents?: number;
  modificationAmountExVatCents?: number;
  optionsAmountExVatCents?: number;
  otherEstimatedValueComponentsCents?: number;
}): number {
  return (
    assertMoney(input.initialAmountExVatCents, "initialAmountExVatCents") +
    assertMoney(input.extensionAmountExVatCents, "extensionAmountExVatCents") +
    assertMoney(input.modificationAmountExVatCents, "modificationAmountExVatCents") +
    assertMoney(input.optionsAmountExVatCents, "optionsAmountExVatCents") +
    assertMoney(input.otherEstimatedValueComponentsCents, "otherEstimatedValueComponentsCents")
  );
}

function difference(declaredCents: number, arithmeticCents: number): EconomicDifferenceDiagnostic | undefined {
  if (declaredCents === arithmeticCents) return undefined;
  return {
    declaredCents,
    arithmeticCents,
    declaredMinusArithmeticCents: declaredCents - arithmeticCents,
    treatment: "PRESERVE_DECLARED_VALUE_DO_NOT_AUTOCORRECT",
  };
}

function lotComponentTotals(lots: readonly EconomicLotInput[]): EconomicLotComponentTotals | undefined {
  if (lots.length === 0) return undefined;
  return lots.reduce<EconomicLotComponentTotals>((totals, lot) => {
    const initial = assertMoney(lot.initialAmountExVatCents, `lot ${lot.lotId} initialAmountExVatCents`);
    const extension = assertMoney(lot.extensionAmountExVatCents, `lot ${lot.lotId} extensionAmountExVatCents`);
    const modification = assertMoney(lot.modificationAmountExVatCents, `lot ${lot.lotId} modificationAmountExVatCents`);
    const options = assertMoney(lot.optionsAmountExVatCents, `lot ${lot.lotId} optionsAmountExVatCents`);
    const other = assertMoney(lot.otherEstimatedValueComponentsCents, `lot ${lot.lotId} otherEstimatedValueComponentsCents`);
    return {
      initialAmountExVatCents: totals.initialAmountExVatCents + initial,
      extensionAmountExVatCents: totals.extensionAmountExVatCents + extension,
      modificationAmountExVatCents: totals.modificationAmountExVatCents + modification,
      optionsAmountExVatCents: totals.optionsAmountExVatCents + options,
      otherEstimatedValueComponentsCents: totals.otherEstimatedValueComponentsCents + other,
      arithmeticEstimatedValueCents: totals.arithmeticEstimatedValueCents + initial + extension + modification + options + other,
    };
  }, {
    initialAmountExVatCents: 0,
    extensionAmountExVatCents: 0,
    modificationAmountExVatCents: 0,
    optionsAmountExVatCents: 0,
    otherEstimatedValueComponentsCents: 0,
    arithmeticEstimatedValueCents: 0,
  });
}

export function calculateUniversalEconomics(input: EconomicCalculationInput): EconomicCalculationResult {
  const arithmetic = arithmeticEstimatedValue(input);
  const declared = input.declaredEstimatedValueCents === undefined
    ? undefined
    : assertMoney(input.declaredEstimatedValueCents, "declaredEstimatedValueCents");

  const inputLots = input.lots ?? [];
  const lots = inputLots.map(lot => {
    const lotArithmetic = arithmeticEstimatedValue(lot);
    const lotDeclared = lot.declaredEstimatedValueCents === undefined
      ? undefined
      : assertMoney(lot.declaredEstimatedValueCents, `lot ${lot.lotId} declaredEstimatedValueCents`);
    return {
      lotId: lot.lotId,
      arithmeticEstimatedValueCents: lotArithmetic,
      declaredEstimatedValueCents: lotDeclared,
      diagnostic: lotDeclared === undefined ? undefined : difference(lotDeclared, lotArithmetic),
    } satisfies EconomicLotResult;
  });

  const declaredLotValues = lots
    .map(lot => lot.declaredEstimatedValueCents)
    .filter((value): value is number => value !== undefined);
  const lotDeclaredSumCents = declaredLotValues.length === lots.length && lots.length > 0
    ? declaredLotValues.reduce((sum, value) => sum + value, 0)
    : undefined;
  const componentTotals = lotComponentTotals(inputLots);

  const diagnostics: string[] = [
    "Las prórrogas se incorporan por su importe económico explícito; nunca se extrapolan automáticamente desde su duración en meses.",
    "Las modificaciones, opciones y otros componentes del valor estimado se agregan solo cuando existe un importe económico explícito.",
  ];

  if (componentTotals) {
    diagnostics.push("Los totales por lotes se calculan como comprobación aritmética independiente; no sustituyen importes globales declarados por una fuente.");
  }

  if (input.contractKind === "SUPPLY") {
    diagnostics.push(
      "En suministros por necesidades, consumo de referencia, proyección y presupuesto máximo aprobado permanecen separados del valor estimado jurídico.",
    );
  }

  const result: EconomicCalculationResult = {
    arithmeticEstimatedValueCents: arithmetic,
    declaredEstimatedValueCents: declared,
    selectedEstimatedValueCents: declared ?? arithmetic,
    selectedValueOrigin: declared === undefined ? "DERIVED_CALCULATION" : "DECLARED_SOURCE",
    diagnostic: declared === undefined ? undefined : difference(declared, arithmetic),
    lots,
    lotComponentTotals: componentTotals,
    lotDeclaredSumCents,
    lotDeclaredSumDiagnostic:
      declared !== undefined && lotDeclaredSumCents !== undefined
        ? difference(declared, lotDeclaredSumCents)
        : undefined,
    diagnostics,
  };

  if (input.contractKind === "SUPPLY") {
    result.supplyNeeds = {
      maximumApprovedBudgetCents:
        input.maximumApprovedBudgetCents === undefined
          ? undefined
          : assertMoney(input.maximumApprovedBudgetCents, "maximumApprovedBudgetCents"),
      referenceConsumption: input.referenceConsumption,
      projectedConsumption: input.projectedConsumption,
      excludedFromEstimatedValueArithmetic: true,
    };
  }

  return result;
}
