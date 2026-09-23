import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { ContractDocumentModelProfileRegistry } from "./ContractDocumentModelProfile";
import { DocumentType } from "./DocumentType";
import { EditableTemplateAssetRegistry } from "./EditableTemplateAssetRegistry";

export type UniversalCoreAdministrativeDocument = "MEMORY" | "PCAP" | "PPT";

export interface DocumentModelGap {
  contractType: UniversalTargetContractType;
  document: UniversalCoreAdministrativeDocument;
  profileStatus: "MISSING" | "PARTIAL" | "FULL";
  physicalAssetStatus: "MISSING" | "NOT_READY" | "READY";
  blockers: readonly string[];
}

const DOCS: readonly [UniversalCoreAdministrativeDocument, DocumentType][] = [
  ["MEMORY", DocumentType.MEMORY],
  ["PCAP", DocumentType.PCAP],
  ["PPT", DocumentType.PPT],
];

/**
 * Informa exactamente qué falta para pasar de cobertura jurídica a generación
 * editable. No crea perfiles ni activa automáticamente una fuente de referencia.
 */
export function buildUniversalDocumentModelGapReport(
  contractType: UniversalTargetContractType,
  profileRegistry: ContractDocumentModelProfileRegistry,
  assetRegistry: EditableTemplateAssetRegistry,
): readonly DocumentModelGap[] {
  return DOCS.map(([document, type]) => {
    const profiles = profileRegistry.findAll(contractType, type);
    if (profiles.length === 0) {
      return {
        contractType,
        document,
        profileStatus: "MISSING" as const,
        physicalAssetStatus: "MISSING" as const,
        blockers: [`No existe perfil documental registrado para ${contractType}/${document}.`],
      };
    }

    const fullProfiles = profiles.filter(profile => profile.coverage === "FULL_MODEL");
    const candidate = fullProfiles[0] ?? profiles[0]!;
    const physical = assetRegistry.assess(candidate);
    return {
      contractType,
      document,
      profileStatus: fullProfiles.length > 0 ? "FULL" as const : "PARTIAL" as const,
      physicalAssetStatus: physical.ready ? "READY" as const : assetRegistry.find(candidate.id, type) ? "NOT_READY" as const : "MISSING" as const,
      blockers: physical.ready ? [] : physical.blockers,
    };
  });
}

export function hasCompleteEditableDocumentSet(
  contractType: UniversalTargetContractType,
  profileRegistry: ContractDocumentModelProfileRegistry,
  assetRegistry: EditableTemplateAssetRegistry,
): boolean {
  return buildUniversalDocumentModelGapReport(contractType, profileRegistry, assetRegistry)
    .every(item => item.profileStatus === "FULL" && item.physicalAssetStatus === "READY");
}
