import { RealTemplateMappingProfile } from "../lb22/UniversalRealTemplateMappingRegistry";
import { UniversalOdtPhysicalSlotBinding, UniversalOdtRendererConfiguration, UniversalTemplateValueFormatter } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_TEMPLATE_ID } from "../lb25/JuntaSupplyAsaOfficialActivation";
import { JDA_SUPPLY_ASA_PRODUCTION_MAPPING_PROFILE } from "../lb28/JuntaSupplyAsaExpandedPhysicalProfile";
import {
  JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB33_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_LB33_RENDERER_CONFIGURATION,
  JDA_SUPPLY_ASA_LB33_REMAINING_ISSUES,
} from "../lb33/JuntaSupplyAsaProcessingControls";

/**
 * Decisión jurídica revisada para CONTR/2026/240267.
 *
 * Se mantienen separadas dos direcciones de modificación previstas:
 * - estabilidad presupuestaria: reducción de financiación -> modificación a la baja;
 * - DA 33.ª LCSP: necesidades reales superiores -> modificación al alza.
 *
 * La reducción no incrementa el valor estimado. Conforme al art. 101.2.c LCSP,
 * el VE toma las modificaciones al alza previstas. Para este caso la DA 33.ª es
 * la modificación al alza computada, con límite del 20 % y sin nuevos precios
 * unitarios, de acuerdo con los arts. 101.2.c y 204 y la DA 33.ª LCSP.
 *
 * El modelo oficial de la Junta liga además la resolución por estabilidad
 * presupuestaria a que la reducción exceda el porcentaje previsto como causa de
 * modificación. Por ello el expediente puede fijar el 20 % como máximo de
 * reducción y reservar la resolución para una reducción que exceda ese 20 %.
 */
export const FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID =
  "CONTR-2026-240267:STABILITY-DOWN-20:DA33-UP-20:NO-NEW-ARTICLES-OR-PRICES";

export const FERRETERIA_PLANNED_MODIFICATION_LEGAL_DECISION = {
  caseId: "CONTR/2026/240267",
  budgetStability: {
    direction: "DOWN" as const,
    maximumPercent: 20,
    trigger: "Reducción de la financiación prevista por medidas de estabilidad presupuestaria acordadas por el órgano competente.",
    effect: "El precio y las obligaciones de la persona contratista se reducen proporcionalmente en el mismo porcentaje.",
    valueEstimatedTreatment: "DOES_NOT_INCREASE_ESTIMATED_VALUE" as const,
    legalBasis: ["Ley 3/2012 Andalucía, DA 4.ª.2", "LCSP arts. 203-204"],
  },
  needsDa33: {
    direction: "UP" as const,
    maximumPercent: 20,
    trigger: "Necesidades reales superiores a las estimadas inicialmente durante la vigencia del contrato.",
    effect: "Aumento exclusivo de unidades de referencias ya incluidas, manteniendo objeto y precios unitarios adjudicados.",
    forbidsNewArticles: true,
    forbidsNewUnitPrices: true,
    mustBeProcessedBeforeMaximumBudgetExhaustion: true,
    requiresReservedCredit: true,
    valueEstimatedTreatment: "INCLUDED_AS_UPWARD_MODIFICATION" as const,
    legalBasis: ["LCSP DA 33.ª", "LCSP art. 204", "LCSP art. 101.2.c"],
  },
} as const;

const CAUSE1_PERCENT_ORIGINAL = '<text:p text:style-name="P55">-<text:tab/>Porcentaje máximo del precio del contrato al que pueda afectar: <text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1371">_</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1376">______</text:span></text:span> %</text:p>';
const CAUSE2_ORIGINAL = '<text:p text:style-name="P41"><text:span text:style-name="T1599"><text:sequence text:ref-name="refmodif1" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">2</text:sequence></text:span><text:span text:style-name="T1599">. </text:span><text:span text:style-name="T1600">_______</text:span><text:span text:style-name="T1601">(Indicar causa de modificación).</text:span></text:p>';
const CAUSE2_LIMITS_ORIGINAL = '<text:p text:style-name="P176"><text:span text:style-name="T875">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">_________</text:span></text:span></text:p><text:p text:style-name="P177"><text:span text:style-name="T896">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">_________</text:span></text:span></text:p>';
const CAUSE3_ORIGINAL = '<text:p text:style-name="P229"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526"><text:sequence text:ref-name="refmodif2" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">3</text:sequence></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526">. </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1530">_______ (Indicar causa de modificación).</text:span></text:span></text:p>';
const CAUSE3_LIMITS_ORIGINAL = '<text:p text:style-name="P176"><text:span text:style-name="T875">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">_________</text:span></text:span></text:p><text:p text:style-name="P177"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1532">-<text:tab/></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T909">_________</text:span></text:span></text:p>';

