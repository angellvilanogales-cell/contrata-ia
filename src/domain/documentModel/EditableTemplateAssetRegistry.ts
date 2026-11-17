import { DocumentType } from "./DocumentType";
import { UniversalTargetContractType } from "../capabilities/UniversalContractCoverage";
import { ContractDocumentModelProfile } from "./ContractDocumentModelProfile";

export type EditableTemplateMediaType = "ODT" | "DOCX";

export interface EditableTemplateAssetDescriptor {
  profileId: string;
  contractType: UniversalTargetContractType;
  documentType: DocumentType;
  templateId: string;
  sourceId: string;
  mediaType: EditableTemplateMediaType;
  sha256: string;
  styleFingerprint: string;
  verified: boolean;
  active: boolean;
}

export interface EditableTemplateReadiness {
  ready: boolean;
  descriptor?: EditableTemplateAssetDescriptor;
  blockers: readonly string[];
}

function validSha256(value: string): boolean {
  return /^(sha256:)?[a-f0-9]{64}$/i.test(value.trim());
}

/**
 * Registro lógico de activos físicos editables. No almacena bytes y no sustituye
 * UniversalEditableTemplateBinaryStore. Su función es impedir que un perfil
 * estructural, una fuente PDF o un modelo no verificado se presenten como activo
 * de generación física.
 */
export class EditableTemplateAssetRegistry {
  private readonly assets = new Map<string, EditableTemplateAssetDescriptor>();

  public register(descriptor: EditableTemplateAssetDescriptor): void {
    if (!descriptor.profileId.trim() || !descriptor.templateId.trim() || !descriptor.sourceId.trim()) {
      throw new Error("El descriptor editable exige profileId, templateId y sourceId.");
    }
    if (!validSha256(descriptor.sha256)) throw new Error(`SHA-256 inválido para ${descriptor.templateId}.`);
    if (!validSha256(descriptor.styleFingerprint)) throw new Error(`Huella de estilo inválida para ${descriptor.templateId}.`);
    const key = `${descriptor.profileId}:${descriptor.documentType}`;
    if (this.assets.has(key)) throw new Error(`Ya existe un activo editable registrado para ${key}.`);
    this.assets.set(key, { ...descriptor });
  }

  public find(profileId: string, documentType: DocumentType): EditableTemplateAssetDescriptor | undefined {
    const item = this.assets.get(`${profileId}:${documentType}`);
    return item ? { ...item } : undefined;
  }

  public assess(profile: ContractDocumentModelProfile): EditableTemplateReadiness {
    const blockers: string[] = [];
    const descriptor = this.find(profile.id, profile.documentType);
    if (profile.coverage !== "FULL_MODEL") blockers.push(`El perfil ${profile.id} no acredita un modelo documental completo.`);
    if (!profile.generationAllowed) blockers.push(`El perfil ${profile.id} no tiene habilitada la generación física.`);
    if (!descriptor) blockers.push(`No existe activo editable físico registrado para ${profile.id}/${profile.documentType}.`);
    if (descriptor) {
      if (descriptor.contractType !== profile.contractType) blockers.push("El activo editable no coincide con el tipo contractual del perfil.");
      if (descriptor.documentType !== profile.documentType) blockers.push("El activo editable no coincide con el tipo documental del perfil.");
      if (!descriptor.verified) blockers.push("El activo editable no consta verificado contra su fuente.");
      if (!descriptor.active) blockers.push("El activo editable está inactivo.");
      if (!profile.sourceIds.includes(descriptor.sourceId)) blockers.push("El sourceId del activo no forma parte de las fuentes acreditadas del perfil documental.");
    }
    return { ready: blockers.length === 0, descriptor: blockers.length === 0 ? descriptor : undefined, blockers };
  }
}
