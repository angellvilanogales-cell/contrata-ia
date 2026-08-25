import { SERVICE_REGRESSION_CASE_005_CARL_FINE } from "./ServiceRegressionCase005CarlFineExtraction";

export const CARL_FINE_REGRESSION_VERSION = "REG-SERVICE-005-CARL-FINE-GUARD-11.8.3-v1";

const f = SERVICE_REGRESSION_CASE_005_CARL_FINE.facts;

const checks = [
  { id: "CARL-MIXED-CONTRACT", ok: f.legalCharacterization === "CONTRATO_MIXTO_SERVICIOS_SUMINISTROS_CON_PRESTACION_PRINCIPAL_SERVICIOS", purpose: "Conservar la calificación documental mixta con prestación principal de servicios." },
  { id: "CARL-90-10", ok: f.serviceSharePercent === 90 && f.supplySharePercent === 10, purpose: "Proteger la distribución documental 90 % servicios / 10 % suministros accesorios." },
  { id: "CARL-NO-LOTS", ok: f.lots === false, purpose: "Mantener la no división en lotes y evitar heredar estructuras multilote." },
  { id: "CARL-PROCEDURE", ok: f.procedure === "ABIERTO_SIMPLIFICADO" && f.ordinaryProcessing === true, purpose: "Conservar abierto simplificado con tramitación ordinaria." },
  { id: "CARL-NO-SARA", ok: f.sara === false, purpose: "Impedir activar SARA sin soporte documental." },
  { id: "CARL-DURATION-12-12", ok: f.initialDurationMonths === 12 && f.extensionMonths === 12, purpose: "Conservar duración inicial de 12 meses y prórroga máxima de 12 meses." },
  { id: "CARL-PBL", ok: f.pblExVat === 44170.33 && f.vatAmount === 9275.77 && f.pblIncVat === 53446.10, purpose: "Proteger los importes de PBL e IVA declarados por la fuente." },
  { id: "CARL-VE-SOURCE-VALUE", ok: f.estimatedValueExVat === 106008.80, purpose: "Proteger el valor estimado declarado por la fuente sin convertir su método de cálculo en regla general." },
  { id: "CARL-MODIFICATION-20", ok: f.plannedModification === true && f.plannedModificationPercent === 20, purpose: "Conservar la existencia documental de modificación prevista del 20 %, sin congelar todavía su causa literal." },
  { id: "CARL-CRITERIA-FORMULAS", ok: f.awardCriteriaMode === "MULTIPLES_SOLO_FORMULAS" && f.awardCriteriaTotalPoints === 100 && f.economicOfferPoints === 80, purpose: "Conservar 100 puntos mediante fórmulas y hasta 80 puntos para oferta económica." },
  { id: "CARL-PAYMENT", ok: f.paymentMode === "MENSUALIDADES_NATURALES_VENCIDAS", purpose: "Mantener el régimen de pago extraído de la Memoria." },
  { id: "CARL-COSTS", ok: f.laborCostReference2025 === 24697.91 && f.directCosts === 36161.30 && f.indirectCosts === 8009.03 && Math.round((f.directCosts + f.indirectCosts) * 100) / 100 === f.pblExVat, purpose: "Proteger los costes extraídos y su coherencia aritmética con el PBL sin IVA." },
] as const;

export const CARL_FINE_REGRESSION_BASELINE = {
  caseId: SERVICE_REGRESSION_CASE_005_CARL_FINE.id,
  version: CARL_FINE_REGRESSION_VERSION,
  checks,
  blockers: checks.filter((c) => !c.ok).map((c) => c.id),
  passed: checks.every((c) => c.ok),
  protectedScope: SERVICE_REGRESSION_CASE_005_CARL_FINE.sourceBoundaries.verified,
  deliberatelyNotFrozenYet: SERVICE_REGRESSION_CASE_005_CARL_FINE.sourceBoundaries.deliberatelyPending,
  sourceValueGuard: {
    field: "estimatedValueExVat",
    value: f.estimatedValueExVat,
    rule: "SOURCE_DECLARED_VALUE_ONLY",
    explanation: "106.008,80 € se protege como valor estimado declarado en la fuente del expediente CARL. Esta regresión no convierte la forma de cálculo usada en este expediente en fórmula general para otros contratos.",
  },
  classificationGuard: "El caso se protege como contrato mixto 90/10 con prestación principal de servicios. No puede degradarse a suministro principal ni simplificarse de nuevo a servicio puro ignorando la calificación expresa de la Memoria.",
} as const;

export type CarlFineRegressionBaseline = typeof CARL_FINE_REGRESSION_BASELINE;
