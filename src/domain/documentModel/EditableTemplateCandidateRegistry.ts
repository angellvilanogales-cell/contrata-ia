import { DocumentType } from "./DocumentType";
import { FinancingProfile, TechnicalDocumentFamily } from "./DocumentarySourceEvidenceCatalogue";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";

export type CandidateVerificationStatus = "DISCOVERED" | "ISOLATED" | "INTEGRITY_VERIFIED" | "PROMOTABLE" | "REJECTED";

export interface EditableTemplateCandidateVersion {
  candidateId: string;
  version: string;
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  procedure: TipoProcedimiento;
  financing: FinancingProfile;
  technicalFamily: TechnicalDocumentFamily;
  sourceTitle: string;
  status: CandidateVerificationStatus;
  binaryFormat: "ODT" | "DOCX";
  sha256?: string;
  styleFingerprint?: string;
  provenanceVerified: boolean;
  isolatedBinaryVerified: boolean;
  observations: readonly string[];
}

/** LB91.51 — registro trazable de candidatos; no concede por sí solo aptitud de producción. */
export const EDITABLE_TEMPLATE_CANDIDATES: readonly EditableTemplateCandidateVersion[] = [
  {
    candidateId: "SERVICE-ASA-EU-FUNDS-PCAP",
    version: "discovery-2026-08-26",
    contractType: "SERVICE",
    documentType: DocumentType.PCAP,
    procedure: TipoProcedimiento.ABIERTO_SIMPLIFICADO,
    financing: "EU_FUNDS",
    technicalFamily: "GENERAL_ADMINISTRATIVE",
    sourceTitle: "PCAP Servicios Abierto Simplificado ordinario juicio y fórmulas. Fondos Europeos. Presentación electrónica",
    status: "DISCOVERED",
    binaryFormat: "ODT",
    provenanceVerified: false,
    isolatedBinaryVerified: false,
    observations: [
      "Texto localizado dentro de ODT de trabajo de otro expediente.",
      "Pendiente recuperar/aislar el binario original antes de verificar integridad y estilo.",
    ],
  },
] as const;

export function latestCandidateVersion(candidateId: string): EditableTemplateCandidateVersion | undefined {
  return [...EDITABLE_TEMPLATE_CANDIDATES].reverse().find(item => item.candidateId === candidateId);
}
