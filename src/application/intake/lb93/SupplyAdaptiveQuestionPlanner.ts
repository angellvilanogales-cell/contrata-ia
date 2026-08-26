import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { SUPPLY_VERTICAL_FIELD_MANIFEST, type SupplyVerticalFieldDefinition } from "./SupplyVerticalFieldManifest";
import type { SupplySourceVariant } from "../../../domain/documentModel/UniversalSupplySourceCorpus";

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

/**
 * Planificador conservador: pregunta las dimensiones Supply obligatorias que faltan
 * y solo abre hechos condicionados cuando la subfamilia declarada los necesita.
 * No intenta adivinar procedimiento, financiación, solvencia o variante por CPV.
 */
export function planSupplyQuestions(record: UniversalEvidenceRecord): SupplyQuestionPlan {
  const pendingRequired = SUPPLY_VERTICAL_FIELD_MANIFEST.filter(field => field.requiredForWorkflowReview && !answered(record, field.fieldPath));
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
