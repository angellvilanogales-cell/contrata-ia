import { createHash } from "node:crypto";
import type { UniversalEditableTemplateBinaryStore } from "../intake/lb23/UniversalOdtProductionRenderer";
import { LB94_SUPPLY_GENERAL_RUNTIME_ASSETS } from "../intake/lb94/HttpPersistedTemplateAssetStore";
import type { LB103ProtectedDocumentarySelection } from "./LB103ServerValidatedPreflight";

/** Every physical read is restricted to the source identity sealed by preflight. */
export function selectedLB103TemplateStore(store: UniversalEditableTemplateBinaryStore, selection: LB103ProtectedDocumentarySelection): UniversalEditableTemplateBinaryStore {
  return { async get(templateId) {
    const descriptor = LB94_SUPPLY_GENERAL_RUNTIME_ASSETS.find(asset => asset.templateId === templateId);
    const selectionId = templateId === "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17" ? "JDA-SUPPLY-ASA-PCAP-GENERAL-ODT" : templateId;
    const selected = selection.documents.find(document => document.selectedSourceId === selectionId);
    if (!descriptor || !selected || selected.status !== "GENERAL_EDITABLE_SELECTED" || selected.selectedSourceSha256 !== descriptor.sha256 || selected.selectedProvenanceRole !== descriptor.provenanceRole) {
      throw new Error("El generador solicitó una plantilla ajena a la selección documental sellada.");
    }
    const source = await store.get(templateId);
    if (!source) throw new Error(`Plantilla seleccionada no disponible: ${templateId}.`);
    const bytes = Uint8Array.from(source.bytes);
    if (source.templateId !== templateId || source.sourceId !== descriptor.sourceId || createHash("sha256").update(bytes).digest("hex") !== selected.selectedSourceSha256) {
      throw new Error(`La plantilla física no coincide con la selección sellada: ${templateId}.`);
    }
    return {...source, bytes};
  }};
}
