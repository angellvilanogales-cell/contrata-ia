import { DocumentType } from "../../domain/documentModel/DocumentType";
import { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";
import { reconcileCorePackage } from "../../domain/documentModel/UniversalCoverageReconciler";

export interface UniversalPackagePromotionForecast {
  contractType: UniversalTargetContractType;
  packageReady: boolean;
  readyDocuments: readonly DocumentType[];
  blockedDocuments: readonly DocumentType[];
  nextBlockingReason: string | null;
  humanAcceptanceStillRequired: true;
}

export function forecastUniversalPackagePromotion(contractType: UniversalTargetContractType): UniversalPackagePromotionForecast {
  const rows = reconcileCorePackage(contractType);
  const readyDocuments = rows.filter(x => x.physicalUniversalGenerationReady).map(x => x.documentType);
  const blockedDocuments = rows.filter(x => !x.physicalUniversalGenerationReady).map(x => x.documentType);
  const firstBlocked = rows.find(x => !x.physicalUniversalGenerationReady);
  return {
    contractType,
    packageReady: blockedDocuments.length === 0,
    readyDocuments,
    blockedDocuments,
    nextBlockingReason: firstBlocked?.blockers[0] ?? null,
    humanAcceptanceStillRequired: true,
  };
}
