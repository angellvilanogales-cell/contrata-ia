import type { UniversalSupplyAsaPlannedModificationDecision } from "../../../domain/expediente/UniversalExpedienteDomains";
import type { UniversalOdtRendererConfiguration, UniversalTemplateValueFormatter } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION } from "../lb34/JuntaSupplyAsaModificationSection";
import { JDA_SUPPLY_ASA_TEMPLATE_ID } from "../lb25/JuntaSupplyAsaOfficialActivation";

function xml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
}

function decision(value: unknown, fieldKey: string): UniversalSupplyAsaPlannedModificationDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${fieldKey}: se requiere una decisión estructurada de modificación ASA.`);
  const candidate = value as UniversalSupplyAsaPlannedModificationDecision;
  for (const [name, item] of Object.entries({ budgetStability: candidate.budgetStability, needsDa33: candidate.needsDa33, other: candidate.other })) {
    if (!item || typeof item !== "object" || typeof item.applicable !== "boolean" || !Number.isFinite(item.maximumPercent) || item.maximumPercent < 0 || item.maximumPercent > 20) {
      throw new Error(`${fieldKey}.${name}: decisión o porcentaje inválido; las modificaciones previstas no pueden superar el 20 % (art. 204 LCSP).`);
    }
    if (!item.applicable && item.maximumPercent !== 0) throw new Error(`${fieldKey}.${name}: si no aplica, el porcentaje debe ser 0.`);
  }
  if (candidate.needsDa33.applicable && (!Array.isArray(candidate.needsDa33.limits) || !candidate.needsDa33.limits.length || candidate.needsDa33.limits.some(item => typeof item !== "string" || !item.trim()))) {
    throw new Error(`${fieldKey}.needsDa33: deben declararse límites materiales explícitos.`);
  }
  if (candidate.other.applicable) {
    if (typeof candidate.other.description !== "string" || !candidate.other.description.trim()) throw new Error(`${fieldKey}.other: falta descripción de la causa.`);
    if (!Array.isArray(candidate.other.limits) || !candidate.other.limits.length || candidate.other.limits.some(item => typeof item !== "string" || !item.trim())) throw new Error(`${fieldKey}.other: deben declararse límites explícitos.`);
  }
  return candidate;
}

const stabilityPercent: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  return `<text:p text:style-name="P55">-<text:tab/>Porcentaje máximo del precio del contrato al que pueda afectar: <text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1371">${d.budgetStability.applicable ? d.budgetStability.maximumPercent : 0}</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1376"></text:span></text:span> %</text:p>`;
};

const da33Cause: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const text = d.needsDa33.applicable
    ? "Mayores necesidades reales respecto de las estimadas inicialmente, en contrato de suministro en función de las necesidades conforme a la disposición adicional 33.ª LCSP."
    : "No procede modificación por mayores necesidades conforme a la disposición adicional 33.ª LCSP.";
  return `<text:p text:style-name="P41"><text:span text:style-name="T1599"><text:sequence text:ref-name="refmodif1" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">2</text:sequence></text:span><text:span text:style-name="T1599">. </text:span><text:span text:style-name="T1600">${xml(text)}</text:span><text:span text:style-name="T1601"></text:span></text:p>`;
};

const da33Limits: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const lines = d.needsDa33.applicable
    ? [...d.needsDa33.limits.map(item => item.trim()), `Porcentaje máximo de incremento: ${d.needsDa33.maximumPercent} %.`]
    : ["No procede.", "No procede."];
  const first = lines[0] ?? "No procede.";
  const second = lines.slice(1).join(" ") || "No procede.";
  return `<text:p text:style-name="P176"><text:span text:style-name="T875">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">${xml(first)}</text:span></text:span></text:p><text:p text:style-name="P177"><text:span text:style-name="T896">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">${xml(second)}</text:span></text:span></text:p>`;
};

const otherCause: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const text = d.other.applicable ? d.other.description.trim() : "Otras causas de modificación previstas: No procede.";
  return `<text:p text:style-name="P229"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526"><text:sequence text:ref-name="refmodif2" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">3</text:sequence></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526">. </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1530">${xml(text)}</text:span></text:span></text:p>`;
};

const otherLimits: UniversalTemplateValueFormatter = (value, fieldKey) => {
  const d = decision(value, fieldKey);
  const lines = d.other.applicable
    ? [...d.other.limits.map(item => item.trim()), `Porcentaje máximo: ${d.other.maximumPercent} %.`]
    : ["No procede.", "No procede."];
  const first = lines[0] ?? "No procede.";
  const second = lines.slice(1).join(" ") || "No procede.";
  return `<text:p text:style-name="P176"><text:span text:style-name="T875">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">${xml(first)}</text:span></text:span></text:p><text:p text:style-name="P177"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1532">-<text:tab/></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T909">${xml(second)}</text:span></text:span></text:p>`;
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

export const LB95_SUPPLY_ASA_TEMPLATE_ID = JDA_SUPPLY_ASA_TEMPLATE_ID;
