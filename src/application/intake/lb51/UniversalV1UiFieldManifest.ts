export type UniversalUiControlKind = "TEXT" | "TEXTAREA" | "BOOLEAN" | "MONEY_CENTS" | "INTEGER" | "DECIMAL" | "SELECT" | "TABLE";

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
  { fieldPath: "need", label: "Necesidad e idoneidad de la contratación", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true, help: "Texto motivado desde los hechos y confirmado por la unidad promotora; arts. 28 y 116 LCSP." },
  { fieldPath: "object", label: "Objeto del contrato", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "contractType", label: "Tipo de contrato", control: "SELECT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true, help: "Clave canónica de clasificación; no es un slot documental directo del registro LB22." },
  { fieldPath: "cpvMain", label: "CPV principal", control: "TEXT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "cpvMainDescription", label: "Denominación oficial del CPV principal", control: "TEXT", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "cpvAdditional", label: "CPV complementarios", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "lots.cpvAssignments", label: "CPV asignados a cada lote", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "procedure", label: "Procedimiento de adjudicación", control: "SELECT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "processing.urgency", label: "Tramitación urgente", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "processing.emergency", label: "Tramitación de emergencia", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "regulation.harmonizedRegulation", label: "Sujeción a regulación armonizada", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.fundingSource", label: "Perfil/origen de financiación", control: "SELECT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true, help: "Se utiliza también para seleccionar el modelo documental compatible; no sustituye la acreditación presupuestaria." },
  { fieldPath: "administrative.contractingAuthority", label: "Órgano de contratación", control: "TEXT", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "technical.executionLocations", label: "Lugar/es de ejecución o entrega", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "lots.divisionIntoLots", label: "División en lotes", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "lots.noDivisionJustification", label: "Justificación de la no división en lotes", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "administrative.reservedContractDa4", label: "Contrato reservado DA 4.ª LCSP", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "baseTenderBudgetCents", label: "Presupuesto base de licitación sin IVA", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.initialVatAmountCents", label: "IVA del presupuesto inicial", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.initialPblVatIncludedCents", label: "Presupuesto base con IVA", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.vatPercent", label: "Tipo de IVA aplicable, en porcentaje", control: "INTEGER", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.pblCostBreakdown", label: "Desglose del PBL en costes directos, indirectos y otros gastos", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "lots.pblAllocations", label: "Distribución del PBL total entre lotes", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.needsBasedContractDa33", label: "Suministro por necesidades — DA 33.ª", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.budgetCoversEntireContractLife", label: "El presupuesto máximo cubre toda la vigencia", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.maximumApprovedBudgetCents", label: "Presupuesto máximo aprobado", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.legalEstimatedValueCents", label: "Valor estimado jurídico", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.initialEstimatedValueBaseCents", label: "Componente inicial del valor estimado", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.extensionAmountExVatCents", label: "Componente de prórrogas del valor estimado", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.modificationAmountExVatCents", label: "Componente de modificaciones previstas del valor estimado", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.optionsAmountExVatCents", label: "Componente de opciones del valor estimado", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.otherEstimatedValueComponentsCents", label: "Otros componentes del valor estimado", control: "MONEY_CENTS", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.estimatedValueCalculationMethod", label: "Método de cálculo del valor estimado", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.valuationMethodology", label: "Metodologías de valoración económica", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.valuationSupports", label: "Apoyos de la valoración económica", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.valuationDocuments", label: "Documentos y huellas de la valoración económica", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.valuationEvidenceSufficient", label: "Suficiencia documental de la valoración económica", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.priceDeterminationRegime", label: "Sistema de determinación del precio", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionRegime", label: "Revisión de precios", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionJustification", label: "Justificación de la revisión de precios", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionFormula", label: "Fórmula invariable de revisión", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionCostStructure", label: "Estructura de costes revisables", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionIndices", label: "Índices oficiales de revisión", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionAccrualLimits", label: "Límites temporales del devengo", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.priceRevisionPhysicalProfileSupported", label: "Cobertura física de la revisión", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "economic.annualityBudgetRows", label: "Anualidades y aplicaciones presupuestarias", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "durationMonths", label: "Duración inicial en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "extensionMonths", label: "Duración máxima de prórrogas en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "modificationPercent", label: "Porcentaje máximo de modificación prevista", control: "INTEGER", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.extensionStructure", label: "Estructura de prórrogas", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.extensionNoticeMonths", label: "Preaviso de prórroga en meses", control: "INTEGER", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.plannedModificationRegime", label: "Régimen de modificaciones previstas", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.plannedModificationJustification", label: "Causas, alcance y límites de la modificación prevista", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.plannedModificationProcedure", label: "Procedimiento de la modificación prevista", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.plannedModificationNoNewUnitPrices", label: "Prohibición de nuevos precios unitarios", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.plannedModificationValueEstimatedTreatment", label: "Tratamiento de la modificación en el valor estimado", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.contractManagerFunctions", label: "Facultades del responsable del contrato", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.performanceMonitoringRegime", label: "Seguimiento y control de la ejecución", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.invoiceSubmissionRegime", label: "Presentación de factura electrónica", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "technical.verificationMethods", label: "Métodos de comprobación de requisitos técnicos", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "technical.accessibilityRegime", label: "Accesibilidad universal y diseño para todas las personas", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "technical.environmentalTechnicalRegime", label: "Prescripciones técnicas ambientales", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "technical.equivalenceRegime", label: "Marcas, referencias y equivalencia", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "technical.specialRequirements", label: "Prescripciones especiales de subfamilia", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "dataProtection.processingScenario", label: "Escenario de acceso o tratamiento de datos", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "dataProtection.personalDataRegime", label: "Régimen de protección de datos", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "dataProtection.processorAgreementRegime", label: "Encargo del tratamiento", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "dataProtection.serverLocationAndSubprocessingRegime", label: "Servidores y subencargados", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "dataProtection.internationalTransferRegime", label: "Transferencias internacionales", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "security.informationSecurityRegime", label: "Seguridad de la información", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "security.ensRegime", label: "Aplicación y conformidad ENS", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "security.incidentContinuityRegime", label: "Incidentes y continuidad", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "criteria.awardCriteria", label: "Criterios de adjudicación", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "criteria.judgmentCriteriaExist", label: "Existencia de criterios sujetos a juicio de valor", control: "BOOLEAN", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "criteria.singleCriterionMotivation", label: "Motivación del criterio único", control: "TEXTAREA", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "criteria.formulaJustification", label: "Justificación de fórmulas", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "criteria.abnormallyLowTenderParameters", label: "Parámetros de ofertas anormalmente bajas", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "criteria.tieBreakCriteria", label: "Criterios de desempate", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.provisionalGuaranteeRequired", label: "Exigencia de garantía provisional", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.provisionalGuaranteePercent", label: "Porcentaje de garantía provisional", control: "DECIMAL", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.provisionalGuaranteeJustification", label: "Motivación de garantía provisional", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.definitiveGuaranteePercent", label: "Porcentaje de garantía definitiva", control: "DECIMAL", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.definitiveGuaranteeRegime", label: "Régimen y base de garantía definitiva", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.complementaryGuaranteePercent", label: "Porcentaje de garantía complementaria", control: "DECIMAL", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.complementaryGuaranteeJustification", label: "Motivación de garantía complementaria", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.warrantyPeriodMonths", label: "Plazo de garantía contractual en meses", control: "INTEGER", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "guarantees.warrantyPeriodRegime", label: "Régimen del plazo de garantía", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.specialExecutionConditions", label: "Condiciones especiales de ejecución", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true },
  { fieldPath: "execution.specialExecutionConditionsJustification", label: "Vinculación de las condiciones especiales", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.specialExecutionConditionsVerification", label: "Verificación de las condiciones especiales", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.specialExecutionConditionsConsequences", label: "Consecuencias del incumplimiento", control: "TABLE", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.specialExecutionConditionsApplyToSubcontractors", label: "Aplicación a subcontratistas", control: "BOOLEAN", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.subcontractingCriticalTasks", label: "Tareas críticas de ejecución directa", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.subcontractingPriorOfferDisclosure", label: "Identificación de subcontratación en la oferta", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.subcontractingCommunicationRegime", label: "Comunicación o autorización de subcontratos", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.subcontractingPaymentControlRegime", label: "Control de pagos a subcontratistas", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "execution.assignmentRequirements", label: "Requisitos de la cesión contractual", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true },
  { fieldPath: "closure.finalConsentRecord", label: "Conclusión, coherencia documental y consentimiento final", control: "TEXTAREA", requiredForValidatedSupplyAsa: false, humanValidationRequired: true, help: "Registro D20 generado por el servidor y ligado a las huellas del expediente, selección documental, PCAP, Memoria, PPT y ZIP." },
  { fieldPath: "economic.unitPrices", label: "Precios unitarios del catálogo", control: "TABLE", requiredForValidatedSupplyAsa: true, humanValidationRequired: true, help: "El catálogo detallado puede conservar además cantidades/consumos en la ficha adaptativa, pero los precios unitarios se promueven a la semántica universal existente; no se inventa technical.catalogue." },
] as const;

const LB22_CANONICAL_OR_DOMAIN_PATHS = new Set([
  "need", "object", "cpvMain", "cpvMainDescription", "cpvAdditional", "lots", "estimatedValueCents", "baseTenderBudgetCents", "procedure", "durationMonths", "extensionMonths", "modificationPercent", "awardCriteria", "solvency", "publicity",
  "processing.processingType", "processing.urgency", "processing.emergency", "regulation.harmonizedRegulation", "regulation.europeanFunding", "regulation.threshold", "regulation.deadlines",
  "economic.vatPercent", "economic.pblCostBreakdown", "economic.budgetApplication", "economic.annualities", "economic.annualityBudgetRows", "economic.fundingSource", "economic.priceRevisionRegime", "economic.priceRevisionJustification", "economic.priceRevisionFormula", "economic.priceRevisionCostStructure", "economic.priceRevisionIndices", "economic.priceRevisionAccrualLimits", "economic.priceRevisionPhysicalProfileSupported", "economic.unitPrices", "economic.referenceConsumption", "economic.projectedConsumption", "economic.maximumApprovedBudgetCents", "economic.initialEstimatedValueBaseCents", "economic.extensionAmountExVatCents", "economic.modificationAmountExVatCents", "economic.optionsAmountExVatCents", "economic.otherEstimatedValueComponentsCents", "economic.legalEstimatedValueCents", "economic.initialVatAmountCents", "economic.initialPblVatIncludedCents", "economic.needsBasedContractDa33", "economic.budgetCoversEntireContractLife", "economic.estimatedValueCalculationMethod", "economic.priceDeterminationRegime",
  "administrative.contractingAuthority", "administrative.promotingUnit", "administrative.competentBody", "administrative.administrativeFileNumber", "administrative.contractManager", "administrative.reservedContractDa4",
  "technical.technicalPurpose", "technical.technicalRequirements", "technical.verificationMethods", "technical.accessibilityRegime", "technical.environmentalTechnicalRegime", "technical.equivalenceRegime", "technical.specialRequirements", "technical.executionLocations", "technical.subrogationRequired", "technical.subrogationRegime",
  "dataProtection.processingScenario", "dataProtection.personalDataRegime", "dataProtection.processorAgreementRegime", "dataProtection.serverLocationAndSubprocessingRegime", "dataProtection.internationalTransferRegime", "security.informationSecurityRegime", "security.ensRegime", "security.incidentContinuityRegime",
  "lots.divisionIntoLots", "lots.lots", "lots.cpvAssignments", "lots.pblAllocations", "lots.maxOfferableLots", "lots.maxAwardableLots", "lots.noDivisionJustification",
  "guarantees.provisionalGuaranteeRequired", "guarantees.provisionalGuaranteePercent", "guarantees.provisionalGuaranteeJustification", "guarantees.definitiveGuaranteePercent", "guarantees.definitiveGuaranteeRegime", "guarantees.complementaryGuaranteePercent", "guarantees.complementaryGuaranteeJustification", "guarantees.warrantyPeriodMonths", "guarantees.warrantyPeriodRegime",
  "execution.specialExecutionConditions", "execution.specialExecutionConditionsJustification", "execution.specialExecutionConditionsVerification", "execution.specialExecutionConditionsConsequences", "execution.specialExecutionConditionsApplyToSubcontractors", "execution.specificPenalties", "execution.subcontractingRegime", "execution.subcontractingCriticalTasks", "execution.subcontractingPriorOfferDisclosure", "execution.subcontractingCommunicationRegime", "execution.subcontractingPaymentControlRegime", "execution.assignmentRegime", "execution.assignmentRequirements", "execution.paymentRegime", "execution.receiptAndAcceptanceRegime", "execution.contractManagerFunctions", "execution.performanceMonitoringRegime", "execution.invoiceSubmissionRegime", "execution.extensionStructure", "execution.extensionNoticeMonths", "execution.plannedModificationRegime", "execution.plannedModificationJustification", "execution.plannedModificationProcedure", "execution.plannedModificationNoNewUnitPrices", "execution.plannedModificationValueEstimatedTreatment",
  "criteria.awardCriteria", "criteria.economicSolvency", "criteria.technicalSolvency", "criteria.judgmentCriteriaExist", "criteria.singleCriterionMotivation", "criteria.formulaJustification", "criteria.abnormallyLowTenderParameters", "criteria.tieBreakCriteria",
  "closure.finalConsentRecord",
]);

for (const path of ["economic.valuationMethodology", "economic.valuationSupports", "economic.valuationDocuments", "economic.valuationEvidenceSufficient"]) LB22_CANONICAL_OR_DOMAIN_PATHS.add(path);

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
