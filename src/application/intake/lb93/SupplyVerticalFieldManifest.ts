import { TipoProcedimiento } from "../../../domain/procedimiento/TipoProcedimiento";
import type { FinancingProfile } from "../../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import type { SupplySourceVariant } from "../../../domain/documentModel/UniversalSupplySourceCorpus";

export type SupplyVerticalControlKind = "TEXT" | "TEXTAREA" | "BOOLEAN" | "SELECT";

export interface SupplyVerticalFieldDefinition {
  fieldPath: string;
  label: string;
  control: SupplyVerticalControlKind;
  section: "NEED_OBJECT" | "PROCEDURE" | "ECONOMICS" | "TECHNICAL" | "SOLVENCY" | "EXECUTION";
  requiredForWorkflowReview: boolean;
  humanValidationRequired: true;
  help?: string;
  options?: readonly string[];
}

export const SUPPLY_VERTICAL_FIELD_MANIFEST: readonly SupplyVerticalFieldDefinition[] = [
  {
    fieldPath: "need",
    label: "Necesidad que se pretende satisfacer",
    control: "TEXTAREA",
    section: "NEED_OBJECT",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
    help: "Debe justificar necesidad e idoneidad del contrato; art. 28 LCSP.",
  },
  {
    fieldPath: "procedure",
    label: "Procedimiento de adjudicación",
    control: "SELECT",
    section: "PROCEDURE",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
    options: Object.values(TipoProcedimiento),
    help: "La selección debe contrastarse con importe, objeto y circunstancias del expediente; arts. 131 y ss. LCSP.",
  },
  {
    fieldPath: "processing.processingType",
    label: "Tipo de tramitación",
    control: "SELECT",
    section: "PROCEDURE",
    requiredForWorkflowReview: false,
    humanValidationRequired: true,
    options: ["ORDINARIA", "URGENTE"],
    help: "La tramitación urgente exige motivación y régimen propio; no se presume por el procedimiento.",
  },
  {
    fieldPath: "economic.fundingSource",
    label: "Perfil de financiación",
    control: "SELECT",
    section: "ECONOMICS",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
    options: ["AUTOFINANCED", "EU_FUNDS", "OTHER", "UNKNOWN"] satisfies readonly FinancingProfile[],
    help: "La financiación condiciona la plantilla física aplicable; UNKNOWN nunca habilita una plantilla específica por financiación.",
  },
  {
    fieldPath: "technical.supplyVariant",
    label: "Subfamilia técnica del suministro",
    control: "SELECT",
    section: "TECHNICAL",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
    options: [
      "CATALOGUE_NEEDS",
      "ICT_LICENSE_OR_SOFTWARE",
      "DIGITAL_EQUIPMENT",
      "SUPPLY_WITH_SERVICE_COMPONENT",
      "MEDICAL_FRAMEWORK",
      "FURNITURE_INSTALLATION",
      "ORDINARY_GLOBAL_PRICE",
    ] satisfies readonly SupplySourceVariant[],
    help: "Se declara expresamente: no se deduce automáticamente del CPV ni de un ejemplo documental.",
  },
  {
    fieldPath: "technical.hasSuccessiveOrders",
    label: "Existen pedidos o entregas sucesivas según necesidades",
    control: "BOOLEAN",
    section: "TECHNICAL",
    requiredForWorkflowReview: false,
    humanValidationRequired: true,
  },
  {
    fieldPath: "technical.hasServicePlatformComponent",
    label: "El suministro incorpora un componente real de servicio o plataforma",
    control: "BOOLEAN",
    section: "TECHNICAL",
    requiredForWorkflowReview: false,
    humanValidationRequired: true,
  },
  {
    fieldPath: "technical.hasInstallationOrAssembly",
    label: "El objeto incluye montaje o instalación",
    control: "BOOLEAN",
    section: "TECHNICAL",
    requiredForWorkflowReview: false,
    humanValidationRequired: true,
  },
  {
    fieldPath: "administrative.isFrameworkAgreement",
    label: "El expediente es un acuerdo marco",
    control: "BOOLEAN",
    section: "PROCEDURE",
    requiredForWorkflowReview: false,
    humanValidationRequired: true,
  },
  {
    fieldPath: "regulation.europeanFunding",
    label: "Existe financiación europea",
    control: "BOOLEAN",
    section: "ECONOMICS",
    requiredForWorkflowReview: false,
    humanValidationRequired: true,
  },
  {
    fieldPath: "criteria.economicSolvency",
    label: "Solvencia económica y financiera propuesta",
    control: "TEXTAREA",
    section: "SOLVENCY",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
    help: "Debe estar vinculada y ser proporcional al objeto; arts. 74 y 86-92 LCSP. El aplicativo no inventa umbrales de solvencia.",
  },
  {
    fieldPath: "criteria.technicalSolvency",
    label: "Solvencia técnica o profesional propuesta",
    control: "TEXTAREA",
    section: "SOLVENCY",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
    help: "Debe estar vinculada y ser proporcional al objeto; arts. 74 y 86-92 LCSP.",
  },
  {
    fieldPath: "technical.technicalRequirements",
    label: "Prescripciones técnicas esenciales",
    control: "TEXTAREA",
    section: "TECHNICAL",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
  },
  {
    fieldPath: "execution.receiptAndAcceptanceRegime",
    label: "Régimen de recepción y conformidad",
    control: "TEXTAREA",
    section: "EXECUTION",
    requiredForWorkflowReview: true,
    humanValidationRequired: true,
  },
] as const;

export const SUPPLY_VERTICAL_ALLOWED_PATHS = new Set(SUPPLY_VERTICAL_FIELD_MANIFEST.map(field => field.fieldPath));
