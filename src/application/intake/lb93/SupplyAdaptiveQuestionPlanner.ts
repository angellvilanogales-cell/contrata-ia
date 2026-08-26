import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { SUPPLY_VERTICAL_FIELD_MANIFEST, type SupplyVerticalFieldDefinition } from "./SupplyVerticalFieldManifest";
import type { SupplySourceVariant } from "../../../domain/documentModel/UniversalSupplySourceCorpus";
import { TipoProcedimiento } from "../../../domain/procedimiento/TipoProcedimiento";

export interface SupplyQuestionPlan {
  pendingRequired: readonly SupplyVerticalFieldDefinition[];
  conditionalQuestions: readonly SupplyVerticalFieldDefinition[];
  nextQuestion?: SupplyVerticalFieldDefinition;
  completeForSupplySupplement: boolean;
  humanValidationRequired: true;
}

function answered(record: UniversalEvidenceRecord, path: string): boolean {
  const field = record.fields[path];
  return Boolean(field && !["PENDING", "SOURCE_CONFLICT", "SYSTEM_PROPOSAL"].includes(field.status));
}

function definition(path: string): SupplyVerticalFieldDefinition | undefined {
  return SUPPLY_VERTICAL_FIELD_MANIFEST.find(field => field.fieldPath === path);
}

function requiredForProcedure(record: UniversalEvidenceRecord, field: SupplyVerticalFieldDefinition): boolean {
  if (!field.requiredForWorkflowReview) return false;
  const procedure = record.fields.procedure?.value as TipoProcedimiento | undefined;
  const isSolvency = field.fieldPath === "criteria.economicSolvency" || field.fieldPath === "criteria.technicalSolvency";
  if (isSolvency && (procedure === TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO || procedure === TipoProcedimiento.CONTRATO_MENOR)) return false;
  return true;
}

/**
 * Planificador conservador: pregunta solo dimensiones Supply necesarias según
 * los hechos ya declarados. No adivina procedimiento, financiación, solvencia
 * ni variante por CPV. En el ASA abreviado no exige preguntas de solvencia,
 * de acuerdo con el art. 159.6.b LCSP; tampoco las fuerza en contrato menor.
 */
export function planSupplyQuestions(record: UniversalEvidenceRecord): SupplyQuestionPlan {
  const pendingRequired = SUPPLY_VERTICAL_FIELD_MANIFEST.filter(field => requiredForProcedure(record, field) && !answered(record, field.fieldPath));
  const variant = record.fields["technical.supplyVariant"]?.value as SupplySourceVariant | undefined;
  const conditionalPaths: string[] = [];

  if (variant === "CATALOGUE_NEEDS") conditionalPaths.push("technical.hasSuccessiveOrders");
  if (variant === "SUPPLY_WITH_SERVICE_COMPONENT") conditionalPaths.push("technical.hasServicePlatformComponent");
  if (variant === "FURNITURE_INSTALLATION") conditionalPaths.push("technical.hasInstallationOrAssembly");
  if (variant === "MEDICAL_FRAMEWORK") conditionalPaths.push("administrative.isFrameworkAgreement");
  if (variant === "DIGITAL_EQUIPMENT") conditionalPaths.push("regulation.europeanFunding");

  const conditionalQuestions = conditionalPaths
    .filter(path => !answered(record, path))
    .map(definition)
    .filter((field): field is SupplyVerticalFieldDefinition => Boolean(field));

  const nextQuestion = pendingRequired[0] ?? conditionalQuestions[0];
  return {
    pendingRequired,
    conditionalQuestions,
    nextQuestion,
    completeForSupplySupplement: pendingRequired.length === 0 && conditionalQuestions.length === 0,
    humanValidationRequired: true,
  };
}
