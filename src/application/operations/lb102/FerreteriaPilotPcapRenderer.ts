import type { UniversalEvidenceRecord } from "../../intake/lb52/UniversalEvidenceWorkspace";
import {
  UniversalOdtProductionRenderer,
  type UniversalEditableTemplateBinaryStore,
} from "../../intake/lb23/UniversalOdtProductionRenderer";
import {
  JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE,
} from "../../intake/lb34/JuntaSupplyAsaModificationSection";
import { JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION } from "../../intake/lb95/SupplyAsaGeneralPcapRenderer";
import { finalizeFerreteriaPcapRenderedOdt } from "../../intake/lb60/FerreteriaPcapFinalPostProcessor";

export interface FerreteriaPilotPcapResult {
  ready: boolean;
  document: null | {
    kind: "PCAP";
    fileName: string;
    bytes: Uint8Array;
    sha256: string;
    templateId: string;
    renderedStyleFingerprint: string;
  };
  blockers: readonly string[];
  humanValidationRequired: true;
}

function validated(record: UniversalEvidenceRecord, fieldKey: string): unknown {
  const field = record.fields[fieldKey];
  if (!field) throw new Error(`Falta evidencia PCAP para ${fieldKey}.`);
  if (field.status === "SOURCE_CONFLICT" || field.status === "PENDING") throw new Error(`${fieldKey} está ${field.status}.`);
  if (field.status !== "HUMAN_VALIDATED" || field.humanValidated !== true) throw new Error(`${fieldKey} requiere validación humana expresa.`);
  return field.value;
}

/**
 * Renderer exclusivo del golden case CONTR/2026/240267.
 *
 * El primer render usa únicamente slots source-backed del modelo oficial ASA.
 * El cierre físico se delega en LB60, que es el postprocesador maduro del caso:
 * - materializa decisiones residuales del órgano de contratación;
 * - proyecta las 98 referencias en Anexo I y Anexo V;
 * - propaga expediente/título a anexos II-XIII;
 * - preserva huella de estilos;
 * - bloquea cualquier residual administrativo real antes del apartado 15.
 *
 * Este cierre NO es un default general de Supply ASA.
 */
export async function renderFerreteriaPilotPcap(input: {
  record: UniversalEvidenceRecord;
  templateStore: UniversalEditableTemplateBinaryStore;
}): Promise<FerreteriaPilotPcapResult> {
  try {
    if (input.record.caseId !== "CONTR/2026/240267") {
      throw new Error("El renderer final Ferretería LB102 solo puede utilizarse con CONTR/2026/240267.");
    }

    const values = JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE.slots.map(slot => ({
      slotId: slot.slotId,
      value: validated(input.record, slot.fieldKey),
      sourceFieldKey: slot.fieldKey,
    }));
    const renderer = new UniversalOdtProductionRenderer(input.templateStore, JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION);
    const rendered = await renderer.render({ asset: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET, values });
    const closed = finalizeFerreteriaPcapRenderedOdt({ bytes: rendered.bytes, caseId: input.record.caseId });
    if (!closed.auditReady) {
      return {
        ready: false,
        document: null,
        blockers: closed.blockers.map(item => `PCAP Ferretería LB60: ${item}`),
        humanValidationRequired: true,
      };
    }

    return {
      ready: true,
      document: {
        kind: "PCAP",
        fileName: "PCAP_CONTR-2026-240267.odt",
        bytes: closed.bytes,
        sha256: closed.sha256,
        templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
        renderedStyleFingerprint: closed.styleFingerprint,
      },
      blockers: [],
      humanValidationRequired: true,
    };
  } catch (error) {
    return {
      ready: false,
      document: null,
      blockers: [error instanceof Error ? error.message : String(error)],
      humanValidationRequired: true,
    };
  }
}
