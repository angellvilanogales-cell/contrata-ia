import { HttpPersistedTemplateAssetStore, type PersistedTemplateAssetDescriptor } from "../lb94/HttpPersistedTemplateAssetStore";
import { WORKS_GENERAL_TEMPLATE_MANIFEST } from "./WorksGeneralTemplateManifest";

export const LB97_WORKS_RUNTIME_ASSETS: readonly PersistedTemplateAssetDescriptor[] = WORKS_GENERAL_TEMPLATE_MANIFEST.map(item => ({
  kind: item.kind === "MEMORY" ? "MEMORIA" : item.kind,
  templateId: item.templateId,
  sourceId: item.templateId,
  sha256: item.expectedSha256,
  styleFingerprint: item.expectedStyleFingerprint,
  provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
})) as readonly PersistedTemplateAssetDescriptor[];

export function createHttpPersistedWorksTemplateAssetStore(endpoint: string, token: string): HttpPersistedTemplateAssetStore {
  return new HttpPersistedTemplateAssetStore(endpoint, token, LB97_WORKS_RUNTIME_ASSETS);
}

export function createHttpPersistedWorksTemplateAssetStoreFromEnv(): HttpPersistedTemplateAssetStore | null {
  const endpoint = process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();
  const token = process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();
  if (!endpoint || !token) return null;
  return createHttpPersistedWorksTemplateAssetStore(endpoint, token);
}
