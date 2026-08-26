import { DocumentType } from "./DocumentType";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { TechnicalDocumentFamily } from "./DocumentarySourceEvidenceCatalogue";

export type DiscoveryEvidenceLevel = "CASE_DOCUMENTED" | "EDITABLE_VERIFIED" | "GENERAL_MODEL_VERIFIED";

export interface UniversalDocumentDiscoveryRecord {
  id: string;
  expediente: string;
  contractType: UniversalTargetContractType;
  documentTypes: readonly DocumentType[];
  technicalFamily: TechnicalDocumentFamily;
  level: DiscoveryEvidenceLevel;
  sourceIndependent: boolean;
  notes: readonly string[];
}

/**
 * LB91.66-69. Registro de casos reales localizados en las fuentes del proyecto.
 * CASE_DOCUMENTED acredita existencia documental, no plantilla universal.
 */
export const UNIVERSAL_DOCUMENT_DISCOVERY: readonly UniversalDocumentDiscoveryRecord[] = [
  { id: "SUPPLY-PANDA-AVRA", expediente: "REG-SUPPLY-002", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Suministro ordinario, contraste independiente del caso DA33."] },
  { id: "SUPPLY-AULAS-DIGITALES", expediente: "REG-SUPPLY-003", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Nueve lotes, abierto SARA, DA33."] },
  { id: "SUPPLY-SAS-AM", expediente: "REG-SUPPLY-004", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Acuerdo marco con lotes y juicio de valor."] },
  { id: "SUPPLY-TABLETS", expediente: "REG-SUPPLY-005", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Tablets y plataforma, abierto, DA33."] },
  { id: "SUPPLY-VEIASA", expediente: "REG-SUPPLY-006", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Suministro ordinario, precio global, sin DA33."] },
  { id: "SERVICE-CARL", expediente: "REG-SERVICE-005", contractType: "SERVICE", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "CLEANING", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Limpieza CARL, fuente real independiente."] },
  { id: "SERVICE-MAINT-SEVILLA", expediente: "REG-SERVICE-007", contractType: "SERVICE", documentTypes: [DocumentType.MEMORY, DocumentType.PPT], technicalFamily: "MAINTENANCE", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Mantenimiento integral SAE Sevilla."] },
] as const;

export interface DiscoveryCoverageAssessment {
  independentCases: number;
  documented: boolean;
  editableVerified: boolean;
  generalModelVerified: boolean;
}

export function assessDiscoveryCoverage(contractType: UniversalTargetContractType, documentType: DocumentType): DiscoveryCoverageAssessment {
  const rows = UNIVERSAL_DOCUMENT_DISCOVERY.filter(x => x.contractType === contractType && x.documentTypes.includes(documentType));
  const independentCases = new Set(rows.filter(x => x.sourceIndependent).map(x => x.expediente)).size;
  return {
    independentCases,
    documented: rows.length > 0,
    editableVerified: rows.some(x => x.level === "EDITABLE_VERIFIED" || x.level === "GENERAL_MODEL_VERIFIED"),
    generalModelVerified: rows.some(x => x.level === "GENERAL_MODEL_VERIFIED"),
  };
}
