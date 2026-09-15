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
 * LB91.66-80. Registro de casos reales localizados en las fuentes del proyecto.
 * CASE_DOCUMENTED acredita existencia documental, no plantilla universal.
 * La revisión física de los ZIP REG-SUPPLY confirma Memoria/PPT independientes
 * adicionales; no se confunde el PDF fuente con un activo editable promocionable.
 */
export const UNIVERSAL_DOCUMENT_DISCOVERY: readonly UniversalDocumentDiscoveryRecord[] = [
  { id: "SUPPLY-FERRETERIA", expediente: "CONTR/2026/240267", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "CATALOGUE_NEEDS_SUPPLY", level: "EDITABLE_VERIFIED", sourceIndependent: true, notes: ["Caso protegido; Memoria/PPT ODT verificados, no generalizables por sí solos."] },
  { id: "SUPPLY-PANDA-AVRA", expediente: "REG-SUPPLY-002", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Memoria, PCAP y PPT reales de suministro TIC; contraste independiente del caso DA33."] },
  { id: "SUPPLY-AULAS-DIGITALES", expediente: "REG-SUPPLY-003", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Memoria y PPT reales; nueve lotes, abierto SARA, financiación PRTR/Next Generation."] },
  { id: "SUPPLY-SAS-AM", expediente: "REG-SUPPLY-004", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Memoria real y PPT/Anexos de acuerdo marco sanitario; suministro de tracto sucesivo por precio unitario."] },
  { id: "SUPPLY-TABLETS", expediente: "REG-SUPPLY-005", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Memoria y PPT reales; suministro de tablets con componente de plataforma de gestión."] },
  { id: "SUPPLY-VEIASA", expediente: "REG-SUPPLY-006", contractType: "SUPPLY", documentTypes: [DocumentType.PCAP, DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Memoria, PCAP y PPT reales de Windows Server; suministro ordinario, precio global, sin DA33."] },
  { id: "SUPPLY-FURNITURE-CADIZ", expediente: "CONTR 2025 595132", contractType: "SUPPLY", documentTypes: [DocumentType.PPT, DocumentType.MEMORY], technicalFamily: "OTHER", level: "CASE_DOCUMENTED", sourceIndependent: true, notes: ["Memoria y PPT reales de mobiliario judicial con montaje, instalación y puesta en funcionamiento."] },
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
