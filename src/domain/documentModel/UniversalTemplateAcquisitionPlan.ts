import { DocumentType } from "./DocumentType";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { FinancingProfile, TechnicalDocumentFamily } from "./DocumentarySourceEvidenceCatalogue";

export type AcquisitionNeed = "EDITABLE_ORIGINAL" | "SECOND_INDEPENDENT_CASE" | "PROVENANCE_VERIFICATION" | "STYLE_FINGERPRINT" | "SHA256";

export interface UniversalTemplateAcquisitionTarget {
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  financing: FinancingProfile;
  technicalFamily: TechnicalDocumentFamily;
  priority: number;
  needs: readonly AcquisitionNeed[];
  reason: string;
}

/**
 * LB91.61-64. Cola explícita y determinista: prioriza cerrar paquetes completos
 * antes de multiplicar variantes aisladas. No crea ni promociona plantillas.
 */
export const UNIVERSAL_TEMPLATE_ACQUISITION_PLAN: readonly UniversalTemplateAcquisitionTarget[] = [
  {
    contractType: "SUPPLY", documentType: DocumentType.MEMORY, financing: "AUTOFINANCED", technicalFamily: "CATALOGUE_NEEDS_SUPPLY", priority: 100,
    needs: ["SECOND_INDEPENDENT_CASE"], reason: "Existe Memoria editable verificada del caso ferretería, pero falta contraste independiente antes de generalizar.",
  },
  {
    contractType: "SUPPLY", documentType: DocumentType.PPT, financing: "AUTOFINANCED", technicalFamily: "CATALOGUE_NEEDS_SUPPLY", priority: 99,
    needs: ["SECOND_INDEPENDENT_CASE"], reason: "Existe PPT editable de caso; falta una segunda fuente independiente equivalente.",
  },
  {
    contractType: "SERVICE", documentType: DocumentType.PCAP, financing: "EU_FUNDS", technicalFamily: "GENERAL_ADMINISTRATIVE", priority: 95,
    needs: ["EDITABLE_ORIGINAL", "PROVENANCE_VERIFICATION", "SHA256", "STYLE_FINGERPRINT"], reason: "Hay candidato ODT detectado, pero está pendiente de aislamiento y verificación.",
  },
  {
    contractType: "SERVICE", documentType: DocumentType.PPT, financing: "UNKNOWN", technicalFamily: "CLEANING", priority: 90,
    needs: ["EDITABLE_ORIGINAL"], reason: "Existen varios PPT reales de limpieza, pero no un binario editable general acreditado.",
  },
  {
    contractType: "SERVICE", documentType: DocumentType.MEMORY, financing: "UNKNOWN", technicalFamily: "MAINTENANCE", priority: 88,
    needs: ["EDITABLE_ORIGINAL"], reason: "Hay memoria real de mantenimiento SAE Sevilla; falta activo editable acreditado para promoción física.",
  },
  {
    contractType: "WORKS", documentType: DocumentType.PCAP, financing: "UNKNOWN", technicalFamily: "GENERAL_ADMINISTRATIVE", priority: 80,
    needs: ["EDITABLE_ORIGINAL", "PROVENANCE_VERIFICATION", "SHA256", "STYLE_FINGERPRINT"], reason: "Existe referencia estructural de obras, pero no modelo físico general verificado.",
  },
  {
    contractType: "CONCESSION", documentType: DocumentType.PCAP, financing: "UNKNOWN", technicalFamily: "CONCESSION_OPERATION", priority: 70,
    needs: ["SECOND_INDEPENDENT_CASE", "EDITABLE_ORIGINAL"], reason: "La cobertura jurídica existe, pero falta expediente documental real suficiente y activo editable.",
  },
] as const;

export function getUniversalTemplateAcquisitionQueue(): readonly UniversalTemplateAcquisitionTarget[] {
  return [...UNIVERSAL_TEMPLATE_ACQUISITION_PLAN].sort((a, b) => b.priority - a.priority);
}

export function getAcquisitionTargetsFor(contractType: UniversalTargetContractType): readonly UniversalTemplateAcquisitionTarget[] {
  return getUniversalTemplateAcquisitionQueue().filter(item => item.contractType === contractType);
}
