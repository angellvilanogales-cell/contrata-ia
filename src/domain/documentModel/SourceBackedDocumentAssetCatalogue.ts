import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";

export type DocumentAssetScope = "GENERAL_OFFICIAL" | "CASE_PROTECTED" | "STRUCTURAL_REFERENCE";
export type DocumentAssetVerification = "VERIFIED_EDITABLE" | "SOURCE_ONLY" | "STRUCTURAL_ONLY";

export interface SourceBackedDocumentAsset {
  id: string;
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  scope: DocumentAssetScope;
  verification: DocumentAssetVerification;
  applicableProcedures: readonly TipoProcedimiento[];
  sourceId: string;
  templateId?: string;
  mediaType?: "ODT" | "DOCX" | "PDF";
  sha256?: string;
  styleFingerprint?: string;
  caseId?: string;
  generationCandidate: boolean;
  notes: readonly string[];
}

/**
 * Inventario físico conservador. Primero se conservan los activos de caso para
 * los flujos protegidos históricos; los modelos generales se consultan por su
 * scope específico y nunca sustituyen implícitamente a un activo de expediente.
 */
export const SOURCE_BACKED_DOCUMENT_ASSETS: readonly SourceBackedDocumentAsset[] = [
  {
    id: "FERRETERIA-PCAP-PROTECTED-EDITABLE",
    contractType: "SUPPLY",
    documentType: DocumentType.PCAP,
    scope: "CASE_PROTECTED",
    verification: "VERIFIED_EDITABLE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    sourceId: "jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",
    templateId: "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17",
    mediaType: "ODT",
    sha256: "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
    styleFingerprint: "sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee",
    caseId: "CONTR/2026/240267",
    generationCandidate: true,
    notes: ["Uso protegido del modelo oficial dentro del expediente de ferretería; las decisiones particulares del Anexo I siguen siendo específicas del caso."],
  },
  {
    id: "FERRETERIA-MEMORY-V12-PROTECTED-EDITABLE",
    contractType: "SUPPLY",
    documentType: DocumentType.MEMORY,
    scope: "CASE_PROTECTED",
    verification: "VERIFIED_EDITABLE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    sourceId: "case:CONTR-2026-240267:memoria:v12:editable",
    templateId: "case:CONTR-2026-240267:memoria:v12:editable",
    mediaType: "ODT",
    sha256: "36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc",
    styleFingerprint: "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d",
    caseId: "CONTR/2026/240267",
    generationCandidate: true,
    notes: ["Memoria editable verificada para el expediente protegido; no se promueve automáticamente a memoria general de suministros."],
  },
  {
    id: "FERRETERIA-PPT-V6-PROTECTED-EDITABLE",
    contractType: "SUPPLY",
    documentType: DocumentType.PPT,
    scope: "CASE_PROTECTED",
    verification: "VERIFIED_EDITABLE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    sourceId: "case:CONTR-2026-240267:ppt:v6:editable",
    templateId: "case:CONTR-2026-240267:ppt:v6:editable",
    mediaType: "ODT",
    sha256: "c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09",
    styleFingerprint: "sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390",
    caseId: "CONTR/2026/240267",
    generationCandidate: true,
    notes: ["PPT editable verificado para ferretería; su catálogo técnico no se considera universal para otros suministros."],
  },
  {
    id: "JDA-SUPPLY-ASA-AUTOFINANCED-PCAP-OFFICIAL",
    contractType: "SUPPLY",
    documentType: DocumentType.PCAP,
    scope: "GENERAL_OFFICIAL",
    verification: "VERIFIED_EDITABLE",
    applicableProcedures: [TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO],
    sourceId: "jda:cccp:pcap:supply:asa:autofinanced:2025-12-17:odt",
    templateId: "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17",
    mediaType: "ODT",
    sha256: "45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc",
    styleFingerprint: "sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee",
    generationCandidate: true,
    notes: [
      "Modelo recomendado general de la Comisión Consultiva de Contratación Pública para suministro por procedimiento abierto simplificado abreviado, presentación electrónica y autofinanciación.",
      "La acreditación alcanza este PCAP y esta combinación procedimental; no acredita Memoria/PPT universales ni otros procedimientos o financiaciones.",
    ],
  },
  {
    id: "SERVICE-PCAP-OPEN-REAL-SOURCE",
    contractType: "SERVICE",
    documentType: DocumentType.PCAP,
    scope: "GENERAL_OFFICIAL",
    verification: "SOURCE_ONLY",
    applicableProcedures: [TipoProcedimiento.ABIERTO],
    sourceId: "PCAP_SERVICES_OPEN_REAL_JDA_SOURCE",
    mediaType: "PDF",
    generationCandidate: false,
    notes: [
      "Fuente real de PCAP de servicios abierto basada en el modelo recomendado de la Comisión Consultiva.",
      "La fuente disponible en el inventario es PDF; no se habilita generación física hasta recuperar y verificar el ODT/DOCX general correspondiente.",
    ],
  },
  {
    id: "WORKS-PCAP-OPEN-REAL-SOURCE",
    contractType: "WORKS",
    documentType: DocumentType.PCAP,
    scope: "STRUCTURAL_REFERENCE",
    verification: "STRUCTURAL_ONLY",
    applicableProcedures: [TipoProcedimiento.ABIERTO],
    sourceId: "PCAP_WORKS_OPEN_REAL_USER_SOURCE",
    generationCandidate: false,
    notes: ["Fuente real suficiente para estructura y regresión, no para generación física hasta disponer de activo editable verificado."],
  },
] as const;

export function findDocumentAssets(contractType?: UniversalTargetContractType, documentType?: DocumentType): readonly SourceBackedDocumentAsset[] {
  return SOURCE_BACKED_DOCUMENT_ASSETS.filter(asset =>
    (!contractType || asset.contractType === contractType) && (!documentType || asset.documentType === documentType),
  );
}

/** Helper histórico de los paquetes protegidos; la biblioteca general se consulta separadamente. */
export function getVerifiedEditableAssets(): readonly SourceBackedDocumentAsset[] {
  return SOURCE_BACKED_DOCUMENT_ASSETS.filter(asset => asset.verification === "VERIFIED_EDITABLE" && asset.scope === "CASE_PROTECTED");
}

export function getAllVerifiedEditableAssets(): readonly SourceBackedDocumentAsset[] {
  return SOURCE_BACKED_DOCUMENT_ASSETS.filter(asset => asset.verification === "VERIFIED_EDITABLE");
}

export function getGeneralOfficialGenerationCandidates(): readonly SourceBackedDocumentAsset[] {
  return SOURCE_BACKED_DOCUMENT_ASSETS.filter(asset =>
    asset.scope === "GENERAL_OFFICIAL" && asset.verification === "VERIFIED_EDITABLE" && asset.generationCandidate,
  );
}
