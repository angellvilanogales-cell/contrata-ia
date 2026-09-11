import { createHash } from "node:crypto";
import { VerifiedRuntimeTemplateStore, V1_RUNTIME_ASSET_MANIFEST, type VerifiedRuntimeAssetDescriptor } from "../lb53/VerifiedRuntimeTemplateStore";
import type { VerifiedEditableAsset } from "../../../infrastructure/operations/lb52/VerifiedEditableAssetStore";
import { deriveSupplyGeneralEditableTemplate, type SupplyDerivedTemplateEvidence } from "./SupplyGeneralEditableTemplateDerivation";

const MEMORY_STYLE = "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d";
const PPT_STYLE = "sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390";

function descriptor(kind: "MEMORIA" | "PPT"): VerifiedRuntimeAssetDescriptor {
  const found = V1_RUNTIME_ASSET_MANIFEST.find(item => item.kind === kind);
  if (!found) throw new Error(`No existe descriptor runtime para ${kind}.`);
  return found;
}
function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }

export interface SupplyGeneralRuntimeReadiness {
  ready: boolean;
  memory?: SupplyDerivedTemplateEvidence;
  ppt?: SupplyDerivedTemplateEvidence;
  blockers: readonly string[];
  provenance: {
    memory: "DERIVED_FROM_VERIFIED_CASE_STYLE";
    ppt: "DERIVED_FROM_VERIFIED_CASE_STYLE";
    officialModelClaimed: false;
    humanValidationRequired: true;
  };
}

function asVerifiedCaseAsset(source: { bytes: Uint8Array }, item: VerifiedRuntimeAssetDescriptor): VerifiedEditableAsset {
  const actual = hash(source.bytes);
  return {
    descriptor: {
      assetId: item.sourceId,
      fileName: item.fileName,
      expectedSha256: item.sha256,
      mediaType: "application/vnd.oasis.opendocument.text",
      role: "REAL_CASE_EDITABLE",
    },
    bytes: source.bytes,
    actualSha256: actual,
  };
}

/**
 * LB94: genera en memoria plantillas generales propias de Contrata-IA a partir
 * de donantes ODT de caso cuya identidad y estilo están verificados. El contenido
 * completo del expediente donante se sustituye por un esqueleto general y se
 * ejecuta un escáner de contaminación. No se presenta el resultado como modelo
 * oficial de la Comisión Consultiva.
 */
export class SupplyGeneralTemplateRuntime {
  public constructor(private readonly store: VerifiedRuntimeTemplateStore) {}

  public async build(): Promise<SupplyGeneralRuntimeReadiness> {
    const blockers: string[] = [];
    let memory: SupplyDerivedTemplateEvidence | undefined;
    let ppt: SupplyDerivedTemplateEvidence | undefined;

    try {
      const item = descriptor("MEMORIA");
      const source = await this.store.get(item.templateId);
      if (!source) throw new Error(`Falta el activo runtime ${item.fileName} o no supera su SHA-256.`);
      memory = deriveSupplyGeneralEditableTemplate({ kind: "MEMORY", source: asVerifiedCaseAsset(source, item), expectedSourceStyleFingerprint: MEMORY_STYLE });
      blockers.push(...memory.blockers.map(value => `Memoria: ${value}`));
    } catch (error) {
      blockers.push(`Memoria: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      const item = descriptor("PPT");
      const source = await this.store.get(item.templateId);
      if (!source) throw new Error(`Falta el activo runtime ${item.fileName} o no supera su SHA-256.`);
      ppt = deriveSupplyGeneralEditableTemplate({ kind: "PPT", source: asVerifiedCaseAsset(source, item), expectedSourceStyleFingerprint: PPT_STYLE });
      blockers.push(...ppt.blockers.map(value => `PPT: ${value}`));
    } catch (error) {
      blockers.push(`PPT: ${error instanceof Error ? error.message : String(error)}`);
    }

    return {
      ready: Boolean(memory?.ready && ppt?.ready && blockers.length === 0),
      memory,
      ppt,
      blockers,
      provenance: {
        memory: "DERIVED_FROM_VERIFIED_CASE_STYLE",
        ppt: "DERIVED_FROM_VERIFIED_CASE_STYLE",
        officialModelClaimed: false,
        humanValidationRequired: true,
      },
    };
  }
}
