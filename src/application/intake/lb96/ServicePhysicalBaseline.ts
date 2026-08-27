import { DocumentType } from "../../../domain/documentModel/DocumentType";
import { DOCUMENTARY_SOURCE_EVIDENCE, type DocumentarySourceEvidence } from "../../../domain/documentModel/DocumentarySourceEvidenceCatalogue";

export type ServiceSourceSubfamily = "CLEANING" | "TRAINING" | "MAINTENANCE" | "GENERAL_ADMINISTRATIVE";

export interface ServicePhysicalBaseline {
  contractType: "SERVICE";
  sourceCount: number;
  subfamilies: readonly ServiceSourceSubfamily[];
  sources: readonly DocumentarySourceEvidence[];
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
 * Esta evaluación debe permanecer en rojo hasta acreditar binario editable y
 * promoción general independiente del expediente donante.
 */
export function evaluateServicePhysicalBaseline(): ServicePhysicalBaseline {
  const sources = DOCUMENTARY_SOURCE_EVIDENCE.filter(item => item.contractType === "SERVICE");
  const pcapSources = sources.filter(item => item.documentType === DocumentType.PCAP);
  const structuralEvidenceReady = pcapSources.some(item => ["CASE_SOURCE", "STRUCTURAL_REFERENCE", "GENERAL_MODEL"].includes(item.role));
  const editableBinaryIsolated = pcapSources.some(item => item.editableBinaryVerified);
  const generalTemplatePromoted = pcapSources.some(item => item.editableBinaryVerified && item.generalizable && item.role === "GENERAL_MODEL");
  const families = new Set(sources.map(item => item.technicalFamily));
  const technicalCorpusReady = ["CLEANING", "TRAINING", "MAINTENANCE"].every(family => families.has(family as any));
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
    pcap: { structuralEvidenceReady, editableBinaryIsolated, generalTemplatePromoted },
    technicalCorpusReady,
    physicalPackageReady: false,
    blockers,
    humanValidationRequired: true,
  };
}
