import { DocumentType } from "./DocumentType";
import { SupplySourceVariant, UNIVERSAL_SUPPLY_SOURCE_CORPUS } from "./UniversalSupplySourceCorpus";

export type SupplyPromotionState = "STRUCTURAL_CORE_READY" | "VARIANT_EVIDENCE_READY" | "PHYSICAL_TEMPLATE_BLOCKED" | "PRODUCTION_READY";

export interface SupplyPromotionReadiness {
  documentType: DocumentType;
  state: SupplyPromotionState;
  independentCases: number;
  independentVariants: number;
  editableVerifiedCases: number;
  blockers: readonly string[];
}

/**
 * LB91.78-80. La abundancia de Memorias/PPT PDF permite consolidar estructura,
 * pero producción física exige un activo general editable acreditado. El ODT de
 * ferretería cuenta como caso editable, no como plantilla general universal.
 */
export function assessSupplyPromotionReadiness(documentType: DocumentType): SupplyPromotionReadiness {
  const rows = UNIVERSAL_SUPPLY_SOURCE_CORPUS.filter(x =>
    documentType === DocumentType.MEMORY ? x.memoryAvailable : documentType === DocumentType.PPT ? x.pptAvailable : false,
  );
  const independentCases = new Set(rows.map(x => x.expediente)).size;
  const independentVariants = new Set(rows.map(x => x.variant)).size;
  const editableVerifiedCases = rows.filter(x => x.editableVerified).length;
  const blockers: string[] = [];

  if (independentCases < 2) blockers.push("Falta contraste entre expedientes independientes.");
  if (independentVariants < 2) blockers.push("Falta contraste entre subfamilias de suministro distintas.");
  blockers.push("No existe todavía un modelo general ODT/DOCX de Memoria/PPT acreditado como reutilizable universal.");

  const structuralReady = independentCases >= 2 && independentVariants >= 2;
  return {
    documentType,
    state: structuralReady ? "PHYSICAL_TEMPLATE_BLOCKED" : "VARIANT_EVIDENCE_READY",
    independentCases,
    independentVariants,
    editableVerifiedCases,
    blockers,
  };
}

export interface SupplyStructuralCore {
  documentType: DocumentType;
  commonBlocks: readonly string[];
  variantSpecificExamples: Readonly<Record<SupplySourceVariant, readonly string[]>>;
  physicalGenerationAllowed: false;
  humanValidationRequired: true;
}

export function buildSupplyStructuralCore(documentType: DocumentType): SupplyStructuralCore {
  const commonMemory = ["necesidad e idoneidad", "objeto y CPV", "lotes", "presupuesto y valor estimado", "procedimiento", "criterios", "ejecución"];
  const commonPpt = ["objeto técnico", "especificaciones", "entrega/implantación", "seguimiento", "recepción/conformidad", "garantía"];
  return {
    documentType,
    commonBlocks: documentType === DocumentType.MEMORY ? commonMemory : commonPpt,
    variantSpecificExamples: {
      CATALOGUE_NEEDS: ["pedidos sucesivos", "referencias y precios unitarios"],
      ICT_LICENSE_OR_SOFTWARE: ["licenciamiento", "soporte y actualización"],
      DIGITAL_EQUIPMENT: ["despliegue masivo", "inventario/etiquetado", "DNSH/PRTR cuando proceda"],
      SUPPLY_WITH_SERVICE_COMPONENT: ["plataforma de gestión", "soporte", "protección de datos"],
      MEDICAL_FRAMEWORK: ["acuerdo marco", "lotes", "material sanitario fungible"],
      FURNITURE_INSTALLATION: ["montaje", "instalación", "puesta en funcionamiento", "gestión de residuos"],
      ORDINARY_GLOBAL_PRICE: ["entrega única o global", "precio global"],
    },
    physicalGenerationAllowed: false,
    humanValidationRequired: true,
  };
}
