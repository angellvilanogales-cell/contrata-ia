export const SUPPLY_GOLDEN_CASE_001 = {
  id: "CONTR-2026-240267-SUPPLY-DA33-GOLDEN-001",
  expediente: "CONTR/2026/240267",
  status: "VALIDATED_DOCUMENTARY_GOLDEN_CASE",
  contractType: "SUMINISTRO",
  procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
  financing: "AUTOFINANCIADO",
  cpv: "44316400-2",
  catalogue: {
    references: 98,
    referenceEconomicBaseExVat: 4540.24,
    closedToNewItems: true,
    closedToNewUnitPrices: true,
  },
  economics: {
    initialPblExVat: 10552.44,
    vatRatePercent: 21,
    initialPblVatIncluded: 12768.45,
    directCostsPercent: 76,
    directCostsExVat: 8019.85,
    indirectCostsPercent: 18,
    indirectCostsExVat: 1899.44,
    industrialProfitPercent: 6,
    industrialProfitExVat: 633.15,
    maximumBudgetAllTermExVat: 18160.96,
    estimatedValueExVat: 21793.15,
    plannedModificationPercent: 20,
    plannedModificationMaximumExVat: 3632.19,
  },
  duration: {
    initialMonths: 24,
    extensionsMonths: [12, 12],
    extensionsDoNotAutomaticallyIncreaseMaximumBudget: true,
  },
  award: {
    soleCriterion: "PRECIO",
    points: 100,
    specificMotivationRequired: true,
  },
  execution: {
    deliveryBusinessDays: 5,
  },
  modification: {
    legalBasis: ["DA 33.ª LCSP", "art. 204 LCSP"],
    reason: "MAYORES_NECESIDADES_REALES",
    sameObject: true,
    sameAwardedUnitPrices: true,
    noNewItems: true,
    noNewUnitPrices: true,
  },
  legalReport: {
    id: "AJ-SAE 2026/16",
    date: "2026-07-29",
    body: "Asesoría Jurídica del Servicio Andaluz de Empleo",
  },
  finalAudit: {
    step: "11.4.3",
    requiredBlockers: 0,
    requiresHumanValidation: true,
  },
} as const;

export type SupplyGoldenCase001 = typeof SUPPLY_GOLDEN_CASE_001;
