import { DocumentType } from "../../../domain/documentModel/DocumentType";
import { DOCUMENTARY_SOURCE_EVIDENCE, type DocumentarySourceEvidence } from "../../../domain/documentModel/DocumentarySourceEvidenceCatalogue";
import { SERVICE_REGRESSION_CASE_005_CARL_CLEANING } from "../../../regression/ServiceRegressionCase005CarlCleaning";
import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE } from "../../../regression/ServiceRegressionCase007MaintenanceSeville";

export type ServiceSourceSubfamily = "CLEANING" | "TRAINING" | "MAINTENANCE" | "GENERAL_ADMINISTRATIVE";

export interface ServicePhysicalBaseline {
  contractType: "SERVICE";
  sourceCount: number;
  subfamilies: readonly ServiceSourceSubfamily[];
  sources: readonly DocumentarySourceEvidence[];
  regressionCases: readonly string[];
  pcap: {
    structuralEvidenceReady: boolean;
    editableBinaryIsolated: boolean;
    generalTemplatePromoted: boolean;
  };
  technicalCorpusReady: boolean;
  physicalPackageReady: false;
  blockers: readonly string[];
  humanValidationRequired: true;
}

/**
 * LB96 empieza desde evidencia real y nunca promueve un PDF/caso a plantilla.
 * La presencia de regresiones técnicas demuestra diversidad, no disponibilidad
 * de un modelo físico general.
 */
export function evaluateServicePhysicalBaseline(): ServicePhysicalBaseline {
  const sources = DOCUMENTARY_SOURCE_EVIDENCE.filter(item => item.contractType === "SERVICE");
  const pcapSources = sources.filter(item => item.documentType === DocumentType.PCAP);
  const structuralEvidenceReady = pcapSources.some(item => ["CASE_SOURCE", "STRUCTURAL_REFERENCE", "GENERAL_MODEL"].includes(item.role));
  const editableBinaryIsolated = pcapSources.some(item => item.editableBinaryVerified);
  const generalTemplatePromoted = pcapSources.some(item => item.editableBinaryVerified && item.generalizable && item.role === "GENERAL_MODEL");
  const families = new Set(sources.map(item => item.technicalFamily));
  const cleaningReady = families.has("CLEANING") && SERVICE_REGRESSION_CASE_005_CARL_CLEANING.facts.contractType === "SERVICIO";
  const trainingReady = families.has("TRAINING");
  const maintenanceReady = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.facts.contractType === "SERVICIO" && SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.sourceDocuments.includes("PPT");
  const technicalCorpusReady = cleaningReady && trainingReady && maintenanceReady;
  const blockers: string[] = [];
  if (!structuralEvidenceReady) blockers.push("No existe evidencia estructural PCAP Service suficientemente trazable.");
  if (!editableBinaryIsolated) blockers.push("No existe todavía un binario editable Service aislado y verificado.");
  if (!generalTemplatePromoted) blockers.push("No existe todavía un PCAP Service editable promovido como plantilla general.");
  if (!technicalCorpusReady) blockers.push("El corpus técnico Service no cubre limpieza, formación y mantenimiento de forma independiente.");
  return {
    contractType: "SERVICE",
    sourceCount: sources.length,
    subfamilies: ["CLEANING", "TRAINING", "MAINTENANCE", "GENERAL_ADMINISTRATIVE"],
    sources,
    regressionCases: [SERVICE_REGRESSION_CASE_005_CARL_CLEANING.id, SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.id],
    pcap: { structuralEvidenceReady, editableBinaryIsolated, generalTemplatePromoted },
    technicalCorpusReady,
    physicalPackageReady: false,
    blockers,
    humanValidationRequired: true,
  };
}
