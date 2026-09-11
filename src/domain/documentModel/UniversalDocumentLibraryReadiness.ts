import { DocumentType } from "./DocumentType";
import { SourceBackedDocumentAsset, findDocumentAssets } from "./SourceBackedDocumentAssetCatalogue";
import { assessGeneralOfficialAssetPromotion } from "./GeneralOfficialEditableAssetPromotion";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { TipoProcedimiento } from "../procedimiento/TipoProcedimiento";

export interface UniversalDocumentLibraryReadiness {
  contractType: UniversalTargetContractType;
  procedure: TipoProcedimiento;
  readyDocuments: readonly DocumentType[];
  missingDocuments: readonly DocumentType[];
  blockers: readonly string[];
  universalPackageReady: boolean;
}

const REQUIRED_PACKAGE = [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT] as const;

function eligible(asset: SourceBackedDocumentAsset, procedure: TipoProcedimiento): boolean {
  return asset.applicableProcedures.includes(procedure) && assessGeneralOfficialAssetPromotion(asset).promotable;
}

/** Estado físico de la biblioteca general, separado de los paquetes de caso protegidos. */
export function assessUniversalDocumentLibrary(
  contractType: UniversalTargetContractType,
  procedure: TipoProcedimiento,
): UniversalDocumentLibraryReadiness {
  const readyDocuments: DocumentType[] = [];
  const missingDocuments: DocumentType[] = [];
  const blockers: string[] = [];

  for (const documentType of REQUIRED_PACKAGE) {
    const candidates = findDocumentAssets(contractType, documentType).filter(asset => eligible(asset, procedure));
    if (candidates.length > 0) readyDocuments.push(documentType);
    else {
      missingDocuments.push(documentType);
      blockers.push(`Falta modelo general editable verificado para ${contractType}/${procedure}/${documentType}.`);
    }
  }

  return {
    contractType,
    procedure,
    readyDocuments,
    missingDocuments,
    blockers,
    universalPackageReady: missingDocuments.length === 0,
  };
}
