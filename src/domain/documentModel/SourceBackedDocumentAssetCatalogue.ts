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
 * LB91.26 — inventario físico conservador.
 * Un activo de expediente concreto no se promueve a modelo general por el solo
 * hecho de estar verificado. La promoción exige fuente administrativa general
 * acreditada y validación expresa del alcance.
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
    notes: ["Activo editable verificado del pipeline protegido; su existencia no acredita por sí sola cobertura universal de PCAP de suministros."],
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
    notes: ["PPT editable verificado para ferretería; el catálogo técnico de ese expediente no se considera universal para otros suministros."],
  },
  {
    id: "SERVICE-PCAP-OPEN-REAL-SOURCE",
    contractType: "SERVICE",
    documentType: DocumentType.PCAP,
    scope: "GENERAL_OFFICIAL",
    verification: "SOURCE_ONLY",
    applicableProcedures: [TipoProcedimiento.ABIERTO],
    sourceId: "PCAP_SERVICES_OPEN_2025_12",
    mediaType: "PDF",
    generationCandidate: false,
    notes: ["Fuente administrativa general identificada; pendiente verificar el binario editable concreto antes de habilitar generación física."],
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

export function getVerifiedEditableAssets(): readonly SourceBackedDocumentAsset[] {
  return SOURCE_BACKED_DOCUMENT_ASSETS.filter(asset => asset.verification === "VERIFIED_EDITABLE");
}
