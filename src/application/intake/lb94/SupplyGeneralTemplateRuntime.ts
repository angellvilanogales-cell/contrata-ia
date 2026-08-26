import type { VerifiedEditableAssetStore, VerifiedEditableAssetDescriptor } from "../../../infrastructure/operations/lb52/VerifiedEditableAssetStore";
import { FERRETERIA_V1_EDITABLE_ASSET_MANIFEST } from "../../../infrastructure/operations/lb52/VerifiedEditableAssetStore";
import { deriveSupplyGeneralEditableTemplate, type SupplyDerivedTemplateEvidence } from "./SupplyGeneralEditableTemplateDerivation";

const MEMORY_STYLE = "sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d";
const PPT_STYLE = "sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390";

function descriptor(assetId: string): VerifiedEditableAssetDescriptor {
  const found = FERRETERIA_V1_EDITABLE_ASSET_MANIFEST.find(item => item.assetId === assetId);
  if (!found) throw new Error(`No existe descriptor runtime verificado para ${assetId}.`);
  return found;
}

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

/**
 * LB94: genera en memoria plantillas generales propias de Contrata-IA a partir
 * de donantes ODT de caso cuya identidad y estilo están verificados. El contenido
 * completo del expediente donante se sustituye por un esqueleto general y se
 * ejecuta un escáner de contaminación. No se presenta el resultado como modelo
 * oficial de la Comisión Consultiva.
 */
export class SupplyGeneralTemplateRuntime {
  public constructor(private readonly store: VerifiedEditableAssetStore) {}

  public build(): SupplyGeneralRuntimeReadiness {
    const blockers: string[] = [];
    let memory: SupplyDerivedTemplateEvidence | undefined;
    let ppt: SupplyDerivedTemplateEvidence | undefined;

    try {
      const source = this.store.load(descriptor("ferreteria:memory:v12:letrado:odt"));
      memory = deriveSupplyGeneralEditableTemplate({ kind: "MEMORY", source, expectedSourceStyleFingerprint: MEMORY_STYLE });
      blockers.push(...memory.blockers.map(item => `Memoria: ${item}`));
    } catch (error) {
      blockers.push(`Memoria: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      const source = this.store.load(descriptor("ferreteria:ppt:v6:odt"));
      ppt = deriveSupplyGeneralEditableTemplate({ kind: "PPT", source, expectedSourceStyleFingerprint: PPT_STYLE });
      blockers.push(...ppt.blockers.map(item => `PPT: ${item}`));
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
