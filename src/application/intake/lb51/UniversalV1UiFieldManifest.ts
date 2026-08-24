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
 * No crea un segundo modelo de dominio. Los fieldPath apuntan al expediente universal y
 * sirven como contrato de interfaz para que la UI no se quede limitada a las preguntas LB6
 * históricas ni obligue a editar JSON para cerrar semánticas documentales exactas.
 */
export const UNIVERSAL_V1_UI_FIELD_MANIFEST: readonly UniversalV1UiFieldDefinition[] = [
  { fieldPath: "canonical.object", label: "Objeto del contrato", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "canonical.contractType", label: "Tipo de contrato", control: "SELECT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "canonical.cpvMain", label: "CPV principal", control: "TEXT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "administrative.contractingAuthority", label: "Órgano de contratación", control: "TEXT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "technical.executionLocations", label: "Lugar/es de ejecución o entrega", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "lots.divisionIntoLots", label: "División en lotes", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "lots.noDivisionJustification", label: "Justificación de la no división en lotes", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "administrative.reservedContractDa4", label: "Contrato reservado DA 4.ª LCSP", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.baseTenderBudgetCents", label: "Presupuesto base de licitación sin IVA", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.initialVatAmountCents", label: "IVA del presupuesto inicial", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.initialPblVatIncludedCents", label: "Presupuesto base con IVA", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.needsBasedContractDa33", label: "Suministro por necesidades — DA 33.ª", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.budgetCoversEntireContractLife", label: "El presupuesto máximo cubre toda la vigencia", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.legalEstimatedValueCents", label: "Valor estimado jurídico", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.estimatedValueCalculationMethod", label: "Método de cálculo del valor estimado", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.priceDeterminationRegime", label: "Sistema de determinación del precio", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionRegime", label: "Revisión de precios", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.annualities", label: "Anualidades y aplicaciones presupuestarias", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.durationMonths", label: "Duración inicial en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.extensionStructure", label: "Estructura de prórrogas", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.extensionNoticeMonths", label: "Preaviso de prórroga en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.plannedModificationRegime", label: "Régimen de modificaciones previstas", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "criteria.awardCriteria", label: "Criterios de adjudicación", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "criteria.singleCriterionMotivation", label: "Motivación del criterio único", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.specialExecutionConditions", label: "Condiciones especiales de ejecución", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "technical.catalogue", label: "Catálogo de prestaciones/referencias", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true, help: "En contratos DA 33.ª la variabilidad de consumo no habilita por sí sola artículos nuevos." },
] as const;

export function evaluateUniversalV1UiFieldManifest() {
  const paths = UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath);
  const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index);
  const required = UNIVERSAL_V1_UI_FIELD_MANIFEST.filter(item => item.requiredForValidatedSupplyAsa);
  return {
    fieldCount: UNIVERSAL_V1_UI_FIELD_MANIFEST.length,
    duplicatePaths: [...new Set(duplicates)],
    requiredSupplyAsaPaths: required.map(item => item.fieldPath),
    allRequiredFieldsHumanReviewable: required.every(item => item.humanValidationRequired),
    uiReadyForUniversalProduction: false,
    blockers: [
      "El manifiesto está definido, pero los controles todavía deben conectarse a persistencia universal y EvidenceField.",
      "La UI debe mostrar estado de evidencia, conflictos y validación humana; no basta con un formulario de valores planos.",
    ],
  } as const;
}
