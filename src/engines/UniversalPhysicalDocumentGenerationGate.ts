import { ContractDocumentModelProfileRegistry, DocumentModelCoverage } from "../domain/documentModel/ContractDocumentModelProfile";
import { DocumentType } from "../domain/documentModel/DocumentType";
import { EditableTemplateAssetRegistry } from "../domain/documentModel/EditableTemplateAssetRegistry";
import { UniversalExpedienteV13 } from "../domain/expediente/UniversalExpedienteV13";
import { UniversalFamilyPreparationInput } from "../application/universal/UniversalFamilyPreparationGate";
import { evaluateUniversalDocumentGeneration } from "./UniversalDocumentGenerationGate";

export interface UniversalPhysicalDocumentGenerationResult {
  ready: boolean;
  profileId?: string;
  templateId?: string;
  blockers: readonly string[];
  humanValidationRequired: true;
}

/**
 * Gate físico final: un expediente puede ser jurídicamente/documentalmente apto
 * y aun así no tener un ODT/DOCX oficial verificado. Este gate impide confundir
 * estructura, PDF de referencia o modelo lógico con una plantilla editable real.
 */
export function evaluateUniversalPhysicalDocumentGeneration(
  expediente: UniversalExpedienteV13,
  documentType: DocumentType,
  profileRegistry: ContractDocumentModelProfileRegistry,
  assetRegistry: EditableTemplateAssetRegistry,
  familyPreparation?: UniversalFamilyPreparationInput,
  requiredCoverage: DocumentModelCoverage = "FULL_MODEL",
): UniversalPhysicalDocumentGenerationResult {
  const logical = evaluateUniversalDocumentGeneration(
    expediente,
    documentType,
    profileRegistry,
    requiredCoverage,
    familyPreparation,
  );
  const blockers = [...logical.blockers];
  if (!logical.profile) {
    return { ready: false, blockers, humanValidationRequired: true };
  }

  const physical = assetRegistry.assess(logical.profile);
  blockers.push(...physical.blockers);
  return {
    ready: blockers.length === 0,
    profileId: blockers.length === 0 ? logical.profile.id : undefined,
    templateId: blockers.length === 0 ? physical.descriptor?.templateId : undefined,
    blockers,
    humanValidationRequired: true,
  };
}
