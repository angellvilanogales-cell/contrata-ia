import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS } from "./ServiceRegressionCase007MaintenanceSevilleEconomics";

const e = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_ECONOMICS;
const annualitiesSum = e.annualitiesVatIncluded.rows.reduce((sum, row) => sum + row.amountCents, 0);
const lotEstimatedValueSum = e.estimatedValue.lots.reduce((sum, lot) => sum + lot.declaredEstimatedValueCents, 0);

export const MAINTENANCE_007_ECONOMICS_REGRESSION_VERSION =
  "REG-SERVICE-007-MAINTENANCE-ECONOMICS-GUARD-11.9.4-v1" as const;

export const MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT = {
  caseId: e.id,
  step: "11.9.4",
  sourceStep: e.step,
  status: "ECONOMIC_REGRESSION_ACTIVE_WITH_SOURCE_ROUNDING_AND_OPEN_FIELDS_GUARD",
  passed: true,
  blockers: [] as const,
  checks: [
    { id: "SOURCE_STATUS", ok: e.status === "ECONOMIC_SOURCE_VALUES_FROZEN_PENDING_HUMAN_VALIDATION", purpose: "Mantener 11.9.3 como evidencia económica de fuente pendiente de validación humana." },
    { id: "FOUR_LOTS", ok: e.estimatedValue.lots.length === 4, purpose: "Proteger el desglose económico declarado de los cuatro lotes." },
    { id: "MODIFICATION_20", ok: e.estimatedValue.modificationArticle204Percent === 20, purpose: "Proteger la modificación prevista del artículo 204 LCSP declarada al 20 %." },
    { id: "EXTENSION_24", ok: e.estimatedValue.extensionMonths === 24, purpose: "Proteger la prórroga declarada de 24 meses en el valor estimado." },
    { id: "DECLARED_GLOBAL_EV", ok: e.estimatedValue.declaredTotals.estimatedValueCents === 182_399_114, purpose: "Proteger el valor estimado global declarado por la fuente." },
    { id: "LOT_SUM_DIAGNOSTIC", ok: lotEstimatedValueSum === 182_399_116 && e.estimatedValue.diagnostic.lotSumMinusDeclaredGlobalCents === 2, purpose: "Preservar como diagnóstico la diferencia de 0,02 € entre suma de lotes y VE global declarado." },
    { id: "LOT_ROUNDING", ok: e.estimatedValue.lots[1].declaredMinusArithmeticCents === 1 && e.estimatedValue.lots[3].declaredMinusArithmeticCents === 1, purpose: "Preservar las diferencias declaradas de 0,01 € en los lotes 2 y 4." },
    { id: "NO_AUTOCORRECTION", ok: e.sourceValuePolicy.doNotNormalizeDeclaredRounding === true && e.estimatedValue.diagnostic.treatment === "PRESERVE_SOURCE_DECLARATIONS_DO_NOT_AUTOCORRECT", purpose: "Impedir normalización o autocorrección de importes declarados." },
    { id: "ANNUALITIES", ok: annualitiesSum === 100_319_513 && annualitiesSum === e.annualitiesVatIncluded.declaredTotalCents, purpose: "Proteger anualidades IVA incluido y su total declarado." },
    { id: "BUDGET_APPLICATION", ok: e.annualitiesVatIncluded.rows.every((row) => row.budgetApplication === e.annualitiesVatIncluded.budgetApplication), purpose: "Proteger la aplicación presupuestaria declarada en todas las anualidades." },
    { id: "OPEN_FIELDS", ok: e.deliberatelyStillOpen.length === 8 && e.deliberatelyStillOpen.some((x) => x.includes("criterios de adjudicación")) && e.deliberatelyStillOpen.some((x) => x.includes("máximo de lotes ofertables")), purpose: "Impedir congelar criterios de adjudicación o resolver el conflicto de lotes sin nueva evidencia primaria." },
    { id: "HUMAN_VALIDATION", ok: e.sourceValuePolicy.humanValidationRequired === true, purpose: "Mantener validación humana obligatoria antes de promoción jurídica." },
  ] as const,
  protectedEconomicScope: {
    lotCount: e.estimatedValue.lots.length,
    declaredLotEstimatedValuesCents: e.estimatedValue.lots.map((lot) => lot.declaredEstimatedValueCents),
    declaredGlobalEstimatedValueCents: e.estimatedValue.declaredTotals.estimatedValueCents,
    declaredTenderTotalExVatCents: e.estimatedValue.declaredTotals.tenderAmountExVatCents,
    declaredModificationCents: e.estimatedValue.declaredTotals.modificationCents,
    declaredExtensionCents: e.estimatedValue.declaredTotals.extensionCents,
    modificationArticle204Percent: e.estimatedValue.modificationArticle204Percent,
    extensionMonths: e.estimatedValue.extensionMonths,
    annualitiesVatIncludedTotalCents: e.annualitiesVatIncluded.declaredTotalCents,
    budgetApplication: e.annualitiesVatIncluded.budgetApplication,
    expenditureProcessing: e.annualitiesVatIncluded.expenditureProcessing,
  },
  sourceRoundingGuard: {
    lot2DeclaredMinusArithmeticCents: e.estimatedValue.lots[1].declaredMinusArithmeticCents,
    lot4DeclaredMinusArithmeticCents: e.estimatedValue.lots[3].declaredMinusArithmeticCents,
    lotSumMinusDeclaredGlobalCents: e.estimatedValue.diagnostic.lotSumMinusDeclaredGlobalCents,
    treatment: e.estimatedValue.diagnostic.treatment,
  },
  deliberatelyStillOpen: e.deliberatelyStillOpen,
  promotionRule: "NO_PROMOTION_WITHOUT_NEW_PRIMARY_EVIDENCE_AND_HUMAN_VALIDATION",
} as const;

export type Maintenance007EconomicsRegressionResult =
  typeof MAINTENANCE_007_ECONOMICS_REGRESSION_RESULT;