export const JDA_SUPPLY_ASA_MODIFICATION_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  { slotId: "pcap.anexoI.14.estabilidad.porcentaje", part: "content.xml", sourceSection: "ANEXO I / 14", sourceLabel: "Estabilidad presupuestaria - porcentaje máximo", xmlToken: CAUSE1_PERCENT_ORIGINAL, escapeMode: "RAW_XML" },
  { slotId: "pcap.anexoI.14.da33.causa", part: "content.xml", sourceSection: "ANEXO I / 14", sourceLabel: "DA 33ª - causa", xmlToken: CAUSE2_ORIGINAL, escapeMode: "RAW_XML" },
  { slotId: "pcap.anexoI.14.da33.limites", part: "content.xml", sourceSection: "ANEXO I / 14", sourceLabel: "DA 33ª - alcance y límites", xmlToken: CAUSE2_LIMITS_ORIGINAL, escapeMode: "RAW_XML" },
  { slotId: "pcap.anexoI.14.otras.causa", part: "content.xml", sourceSection: "ANEXO I / 14", sourceLabel: "Otras causas", xmlToken: CAUSE3_ORIGINAL, escapeMode: "RAW_XML" },
  { slotId: "pcap.anexoI.14.otras.limites", part: "content.xml", sourceSection: "ANEXO I / 14", sourceLabel: "Otras causas - alcance y límites", xmlToken: CAUSE3_LIMITS_ORIGINAL, escapeMode: "RAW_XML" },
] as const;

function requireProfile(value: unknown, fieldKey: string): void {
  if (value !== FERRETERIA_PLANNED_MODIFICATION_PROFILE_ID) {
    throw new Error(`${fieldKey}: el apartado 14 solo se materializa con el perfil jurídico CONTR/2026/240267 validado.`);
  }
}

const stabilityPercent: UniversalTemplateValueFormatter = (value, fieldKey) => {
  requireProfile(value, fieldKey);
  return '<text:p text:style-name="P55">-<text:tab/>Porcentaje máximo del precio del contrato al que pueda afectar: <text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1371">20</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1376"></text:span></text:span> %</text:p>';
};

const da33Cause: UniversalTemplateValueFormatter = (value, fieldKey) => {
  requireProfile(value, fieldKey);
  return '<text:p text:style-name="P41"><text:span text:style-name="T1599"><text:sequence text:ref-name="refmodif1" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">2</text:sequence></text:span><text:span text:style-name="T1599">. </text:span><text:span text:style-name="T1600">Mayores necesidades reales respecto de las estimadas inicialmente, en contrato de suministro en función de las necesidades conforme a la disposición adicional 33.ª LCSP.</text:span><text:span text:style-name="T1601"></text:span></text:p>';
};

const da33Limits: UniversalTemplateValueFormatter = (value, fieldKey) => {
  requireProfile(value, fieldKey);
  return '<text:p text:style-name="P176"><text:span text:style-name="T875">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">Aumento exclusivamente de unidades de las referencias ya incluidas, manteniendo el mismo objeto y los precios unitarios adjudicados; no podrán incorporarse nuevos artículos ni establecerse nuevos precios unitarios.</text:span></text:span></text:p><text:p text:style-name="P177"><text:span text:style-name="T896">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">Porcentaje máximo de incremento: 20 % del presupuesto máximo inicialmente aprobado, debiendo tramitarse la modificación antes de agotarlo y reservarse el crédito necesario.</text:span></text:span></text:p>';
};

const noOtherCause: UniversalTemplateValueFormatter = (value, fieldKey) => {
  requireProfile(value, fieldKey);
  return '<text:p text:style-name="P229"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526"><text:sequence text:ref-name="refmodif2" text:name="modif" text:formula="ooow:modif+1" style:num-format="1">3</text:sequence></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1526">. </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1530">Otras causas de modificación previstas: No procede.</text:span></text:span></text:p>';
};

