import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE } from "./ServiceRegressionCase007MaintenanceSevilleFineExtraction";

const EUR = "EUR" as const;
const BUDGET_APPLICATION = "1439030000 G/32L/21200/41 01" as const;

export const SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS = {
  id: "REG-SERVICE-007",
  step: "11.9.3",
  expediente: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE.expediente,
  status: "ECONOMIC_SOURCE_VALUES_FROZEN_PENDING_HUMAN_VALIDATION",
  sourceDocuments: ["PCAP"] as const,
  sourceSection: "ANEXO I - 2.A PRESUPUESTO BASE DE LICITACION / 2.B VALOR ESTIMADO DEL CONTRATO",
  currency: EUR,

  sourceValuePolicy: {
    declaredValuesAreAuthoritativeEvidence: true,
    doNotNormalizeDeclaredRounding: true,
    arithmeticChecksAreDiagnosticOnly: true,
    humanValidationRequired: true,
  },

  estimatedValue: {
    modificationArticle204Percent: 20,
    extensionMonths: 24,
    lots: [
      {
        lot: 1,
        tenderAmountExVatCents: 15_870_588,
        modificationCents: 3_174_118,
        extensionCents: 15_870_588,
        declaredEstimatedValueCents: 34_915_294,
        arithmeticEstimatedValueCents: 34_915_294,
        declaredMinusArithmeticCents: 0,
      },
      {
        lot: 2,
        tenderAmountExVatCents: 10_247_057,
        modificationCents: 2_049_411,
        extensionCents: 10_247_057,
        declaredEstimatedValueCents: 22_543_526,
        arithmeticEstimatedValueCents: 22_543_525,
        declaredMinusArithmeticCents: 1,
      },
      {
        lot: 3,
        tenderAmountExVatCents: 20_505_528,
        modificationCents: 4_101_106,
        extensionCents: 20_505_528,
        declaredEstimatedValueCents: 45_112_162,
        arithmeticEstimatedValueCents: 45_112_162,
        declaredMinusArithmeticCents: 0,
      },
      {
        lot: 4,
        tenderAmountExVatCents: 36_285_515,
        modificationCents: 7_257_103,
        extensionCents: 36_285_515,
        declaredEstimatedValueCents: 79_828_134,
        arithmeticEstimatedValueCents: 79_828_133,
        declaredMinusArithmeticCents: 1,
      },
    ] as const,
    declaredTotals: {
      tenderAmountExVatCents: 82_908_688,
      modificationCents: 16_581_738,
      extensionCents: 82_908_688,
      estimatedValueCents: 182_399_114,
    },
    diagnostic: {
      sumDeclaredLotEstimatedValuesCents: 182_399_116,
      declaredGlobalEstimatedValueCents: 182_399_114,
      lotSumMinusDeclaredGlobalCents: 2,
      treatment: "PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT",
    },
  },

  annualitiesVatIncluded: {
    declaredTotalCents: 100_319_513,
    budgetApplication: BUDGET_APPLICATION,
    expenditureProcessing: "ORDINARIA",
    rows: [
      { lot: 1, year: 2026, amountCents: 6_401_137, budgetApplication: BUDGET_APPLICATION },
      { lot: 1, year: 2027, amountCents: 9_601_706, budgetApplication: BUDGET_APPLICATION },
      { lot: 1, year: 2028, amountCents: 3_200_569, budgetApplication: BUDGET_APPLICATION },
      { lot: 2, year: 2026, amountCents: 4_132_980, budgetApplication: BUDGET_APPLICATION },
      { lot: 2, year: 2027, amountCents: 6_199_469, budgetApplication: BUDGET_APPLICATION },
      { lot: 2, year: 2028, amountCents: 2_066_490, budgetApplication: BUDGET_APPLICATION },
      { lot: 3, year: 2026, amountCents: 8_270_563, budgetApplication: BUDGET_APPLICATION },
      { lot: 3, year: 2027, amountCents: 12_405_844, budgetApplication: BUDGET_APPLICATION },
      { lot: 3, year: 2028, amountCents: 4_135_282, budgetApplication: BUDGET_APPLICATION },
      { lot: 4, year: 2026, amountCents: 14_635_158, budgetApplication: BUDGET_APPLICATION },
      { lot: 4, year: 2027, amountCents: 21_952_736, budgetApplication: BUDGET_APPLICATION },
      { lot: 4, year: 2028, amountCents: 7_317_579, budgetApplication: BUDGET_APPLICATION },
    ] as const,
  },

  resolvedEvidenceAtThisStep: [
    "PBL y desglose económico por lotes en el alcance acreditado por la fuente",
    "valor estimado exacto declarado por lote y total",
    "prórroga de 24 meses incorporada al valor estimado",
    "modificación prevista del artículo 204 LCSP del 20%",
    "anualidades IVA incluido y aplicación presupuestaria",
  ] as const,

  deliberatelyStillOpen: [
    "criterios de adjudicación, ponderaciones y fórmulas",
    "existencia y alcance de criterios sujetos a juicio de valor",
    "garantía definitiva y eventual complementaria",
    "solvencia económica y técnica exacta por lote",
    "existencia y régimen de subrogación de personal",
    "condiciones especiales de ejecución",
    "penalidades específicas",
    "regla definitiva sobre máximo de lotes ofertables por licitador",
  ] as const,
} as const;

export type ServiceRegressionCase007MaintenanceSevilleEconomics =
  typeof SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS;
