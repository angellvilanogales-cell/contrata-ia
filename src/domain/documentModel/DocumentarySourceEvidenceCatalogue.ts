import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";

export type DocumentarySourceFormat = "ODT" | "DOCX" | "PDF" | "MIXED";
export type DocumentaryEvidenceRole = "GENERAL_MODEL" | "CASE_SOURCE" | "STRUCTURAL_REFERENCE";

export interface DocumentarySourceEvidence {
  id: string;
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  format: DocumentarySourceFormat;
  role: DocumentaryEvidenceRole;
  applicableProcedures: readonly TipoProcedimiento[];
  editableBinaryVerified: boolean;
  generalizable: boolean;
  sourceTitle: string;
  expediente?: string;
  observations: readonly string[];
}

/**
 * LB91.36 — fuentes reales contrastadas en la biblioteca del proyecto.
 * El catálogo separa evidencia documental de plantilla física. Un PDF real o un
 * ODT de expediente concreto puede reforzar estructura/regresión sin convertirse
 * por ello en plantilla universal generable.
 */
export const DOCUMENTARY_SOURCE_EVIDENCE: readonly DocumentarySourceEvidence[] = [
  {
    id: "JDA-SUPPLY-ASA-PCAP-GENERAL-ODT",
    contractType: "SUPPLY",
    documentType: DocumentType.PCAP,
    format: "ODT",
    role: "GENERAL_MODEL",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    editableBinaryVerified: true,
    generalizable: true,
    sourceTitle: "Modelo PCAP suministro abierto simplificado abreviado - presentación electrónica - autofinanciación",
    observations: ["Modelo general recomendado por la Comisión Consultiva; único activo general físicamente verificado en este tramo."],
  },
  {
    id: "CARL-2024-PCAP-SERVICE-SIMPLIFIED-ORDINARY",
    contractType: "SERVICE",
    documentType: DocumentType.PCAP,
    format: "PDF",
    role: "CASE_SOURCE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO],
    editableBinaryVerified: false,
    generalizable: false,
    sourceTitle: "PCAP servicio de limpieza sede del Consejo Andaluz de Relaciones Laborales",
    expediente: "ADM-2024-0004 / CONTR/2024/636510",
    observations: [
      "PCAP real de servicios por abierto simplificado ordinario basado en modelo recomendado.",
      "Sirve para contraste estructural y procedimental; el PDF no habilita generación física universal.",
    ],
  },
  {
    id: "CARL-2024-PPT-SERVICE-CLEANING",
    contractType: "SERVICE",
    documentType: DocumentType.PPT,
    format: "PDF",
    role: "CASE_SOURCE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO],
    editableBinaryVerified: false,
    generalizable: false,
    sourceTitle: "PPT servicio de limpieza sede del Consejo Andaluz de Relaciones Laborales",
    expediente: "ADM-2024-0004 / CONTR/2024/636510",
    observations: ["Acredita estructura técnica de limpieza, subrogación y medios; no se generaliza a cualquier servicio."],
  },
  {
    id: "SAE-HUELVA-PPT-SERVICE-CLEANING",
    contractType: "SERVICE",
    documentType: DocumentType.PPT,
    format: "PDF",
    role: "STRUCTURAL_REFERENCE",
    applicableProcedures: [],
    editableBinaryVerified: false,
    generalizable: false,
    sourceTitle: "PPT servicio de limpieza oficinas y centros de empleo SAE Huelva",
    observations: ["Segundo patrón real independiente de limpieza; refuerza estructura de alcance, centros, frecuencias y consumibles."],
  },
  {
    id: "FPE-5G-2024-PPT-SERVICE-TRAINING",
    contractType: "SERVICE",
    documentType: DocumentType.PPT,
    format: "PDF",
    role: "STRUCTURAL_REFERENCE",
    applicableProcedures: [],
    editableBinaryVerified: false,
    generalizable: false,
    sourceTitle: "PPT acciones formativas FPE en tecnologías y entornos 5G",
    expediente: "ADM-2023-01 5G",
    observations: [
      "Patrón real de una subfamilia de servicios distinta de limpieza.",
      "Demuestra que un PPT universal de servicios no puede reducirse a un único esquema técnico rígido.",
    ],
  },
  {
    id: "FERRETERIA-2026-MEMORY-ODT",
    contractType: "SUPPLY",
    documentType: DocumentType.MEMORY,
    format: "ODT",
    role: "CASE_SOURCE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    editableBinaryVerified: true,
    generalizable: false,
    sourceTitle: "Memoria justificativa suministro de ferretería SSCC SAE",
    expediente: "CONTR/2026/240267",
    observations: ["Activo editable de caso protegido; útil para extraer bloques comunes, no para promover una memoria universal sin más contraste."],
  },
  {
    id: "FERRETERIA-2026-PPT-ODT",
    contractType: "SUPPLY",
    documentType: DocumentType.PPT,
    format: "ODT",
    role: "CASE_SOURCE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    editableBinaryVerified: true,
    generalizable: false,
    sourceTitle: "PPT suministro de materiales de ferretería SSCC SAE",
    expediente: "CONTR/2026/240267",
    observations: ["Activo editable y verificable del caso; válido para suministros por necesidades de catálogo, no para cualquier suministro."],
  },
] as const;

export function findDocumentarySourceEvidence(
  contractType?: UniversalTargetContractType,
  documentType?: DocumentType,
): readonly DocumentarySourceEvidence[] {
  return DOCUMENTARY_SOURCE_EVIDENCE.filter(item =>
    (!contractType || item.contractType === contractType) && (!documentType || item.documentType === documentType),
  );
}

export function getGeneralizableEditableEvidence(): readonly DocumentarySourceEvidence[] {
  return DOCUMENTARY_SOURCE_EVIDENCE.filter(item => item.generalizable && item.editableBinaryVerified);
}
