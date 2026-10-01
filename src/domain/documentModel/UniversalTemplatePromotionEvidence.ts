import { DocumentType } from "./DocumentType";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { TechnicalDocumentFamily } from "./DocumentarySourceEvidenceCatalogue";

export type TemplateEvidenceKind = "INDEPENDENT_CASE" | "GENERAL_MODEL" | "SAME_CASE_VERSION";

export interface TemplatePromotionEvidenceItem {
  id: string;
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  technicalFamily: TechnicalDocumentFamily;
  kind: TemplateEvidenceKind;
  expediente?: string;
  editable: boolean;
  sourceVerified: boolean;
}

export interface TemplatePromotionAssessment {
  promotable: boolean;
  independentCases: number;
  hasVerifiedEditableBase: boolean;
  blockers: readonly string[];
}

/**
 * LB91.56-59. Una sucesión de versiones del mismo expediente no constituye
 * contraste multicaso. La promoción exige evidencia independiente y un activo
 * editable cuya identidad/procedencia esté verificada.
 */
export function assessUniversalTemplatePromotion(
  contractType: UniversalTargetContractType,
  documentType: DocumentType,
  technicalFamily: TechnicalDocumentFamily,
  evidence: readonly TemplatePromotionEvidenceItem[],
): TemplatePromotionAssessment {
  const relevant = evidence.filter(item =>
    item.contractType === contractType &&
    item.documentType === documentType &&
    item.technicalFamily === technicalFamily,
  );

  const independentIds = new Set(
    relevant
      .filter(item => item.kind === "INDEPENDENT_CASE" || item.kind === "GENERAL_MODEL")
      .map(item => item.expediente ?? item.id),
  );
  const independentCases = independentIds.size;
  const hasVerifiedEditableBase = relevant.some(item => item.editable && item.sourceVerified);
  const blockers: string[] = [];

  if (independentCases < 2) blockers.push("Se requieren al menos dos fuentes independientes; versiones del mismo expediente no cuentan como contraste multicaso.");
  if (!hasVerifiedEditableBase) blockers.push("Falta un activo ODT/DOCX editable con identidad y procedencia verificadas.");

  return { promotable: blockers.length === 0, independentCases, hasVerifiedEditableBase, blockers };
}

export interface UniversalDocumentComposition {
  commonBlocks: readonly string[];
  technicalOverlay: readonly string[];
  humanValidationRequired: true;
}

/**
 * Composición lógica, no render físico. Los bloques comunes nunca sustituyen
 * las cláusulas técnicas propias de la subfamilia.
 */
export function composeUniversalDocumentStructure(
  documentType: DocumentType,
  technicalFamily: TechnicalDocumentFamily,
): UniversalDocumentComposition {
  const commonMemory = ["identificación", "necesidad e idoneidad", "objeto y CPV", "lotes", "economía", "procedimiento", "criterios", "ejecución"];
  const commonPpt = ["objeto técnico", "alcance", "plazo", "responsable", "condiciones de ejecución", "recepción/conformidad"];
  const overlays: Record<TechnicalDocumentFamily, readonly string[]> = {
    GENERAL_ADMINISTRATIVE: [], CLEANING: ["centros y frecuencias", "medios y consumibles", "subrogación cuando proceda"],
    TRAINING: ["programa formativo", "docencia", "evaluación y acreditación"],
    MAINTENANCE: ["inventario de instalaciones", "preventivo/correctivo", "GMAO y niveles de servicio"],
    CATALOGUE_NEEDS_SUPPLY: ["catálogo de referencias", "pedidos sucesivos", "precios unitarios y entregas"],
    WORKS_PROJECT: ["proyecto", "mediciones", "ejecución de unidades y recepción"],
    CONCESSION_OPERATION: ["explotación", "niveles de servicio", "riesgo operacional y reversión"], OTHER: [],
  };
  return {
    commonBlocks: documentType === DocumentType.MEMORY ? commonMemory : documentType === DocumentType.PPT ? commonPpt : [],
    technicalOverlay: overlays[technicalFamily],
    humanValidationRequired: true,
  };
}