const noOtherLimits: UniversalTemplateValueFormatter = (value, fieldKey) => {
  requireProfile(value, fieldKey);
  return '<text:p text:style-name="P176"><text:span text:style-name="T875">-<text:tab/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1377">No procede.</text:span></text:span></text:p><text:p text:style-name="P177"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1532">-<text:tab/></text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T909">No procede.</text:span></text:span></text:p>';
};

export const JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET = {
  ...JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET,
  slotIds: [...JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET.slotIds, ...JDA_SUPPLY_ASA_MODIFICATION_BINDINGS.map(item => item.slotId)],
} as const;

export const JDA_SUPPLY_ASA_LB34_PHYSICAL_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  ...JDA_SUPPLY_ASA_LB33_PHYSICAL_BINDINGS,
  ...JDA_SUPPLY_ASA_MODIFICATION_BINDINGS,
] as const;

export const JDA_SUPPLY_ASA_LB34_RENDERER_CONFIGURATION: UniversalOdtRendererConfiguration = {
  bindingsByTemplateId: { [JDA_SUPPLY_ASA_TEMPLATE_ID]: JDA_SUPPLY_ASA_LB34_PHYSICAL_BINDINGS },
  formattersBySlotId: {
    ...JDA_SUPPLY_ASA_LB33_RENDERER_CONFIGURATION.formattersBySlotId,
    "pcap.anexoI.14.estabilidad.porcentaje": stabilityPercent,
    "pcap.anexoI.14.da33.causa": da33Cause,
    "pcap.anexoI.14.da33.limites": da33Limits,
    "pcap.anexoI.14.otras.causa": noOtherCause,
    "pcap.anexoI.14.otras.limites": noOtherLimits,
  },
};

export const JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE: RealTemplateMappingProfile = {
  ...JDA_SUPPLY_ASA_PRODUCTION_MAPPING_PROFILE,
  profileId: "realmap:jda:supply:asa:pcap:anexo-i:production-lb34-2025-12-17",
  evidenceLocators: [...JDA_SUPPLY_ASA_PRODUCTION_MAPPING_PROFILE.evidenceLocators, "ANEXO I / 1.B", "ANEXO I / 2.A tabla anualidades", "ANEXO I / 5", "ANEXO I / 14"],
  slots: [
    ...JDA_SUPPLY_ASA_PRODUCTION_MAPPING_PROFILE.slots,
    { slotId: "pcap.anexoI.1B.contratoReservado", fieldKey: "administrative.reservedContractDa4", required: true, sourceSection: "1.B", sourceLabel: "Contrato reservado DA 4ª" },
    { slotId: "pcap.anexoI.2A.anualidadesTabla", fieldKey: "economic.annualityBudgetRows", required: true, sourceSection: "2.A", sourceLabel: "Tabla anualidades" },
    { slotId: "pcap.anexoI.5.tramitacion.ordinariaControl", fieldKey: "processing.processingType", required: true, sourceSection: "5", sourceLabel: "Tramitación ordinaria" },
    { slotId: "pcap.anexoI.5.tramitacion.urgenteControl", fieldKey: "processing.processingType", required: true, sourceSection: "5", sourceLabel: "Tramitación urgente" },
    ...JDA_SUPPLY_ASA_MODIFICATION_BINDINGS.map(binding => ({
      slotId: binding.slotId,
      fieldKey: "execution.plannedModificationRegime",
      required: true,
      sourceSection: "14",
      sourceLabel: binding.sourceLabel,
    })),
  ],
};

export const JDA_SUPPLY_ASA_LB34_REMAINING_ISSUES = JDA_SUPPLY_ASA_LB33_REMAINING_ISSUES.filter(
  issue => issue.id !== "planned-modification-section",
);

export function evaluateJdaSupplyAsaLb34PhysicalClosure() {
  const blockers = JDA_SUPPLY_ASA_LB34_REMAINING_ISSUES.filter(issue => issue.blockingForFullRender);
  return {
    safeBindingCount: JDA_SUPPLY_ASA_LB34_PHYSICAL_BINDINGS.length,
    remainingBlockingCount: blockers.length,
    fullPhysicalCoverageReady: blockers.length === 0,
    blockers,
    nonBlockingFindings: JDA_SUPPLY_ASA_LB34_REMAINING_ISSUES.filter(issue => !issue.blockingForFullRender),
  } as const;
}
