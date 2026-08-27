import type { UniversalEditableTemplateBinaryStore } from "../lb23/UniversalOdtProductionRenderer";
import { readOdtZip } from "../lb23/OdtPackageCodec";
import { computeOdtStyleFingerprint } from "../lb23/UniversalOdtProductionRenderer";
import {
  SUPPLY_GENERAL_STRUCTURAL_CORPUS,
  SUPPLY_GENERAL_DERIVATION_VERSION,
  computeSupplyStructuralStyleFingerprint,
  type SupplyDerivedTemplateEvidence,
  type SupplyGeneralTemplateKind,
} from "./SupplyGeneralEditableTemplateDerivation";
import { getSupplyGeneralDerivedAsset } from "./SupplyGeneralDerivedAssetManifest";

function kindToManifest(kind: SupplyGeneralTemplateKind): "MEMORIA" | "PPT" {
  return kind === "MEMORY" ? "MEMORIA" : "PPT";
}

/**
 * Reconstruye la evidencia runtime de una plantilla general ya derivada y
 * persistida. No vuelve a usar el expediente donante: solo acepta el binario
 * final cuya identidad figura en el manifiesto LB94.
 */
export async function loadPersistedSupplyGeneralTemplate(
  store: UniversalEditableTemplateBinaryStore,
  kind: SupplyGeneralTemplateKind,
): Promise<SupplyDerivedTemplateEvidence> {
  const descriptor = getSupplyGeneralDerivedAsset(kindToManifest(kind));
  if (!descriptor) throw new Error(`No existe manifiesto LB94 para ${kind}.`);
  const source = await store.get(descriptor.templateId);
  if (!source) throw new Error(`No está disponible en persistencia la plantilla general ${descriptor.templateId}.`);
  if (source.templateId !== descriptor.templateId || source.sourceId !== descriptor.templateId) {
    throw new Error(`La identidad runtime de ${descriptor.templateId} no coincide con el manifiesto LB94.`);
  }
  const entries = readOdtZip(source.bytes);
  const style = computeOdtStyleFingerprint(entries);
  const structuralStyle = computeSupplyStructuralStyleFingerprint(entries);
  const blockers: string[] = [];
  if (style !== descriptor.styleFingerprint) blockers.push("La huella completa del ODT persistido no coincide con la plantilla derivada acreditada.");
  if (structuralStyle !== descriptor.structuralStyleFingerprint) blockers.push("La huella estructural del ODT persistido no coincide con la plantilla derivada acreditada.");
  return {
    kind,
    templateId: descriptor.templateId,
    sourceAssetId: descriptor.donorAssetId,
    sourceSha256: descriptor.donorSha256,
    sourceStyleFingerprint: descriptor.donorStyleFingerprint,
    sourceStructuralStyleFingerprint: descriptor.structuralStyleFingerprint,
    derivedSha256: descriptor.sha256,
    derivedStyleFingerprint: descriptor.styleFingerprint,
    derivedStructuralStyleFingerprint: descriptor.structuralStyleFingerprint,
    corpusSourceIds: SUPPLY_GENERAL_STRUCTURAL_CORPUS,
    transformationVersion: SUPPLY_GENERAL_DERIVATION_VERSION,
    contaminationHits: [],
    bytes: source.bytes,
    ready: blockers.length === 0,
    blockers,
  };
}
