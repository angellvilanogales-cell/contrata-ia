import { createHash } from "node:crypto";
import type { UniversalSupplyAsaPlannedModificationDecision } from "../../../domain/expediente/UniversalExpedienteDomains";
import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";
import { UniversalOdtProductionRenderer, type UniversalEditableTemplateBinaryStore, type UniversalOdtRendererConfiguration, type UniversalTemplateValueFormatter } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET, JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE, JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION, FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID } from "../lb34/JuntaSupplyAsaModificationSection";
import { auditJdaSupplyAsaRenderedOdt } from "../lb35/JuntaSupplyAsaAnexoIResidualAudit";

export interface SupplyAsaGeneralPcapResult {
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

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

function decision(value: unknown, fieldKey: string): UniversalSupplyAsaPlannedModificationDecision {
  if (value === FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID) {
    return {
      budgetStability: { applicable: true, maximumPercent: 20 },
      needsDa33: { applicable: true, maximumPercent: 20, limits: [
        "Aumento exclusivamente de unidades de referencias ya incluidas, manteniendo objeto y precios unitarios adjudicados; no podrán incorporarse nuevos artículos ni nuevos precios unitarios.",
        "La modificación debe tramitarse antes de agotarse el presupuesto máximo y exige reservar el crédito necesario.",
      ] },
      other: { applicable: false, description: "No procede.", maximumPercent: 0, limits: [] },
    };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${fieldKey}: se requiere una decisión estructurada de modificaciones previstas.`);
  const raw = value as Record<string, unknown>;
  const stability = raw.budgetStability as Record<string, unknown> | undefined;
  const da33 = raw.needsDa33 as Record<string, unknown> | undefined;
  const other = raw.other as Record<string, unknown> | undefined;
  const boolean = (v: unknown, label: string) => { if (typeof v !== "boolean") throw new Error(`${fieldKey}: ${label} debe ser booleano.`); return v; };
  const percent = (v: unknown, label: string) => { if (!Number.isFinite(v) || Number(v) < 0 || Number(v) > 20) throw new Error(`${fieldKey}: ${label} debe estar entre 0 y 20 %.`); return Number(v); };
  const limits = (v: unknown, label: string) => { if (!Array.isArray(v) || !v.every(item => typeof item === "string" && item.trim())) throw new Error(`${fieldKey}: ${label} debe ser una lista textual.`); return (v as string[]).map(item => item.trim()); };
  if (!stability || !da33 || !other) throw new Error(`${fieldKey}: faltan budgetStability, needsDa33 u other.`);
  const result: UniversalSupplyAsaPlannedModificationDecision = {
    budgetStability: { applicable: boolean(stability.applicable, "budgetStability.applicable"), maximumPercent: percent(stability.maximumPercent, "budgetStability.maximumPercent") },
    needsDa33: { applicable: boolean(da33.applicable, "needsDa33.applicable"), maximumPercent: percent(da33.maximumPercent, "needsDa33.maximumPercent"), limits: limits(da33.limits ?? [], "needsDa33.limits") },
    other: { applicable: boolean(other.applicable, "other.applicable"), description: typeof other.description === "string" ? other.description.trim() : "", maximumPercent: percent(other.maximumPercent, "other.maximumPercent"), limits: limits(other.limits ?? [], "other.limits") },
  };
  if (!result.budgetStability.applicable) throw new Error(`${fieldKey}: el modelo oficial ASA acreditado materializa la causa de estabilidad presupuestaria y exige decisión aplicable.`);
  if (result.needsDa33.applicable && result.needsDa33.limits.length === 0) throw new Error(`${fieldKey}: DA 33.ª aplicable exige límites expresos.`);
  if (result.other.applicable && (!result.other.description || result.other.limits.length === 0)) throw new Error(`${fieldKey}: otra modificación aplicable exige descripción y límites.`);
  return result;
}

const stabilityPercent: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  return `<text:p text:style-name="P55">-<text:tab/>Porcentaje máximo del precio del contrato al que pueda afectar: <text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1371">${d.budgetStability.maximumPercent}</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1376"></text:span></text:span> %</text:p>`;
};
const da33Cause: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const text = d.needsDa33.applicable ? "Mayores necesidades reales respecto de las estimadas inicialmente, en contrato de suministro en función de las necesidades conforme a la disposición adicional 33.ª LCSP." : "No procede modificación por mayores necesidades conforme a la disposición adicional 33.ª LCSP.";
  return `<text:p text:style-name="P41"><text:span text:style-name="T1599"><text:sequence text:ref-name="refmodif1" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">2</text:sequence></text:span><text:span text:style-name="T1599">. </text:span><text:span text:style-name="T1600">${xmlEscape(text)}</text:span><text:span text:style-name="T1601"></text:span></text:p>`;
};
const da33Limits: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const lines = d.needsDa33.applicable ? [...d.needsDa33.limits, `Porcentaje máximo de incremento: ${d.needsDa33.maximumPercent} %.`] : ["No procede."];
  return lines.map((line, index) => `<text:p text:style-name="${index === 0 ? "P176" : "P177"}"><text:span text:style-name="${index === 0 ? "T875" : "T896"}">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">${xmlEscape(line)}</text:span></text:span></text:p>`).join("");
};
const otherCause: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const text = d.other.applicable ? d.other.description : "Otras causas de modificación previstas: No procede.";
  return `<text:p text:style-name="P229"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526"><text:sequence text:ref-name="refmodif2" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">3</text:sequence></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526">. </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1530">${xmlEscape(text)}</text:span></text:span></text:p>`;
};
const otherLimits: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const lines = d.other.applicable ? [...d.other.limits, `Porcentaje máximo: ${d.other.maximumPercent} %.`] : ["No procede."];
  return lines.map((line, index) => `<text:p text:style-name="${index === 0 ? "P176" : "P177"}"><text:span text:style-name="${index === 0 ? "T875" : "T896"}">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">${xmlEscape(line)}</text:span></text:span></text:p>`).join("");
};

