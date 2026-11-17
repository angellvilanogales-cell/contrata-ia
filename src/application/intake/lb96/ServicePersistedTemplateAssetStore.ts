import { HttpPersistedTemplateAssetStore, LB94_SUPPLY_GENERAL_RUNTIME_ASSETS, type PersistedTemplateAssetDescriptor } from "../lb94/HttpPersistedTemplateAssetStore";
import type { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { JdaOfficialPcapRemoteFallbackStore } from "../lb102/JdaOfficialPcapRemoteFallbackStore";
import { SERVICE_GENERAL_TEMPLATE_MANIFEST } from "./ServiceGeneralTemplateManifest";

export const JDA_SUPPLY_ASA_EU_FUNDS_PCAP_TEMPLATE_ID = "JDA-PCAP-SUPPLY-ASA-EU_FUNDS-2025-12-17" as const;
export const JDA_SUPPLY_ASA_EU_FUNDS_PCAP_SOURCE_URL = "https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/2025_12_17_pcap_suministro_abierto_simplificado_abreviado_ffee.odt" as const;

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

/** Inventario universal explícito: conserva identidades separadas, pero permite al servidor despachar por familia. */
export function createHttpPersistedUniversalTemplateAssetStoreFromEnv(): UniversalEditableTemplateBinaryStore | null {
  const endpoint = process.env.CONTRATA_IA_PERSISTENCE_URL?.trim();
  const token = process.env.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();
  if (!endpoint || !token) return null;
  const assets = [
    ...LB94_SUPPLY_GENERAL_RUNTIME_ASSETS,
    ...LB96_SERVICE_GENERAL_RUNTIME_ASSETS,
  ];
  const persisted = new HttpPersistedTemplateAssetStore(endpoint, token, assets);
  const official = assets.find(asset => asset.templateId === JDA_SUPPLY_ASA_EU_FUNDS_PCAP_TEMPLATE_ID);
  if (!official) throw new Error("El manifiesto runtime no contiene el PCAP oficial ASA de suministro financiado con fondos europeos.");
  return new JdaOfficialPcapRemoteFallbackStore(
    persisted,
    official,
    JDA_SUPPLY_ASA_EU_FUNDS_PCAP_SOURCE_URL,
    "el PCAP oficial Junta de Suministro · procedimiento abierto simplificado abreviado · fondos europeos",
  );
}
