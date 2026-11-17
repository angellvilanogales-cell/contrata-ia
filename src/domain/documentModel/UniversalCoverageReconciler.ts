import { DocumentType } from "./DocumentType";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { assessDiscoveryCoverage } from "./UniversalDocumentDiscoveryEngine";
import { evaluateDocumentarySourceCoverage } from "../../engines/DocumentarySourceCoverageEngine";

export type ReconciledCoverageStatus = "PRODUCTION_READY" | "EDITABLE_CASE_ONLY" | "MULTI_CASE_DOCUMENTED" | "DOCUMENTED" | "MISSING";

export interface ReconciledCoverageRow {
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  status: ReconciledCoverageStatus;
  independentCases: number;
  physicalUniversalGenerationReady: boolean;
  blockers: readonly string[];
}

/** LB91.70-72. Reconciliación conservadora entre catálogo físico y descubrimientos de fuentes. */
export function reconcileUniversalDocumentCoverage(contractType: UniversalTargetContractType, documentType: DocumentType): ReconciledCoverageRow {
  const physical = evaluateDocumentarySourceCoverage(contractType, documentType);
  const discovered = assessDiscoveryCoverage(contractType, documentType);
  if (physical.physicalUniversalGenerationReady) {
    return { contractType, documentType, status: "PRODUCTION_READY", independentCases: discovered.independentCases, physicalUniversalGenerationReady: true, blockers: [] };
  }
  if (physical.status === "CASE_EDITABLE") {
    return { contractType, documentType, status: "EDITABLE_CASE_ONLY", independentCases: discovered.independentCases, physicalUniversalGenerationReady: false, blockers: physical.blockers };
  }
  if (discovered.independentCases >= 2) {
    return { contractType, documentType, status: "MULTI_CASE_DOCUMENTED", independentCases: discovered.independentCases, physicalUniversalGenerationReady: false, blockers: ["Existe contraste multicaso, pero falta activo editable general verificado."] };
  }
  if (discovered.documented || physical.status !== "MISSING") {
    return { contractType, documentType, status: "DOCUMENTED", independentCases: discovered.independentCases, physicalUniversalGenerationReady: false, blockers: physical.blockers.length ? physical.blockers : ["Hay evidencia documental, pero no suficiente para generación universal física."] };
  }
  return { contractType, documentType, status: "MISSING", independentCases: 0, physicalUniversalGenerationReady: false, blockers: ["No existe evidencia documental suficiente."] };
}

export function reconcileCorePackage(contractType: UniversalTargetContractType): readonly ReconciledCoverageRow[] {
  return [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT].map(type => reconcileUniversalDocumentCoverage(contractType, type));
}