export const JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION: UniversalOdtRendererConfiguration = {
  bindingsByTemplateId: JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION.bindingsByTemplateId,
  formattersBySlotId: {
    ...JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION.formattersBySlotId,
    "pcap.anexoI.14.estabilidad.porcentaje": stabilityPercent,
    "pcap.anexoI.14.da33.causa": da33Cause,
    "pcap.anexoI.14.da33.limites": da33Limits,
    "pcap.anexoI.14.otras.causa": otherCause,
    "pcap.anexoI.14.otras.limites": otherLimits,
  },
};

function validated(record: UniversalEvidenceRecord, fieldKey: string): unknown {
  const field = record.fields[fieldKey];
  if (!field) throw new Error(`Falta evidencia PCAP para ${fieldKey}.`);
  if (field.status === "SOURCE_CONFLICT" || field.status === "PENDING") throw new Error(`${fieldKey} está ${field.status}.`);
  if (field.status !== "NOT_APPLICABLE" && (field.status !== "HUMAN_VALIDATED" || field.humanValidated !== true)) throw new Error(`${fieldKey} requiere validación humana expresa.`);
  if (field.status === "NOT_APPLICABLE") throw new Error(`${fieldKey} es obligatorio para el modelo oficial ASA y no admite NOT_APPLICABLE.`);
  return field.value;
}

export function supplyAsaPcapRequiredFieldPaths(): readonly string[] {
  return [...new Set(JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE.slots.filter(slot => slot.required).map(slot => slot.fieldKey))];
}

export async function renderSupplyAsaGeneralPcap(input: { record: UniversalEvidenceRecord; templateStore: UniversalEditableTemplateBinaryStore }): Promise<SupplyAsaGeneralPcapResult> {
  const blockers: string[] = [];
  try {
    const values = JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE.slots.map(slot => ({ slotId: slot.slotId, value: validated(input.record, slot.fieldKey), sourceFieldKey: slot.fieldKey }));
    const renderer = new UniversalOdtProductionRenderer(input.templateStore, JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION);
    const rendered = await renderer.render({ asset: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET, values });
    const residual = auditJdaSupplyAsaRenderedOdt(rendered.bytes);
    if (!residual.ready) throw new Error(`Auditoría residual PCAP: ${residual.blockers.join(" ")}`);
    const bytes = rendered.bytes;
    return {
      ready: true,
      document: {
        kind: "PCAP",
        fileName: `PCAP_${input.record.caseId.replaceAll("/", "-")}.odt`,
        bytes,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
        renderedStyleFingerprint: rendered.renderedStyleFingerprint,
      },
      blockers: [],
      humanValidationRequired: true,
    };
  } catch (error) {
    blockers.push(error instanceof Error ? error.message : String(error));
    return { ready: false, document: null, blockers, humanValidationRequired: true };
  }
}
