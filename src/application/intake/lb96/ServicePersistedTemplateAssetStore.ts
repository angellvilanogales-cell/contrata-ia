import { HttpPersistedTemplateAssetStore, type PersistedTemplateAssetDescriptor } from "../lb94/HttpPersistedTemplateAssetStore";
import { SERVICE_GENERAL_TEMPLATE_MANIFEST } from "./ServiceGeneralTemplateManifest";

export const LB96_SERVICE_GENERAL_RUNTIME_ASSETS: readonly PersistedTemplateAssetDescriptor[] = SERVICE_GENERAL_TEMPLATE_MANIFEST.map(item => ({
  kind: item.kind === "MEMORY" ? "MEMORIA" : item.kind === "PCAP" ? "PCAP" : "PPT",
  templateId: item.templateId,
  sourceId: item.templateId,
  sha256: item.expectedSha256,
  styleFingerprint: item.expectedStyleFingerprint,
  provenanceRole: "CONTRATA_IA_DERIVED_GENERAL_TEMPLATE",
})) as readonly PersistedTemplateAssetDescriptor[];

/**
 * LB96 reutiliza el almacén HTTP ya endurecido en LB94, pero con un manifiesto
 * Service independiente de tres piezas. No mezcla inventarios Supply/Service ni
 * admite activos que no estén expresamente registrados y verificados en LB96.
 */
export function createHttpPersistedServiceTemplateAssetStore(
  endpoint: string,
  token: string,
): HttpPersistedTemplateAssetStore {
  return new HttpPersistedTemplateAssetStore(endpoint, token, LB96_SERVICE_GENERAL_RUNTIME_ASSETS);
}

export function createHttpPersistedServiceTemplateAssetStoreFromEnv(): HttpPersistedTemplateAssetStore | null {
  const endpoint = process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();
  const token = process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();
  if (!endpoint || !token) return null;
  return createHttpPersistedServiceTemplateAssetStore(endpoint, token);
}
