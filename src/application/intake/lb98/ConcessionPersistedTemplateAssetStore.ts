import { HttpPersistedTemplateAssetStore, type PersistedTemplateAssetDescriptor } from "../lb94/HttpPersistedTemplateAssetStore";
import { CONCESSION_GENERAL_TEMPLATE_MANIFEST } from "./ConcessionGeneralTemplateManifest";

export const LB98_CONCESSION_RUNTIME_ASSETS: readonly PersistedTemplateAssetDescriptor[] = CONCESSION_GENERAL_TEMPLATE_MANIFEST.map(item=>({
  kind:item.kind === "MEMORY" ? "MEMORIA" : item.kind,
  templateId:item.templateId,
  sourceId:item.templateId,
  sha256:item.expectedSha256,
  styleFingerprint:item.expectedStyleFingerprint,
  provenanceRole:"CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
})) as readonly PersistedTemplateAssetDescriptor[];

export function createHttpPersistedConcessionTemplateAssetStore(endpoint:string,token:string):HttpPersistedTemplateAssetStore{
  return new HttpPersistedTemplateAssetStore(endpoint,token,LB98_CONCESSION_RUNTIME_ASSETS);
}
export function createHttpPersistedConcessionTemplateAssetStoreFromEnv():HttpPersistedTemplateAssetStore|null{
  const endpoint=process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();const token=process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();
  if(!endpoint||!token)return null;return createHttpPersistedConcessionTemplateAssetStore(endpoint,token);
}
