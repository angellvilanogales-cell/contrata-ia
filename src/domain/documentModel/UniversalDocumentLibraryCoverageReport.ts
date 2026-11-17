import { DocumentType } from "./DocumentType";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { FinancingProfile, TechnicalDocumentFamily } from "./DocumentarySourceEvidenceCatalogue";
import { selectUniversalDocumentSource } from "./UniversalDocumentSourceSelector";

export interface DocumentLibraryCoverageRow {
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  procedure?: TipoProcedimiento;
  financing?: FinancingProfile;
  technicalFamily?: TechnicalDocumentFamily;
  status: string;
  generationReady: boolean;
  blockers: readonly string[];
}

export function buildDocumentLibraryCoverageReport(
  rows: readonly Omit<DocumentLibraryCoverageRow, "status" | "generationReady" | "blockers">[],
): readonly DocumentLibraryCoverageRow[] {
  return rows.map(row => {
    const result = selectUniversalDocumentSource(row);
    return {
      ...row,
      status: result.status,
      generationReady: result.status === "GENERAL_EDITABLE_SELECTED",
      blockers: result.blockers,
    };
  });
}
