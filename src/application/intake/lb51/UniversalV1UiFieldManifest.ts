export type UniversalUiControlKind = "TEXT" | "TEXTAREA" | "BOOLEAN" | "MONEY_CENTS" | "INTEGER" | "SELECT" | "TABLE";

export interface UniversalV1UiFieldDefinition {
  fieldPath: string;
  label: string;
  control: UniversalUiControlKind;
  requiredForValidatedSupplyAsa: boolean;
  humanValidationRequired: boolean;
  help?: string;
}

/**
 * LB51 — manifiesto de campos universales que deben ser editables/revisables desde UI.
 *
 * Los fieldPath usan exactamente la convención del registro universal de mapeos LB22:
 * los campos canónicos se expresan por su clave raíz (object, cpvMain, durationMonths...)
 * y los dominios adicionales mediante prefijo (economic.*, execution.*, lots.*...).
 * No se inventan rutas de presentación que no existan en el modelo universal.
 */
export const UNIVERSAL_V1_UI_FIELD_MANIFEST: readonly UniversalV1UiFieldDefinition[] = [
  { fieldPath: "object", label: "Objeto del contrato", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "contractType", label: "Tipo de contrato", control: "SELECT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true, help: "Clave canónica de clasificación; no es un slot documental directo del registro LB22." },
  { fieldPath: "cpvMain", label: "CPV principal", control: "TEXT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "procedure", label: "Procedimiento de adjudicación", control: "SELECT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.fundingSource", label: "Perfil/origen de financiación", control: "SELECT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true, help: "Se utiliza también para seleccionar el modelo documental compatible; no sustituye la acreditación presupuestaria." },
  { fieldPath: "administrative.contractingAuthority", label: "Órgano de contratación", control: "TEXT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "technical.executionLocations", label: "Lugar/es de ejecución o entrega", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "lots.divisionIntoLots", label: "División en lotes", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "lots.noDivisionJustification", label: "Justificación de la no división en lotes", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "administrative.reservedContractDa4", label: "Contrato reservado DA 4.ª LCSP", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "baseTenderBudgetCents", label: "Presupuesto base de licitación sin IVA", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.initialVatAmountCents", label: "IVA del presupuesto inicial", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.initialPblVatIncludedCents", label: "Presupuesto base con IVA", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.needsBasedContractDa33", label: "Suministro por necesidades — DA 33.ª", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.budgetCoversEntireContractLife", label: "El presupuesto máximo cubre toda la vigencia", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.maximumApprovedBudgetCents", label: "Presupuesto máximo aprobado", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.legalEstimatedValueCents", label: "Valor estimado jurídico", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.estimatedValueCalculationMethod", label: "Método de cálculo del valor estimado", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.priceDeterminationRegime", label: "Sistema de determinación del precio", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionRegime", label: "Revisión de precios", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.annualityBudgetRows", label: "Anualidades y aplicaciones presupuestarias", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "durationMonths", label: "Duración inicial en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "extensionMonths", label: "Duración máxima de prórrogas en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.extensionStructure", label: "Estructura de prórrogas", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.extensionNoticeMonths", label: "Preaviso de prórroga en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.plannedModificationRegime", label: "Régimen de modificaciones previstas", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "criteria.awardCriteria", label: "Criterios de adjudicación", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "criteria.singleCriterionMotivation", label: "Motivación del criterio único", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.specialExecutionConditions", label: "Condiciones especiales de ejecución", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.unitPrices", label: "Precios unitarios del catálogo", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true, help: "El catálogo detallado puede conservar además cantidades/consumos en la ficha adaptativa, pero los precios unitarios se promueven a la semántica universal existente; no se inventa technical.catalogue." },
] as const;

const LB22_CANONICAL_OR_DOMAIN_PATHS = new Set([
  "object", "cpvMain", "lots", "estimatedValueCents", "baseTenderBudgetCents", "procedure", "durationMonths", "extensionMonths", "modificationPercent", "awardCriteria", "solvency", "publicity",
  "processing.processingType", "processing.urgency", "processing.emergency", "regulation.harmonizedRegulation", "regulation.europeanFunding", "regulation.threshold", "regulation.deadlines",
  "economic.vatPercent", "economic.budgetApplication", "economic.annualities", "economic.annualityBudgetRows", "economic.fundingSource", "economic.priceRevisionRegime", "economic.unitPrices", "economic.referenceConsumption", "economic.projectedConsumption", "economic.maximumApprovedBudgetCents", "economic.initialEstimatedValueBaseCents", "economic.extensionAmountExVatCents", "economic.modificationAmountExVatCents", "economic.optionsAmountExVatCents", "economic.otherEstimatedValueComponentsCents", "economic.legalEstimatedValueCents", "economic.initialVatAmountCents", "economic.initialPblVatIncludedCents", "economic.needsBasedContractDa33", "economic.budgetCoversEntireContractLife", "economic.estimatedValueCalculationMethod", "economic.priceDeterminationRegime",
  "administrative.contractingAuthority", "administrative.promotingUnit", "administrative.competentBody", "administrative.administrativeFileNumber", "administrative.contractManager", "administrative.reservedContractDa4",
  "technical.technicalPurpose", "technical.technicalRequirements", "technical.executionLocations", "technical.subrogationRequired", "technical.subrogationRegime",
  "lots.divisionIntoLots", "lots.lots", "lots.maxOfferableLots", "lots.maxAwardableLots", "lots.noDivisionJustification",
  "guarantees.provisionalGuaranteeRequired", "guarantees.provisionalGuaranteePercent", "guarantees.definitiveGuaranteePercent", "guarantees.complementaryGuaranteePercent",
  "execution.specialExecutionConditions", "execution.specificPenalties", "execution.subcontractingRegime", "execution.assignmentRegime", "execution.paymentRegime", "execution.receiptAndAcceptanceRegime", "execution.extensionStructure", "execution.extensionNoticeMonths", "execution.plannedModificationRegime",
  "criteria.awardCriteria", "criteria.economicSolvency", "criteria.technicalSolvency", "criteria.judgmentCriteriaExist", "criteria.singleCriterionMotivation",
]);

export function evaluateUniversalV1UiFieldManifest() {
  const paths = UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath);
  const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
  const required = UNIVERSAL_V1_UI_FIELD_MANIFEST.filter(item => item.requiredForValidatedSupplyAsa);
  const nonCanonicalPaths = paths.filter(path => path !== "contractType" && !LB22_CANONICAL_OR_DOMAIN_PATHS.has(path));
  return {
    fieldCount: UNIVERSAL_V1_UI_FIELD_MANIFEST.length,
    duplicatePaths: [...new Set(duplicates)],
    nonCanonicalPaths,
    requiredSupplyAsaPaths: required.map(item => item.fieldPath),
    allRequiredFieldsHumanReviewable: required.every(item => item.humanValidationRequired),
    uiReadyForUniversalProduction: false,
    blockers: [
      "Los controles ya tienen paths alineados con LB22, pero todavía deben completar el enlace API/persistencia con EvidenceField y su aplicación al UniversalExpedienteV13.",
      "La UI debe mostrar estado de evidencia, conflictos y validación humana; no basta con un formulario de valores planos.",
    ],
  } as const;
}
