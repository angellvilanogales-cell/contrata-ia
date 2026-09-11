import { UniversalExpedienteV13 } from "../domain/expediente/UniversalExpedienteV13";
import { ContractDocumentModelProfileRegistry } from "../domain/documentModel/ContractDocumentModelProfile";
import { DocumentType } from "../domain/documentModel/DocumentType";
import { EditableTemplateAssetRegistry } from "../domain/documentModel/EditableTemplateAssetRegistry";
import { UniversalFamilyPreparationInput } from "../application/universal/UniversalFamilyPreparationGate";
import { UniversalDocumentFactSnapshot } from "./UniversalCrossDocumentAudit";
import { auditUniversalAdministrativePackage } from "./UniversalAdministrativePackageAudit";
import { evaluateUniversalPhysicalDocumentGeneration } from "./UniversalPhysicalDocumentGenerationGate";
import { UniversalTargetContractType } from "../domain/capabilities/UniversalContractCoverage";

export interface UniversalAdministrativePackageGateResult {
  ready: boolean;
  documentReadiness: Readonly<Record<"MEMORY" | "PCAP" | "PPT", boolean>>;
  blockers: readonly string[];
  humanAcceptanceRequired: true;
}

const DOCUMENTS = [
  ["MEMORY", DocumentType.MEMORY],
  ["PCAP", DocumentType.PCAP],
  ["PPT", DocumentType.PPT],
] as const;

/**
 * Puerta de paquete completo. No sustituye los paquetes protegidos ya existentes:
 * los complementa como frontera universal para futuras familias. Un paquete solo
 * puede quedar técnicamente listo cuando los tres documentos obligatorios son
 * físicamente generables y su auditoría semántica cruzada resulta limpia.
 */
export function evaluateUniversalAdministrativePackage(
  expediente: UniversalExpedienteV13,
  contractType: UniversalTargetContractType,
  profileRegistry: ContractDocumentModelProfileRegistry,
  assetRegistry: EditableTemplateAssetRegistry,
  snapshots: readonly UniversalDocumentFactSnapshot[],
  familyPreparation?: UniversalFamilyPreparationInput,
): UniversalAdministrativePackageGateResult {
  const blockers: string[] = [];
  const readiness = { MEMORY: false, PCAP: false, PPT: false };

  if (expediente.canonical.fields.contractType.value !== contractType) {
    blockers.push(`El paquete se ha solicitado como ${contractType}, pero el expediente declara ${expediente.canonical.fields.contractType.value ?? "sin tipo"}.`);
  }

  for (const [label, documentType] of DOCUMENTS) {
    const result = evaluateUniversalPhysicalDocumentGeneration(
      expediente,
      documentType,
      profileRegistry,
      assetRegistry,
      familyPreparation,
      "FULL_MODEL",
    );
    readiness[label] = result.ready;
    blockers.push(...result.blockers.map(blocker => `${label}: ${blocker}`));
  }

  const crossAudit = auditUniversalAdministrativePackage(contractType, snapshots);
  blockers.push(...crossAudit.blockers.map(blocker => `AUDIT: ${blocker}`));

  return {
    ready: blockers.length === 0 && Object.values(readiness).every(Boolean),
    documentReadiness: readiness,
    blockers: [...new Set(blockers)],
    humanAcceptanceRequired: true,
  };
}
