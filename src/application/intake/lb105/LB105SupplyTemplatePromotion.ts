import { createHash } from "node:crypto";
import { HttpPersistedTemplateAssetStore, LB94_SUPPLY_GENERAL_RUNTIME_ASSETS, LB94_SUPPLY_LEGACY_DERIVED_ASSETS } from "../lb94/HttpPersistedTemplateAssetStore";
import { getSupplyGeneralDerivedAsset } from "../lb94/SupplyGeneralDerivedAssetManifest";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import { readOdtZip } from "../lb23/OdtPackageCodec";
import { computeSupplyStructuralStyleFingerprint, type SupplyGeneralTemplateKind } from "../lb94/SupplyGeneralEditableTemplateDerivation";
import { normalizeSupplyGeneralOdtLb105 } from "./SupplyCanonicalOdtNormalization";

function endpoint(value: string): string {
  const normalized = value.trim().replace(/\/+$/, "");
  if (!normalized.startsWith("https://")) throw new Error("La promoción LB105 exige persistencia HTTPS.");
  return normalized;
}

function sha256(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }

export async function ensurePersistedLb105SupplyTemplates(environment: NodeJS.ProcessEnv = process.env) {
  const url = environment.CONTRATA_IA_PERSISTENCE_URL?.trim();
  const token = environment.CONTRATA_IA_PERSISTENCE_TOKEN?.trim();
  if (!url || !token) return {configured:false, ready:false, promoted:[] as string[], blockers:["Persistencia externa no configurada."]} as const;
  const activeDescriptors = LB94_SUPPLY_GENERAL_RUNTIME_ASSETS.filter(item => item.kind === "MEMORIA" || item.kind === "PPT");
  const active = new HttpPersistedTemplateAssetStore(url, token, activeDescriptors);
  const before = await active.readiness();
  if (before.ready) return {configured:true, ready:true, promoted:[] as string[], blockers:[]} as const;
  const legacy = new HttpPersistedTemplateAssetStore(url, token, LB94_SUPPLY_LEGACY_DERIVED_ASSETS);
  const promoted: string[] = [];
  for (const kind of ["MEMORY", "PPT"] as const satisfies readonly SupplyGeneralTemplateKind[]) {
    const legacyDescriptor = LB94_SUPPLY_LEGACY_DERIVED_ASSETS.find(item => item.kind === (kind === "MEMORY" ? "MEMORIA" : "PPT"));
    const target = getSupplyGeneralDerivedAsset(kind === "MEMORY" ? "MEMORIA" : "PPT");
    if (!legacyDescriptor || !target) throw new Error(`No existe manifiesto de migración LB105 para ${kind}.`);
    const source = await legacy.get(legacyDescriptor.templateId);
    if (!source) throw new Error(`No está disponible el activo LB94 de origen para ${kind}.`);
    const bytes = normalizeSupplyGeneralOdtLb105(source.bytes, kind);
    const entries = readOdtZip(bytes);
    if (sha256(bytes) !== target.sha256 || computeOdtStyleFingerprint(entries) !== target.styleFingerprint || computeSupplyStructuralStyleFingerprint(entries) !== target.structuralStyleFingerprint) {
      throw new Error(`La reconstrucción LB105 de ${kind} no coincide con el manifiesto V3.`);
    }
    const response = await fetch(`${endpoint(url)}/templates/${encodeURIComponent(target.templateId)}`, {
      method:"PUT",
      headers:{"content-type":"application/json; charset=utf-8","x-contrata-ia-persistence-token":token,accept:"application/json"},
      body:JSON.stringify({kind:target.kind,mediaType:"application/vnd.oasis.opendocument.text",sha256:target.sha256,styleFingerprint:target.styleFingerprint,provenance:{role:target.provenanceRole,sourceId:target.donorAssetId,derivationVersion:target.derivationVersion,officialModelClaimed:false,exactBinaryIdentityVerified:true,humanValidationRequired:true},contentBase64:Buffer.from(bytes).toString("base64")}),
    });
    if (!response.ok) throw new Error(`Persistencia rechazó la promoción LB105 de ${kind}: HTTP ${response.status}.`);
    promoted.push(target.templateId);
  }
  const after = await active.readiness();
  if (!after.ready) throw new Error(`La recuperación posterior LB105 ha fallado: ${after.blockers.join(" | ")}`);
  return {configured:true, ready:true, promoted, blockers:[]} as const;
}
