import { RealTemplateMappingProfile } from "../lb22/UniversalRealTemplateMappingRegistry";
import { JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY } from "../lb23/JuntaOfficialEditableTemplateDiscovery";
import { UniversalOdtPhysicalSlotBinding, UniversalOdtRendererConfiguration, UniversalTemplateValueFormatter } from "../lb23/UniversalOdtProductionRenderer";
import {
  JDA_SUPPLY_ASA_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_RENDERER_CONFIGURATION,
  JDA_SUPPLY_ASA_TEMPLATE_ID,
} from "../lb25/JuntaSupplyAsaOfficialActivation";

const EXTRA_SLOT_IDS = [
  "pcap.anexoI.1.lugarEntrega",
  "pcap.anexoI.1A.justificacionNoDivision",
  "pcap.anexoI.1C.da33",
  "pcap.anexoI.2A.iva",
  "pcap.anexoI.2A.pblIncVat",
  "pcap.anexoI.2B.metodoCalculo",
  "pcap.anexoI.2C.sistemaPrecio",
  "pcap.anexoI.2C.revisionPreciosLargo",
  "pcap.anexoI.2C.revisionPreciosCorto",
  "pcap.anexoI.3.posibilidadProrroga",
  "pcap.anexoI.3.preavisoProrroga",
] as const;

export const JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET = {
  ...JDA_SUPPLY_ASA_EDITABLE_ASSET,
  slotIds: [...JDA_SUPPLY_ASA_EDITABLE_ASSET.slotIds, ...EXTRA_SLOT_IDS],
} as const;

/**
 * Bindings adicionales contrastados físicamente contra content.xml del ODT
 * oficial exacto cuyo SHA-256 figura en LB25. Cada xmlToken aparece una sola vez
 * en el original. Se mantiene valueToken textual para no reconstruir spans ni
 * estilos administrativos.
 */
export const JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  ...JDA_SUPPLY_ASA_PHYSICAL_BINDINGS,
  {
    slotId: "pcap.anexoI.1.lugarEntrega", part: "content.xml", sourceSection: "ANEXO I / 1", sourceLabel: "Lugar de entrega del suministro",
    xmlToken: '<text:p text:style-name="P124"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T643">Lugar de entrega del suministro: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T951">_______</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.1A.justificacionNoDivision", part: "content.xml", sourceSection: "ANEXO I / 1.A", sourceLabel: "Justificación de la no división del contrato en lotes",
    xmlToken: '<text:p text:style-name="P412"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T538">Justif</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T539">i</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T538">cación de la no división del contrato en lotes: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T540">_______</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.1C.da33", part: "content.xml", sourceSection: "ANEXO I / 1.C", sourceLabel: "Contrato en función de las necesidades (DA 33ª LCSP)",
    xmlToken: '<text:span text:style-name="T1007">: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1010">Sí/No</text:span></text:span></text:p><text:p text:style-name="P213">',
    valueToken: "Sí/No",
  },
  {
    slotId: "pcap.anexoI.2A.iva", part: "content.xml", sourceSection: "ANEXO I / 2.A", sourceLabel: "Importe del IVA",
    xmlToken: '<text:p text:style-name="P401"><text:span text:style-name="T62">Importe del IVA: <text:s/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T108">_______</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T110">euros.</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.2A.pblIncVat", part: "content.xml", sourceSection: "ANEXO I / 2.A", sourceLabel: "Importe total (IVA incluido)",
    xmlToken: '<text:p text:style-name="P401"><text:span text:style-name="T62">Importe total (IVA incluido): <text:s/></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T108">_______</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T110">euros.</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.2B.metodoCalculo", part: "content.xml", sourceSection: "ANEXO I / 2.B", sourceLabel: "Método de cálculo",
    xmlToken: '<text:p text:style-name="P467"><text:span text:style-name="T62">Método de cálculo: </text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T184">_______</text:span></text:span></text:p>',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.2C.sistemaPrecio", part: "content.xml", sourceSection: "ANEXO I / 2.C", sourceLabel: "Sistema de determinación del precio",
    xmlToken: '<text:span text:style-name="T134">: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T176">_______</text:span></text:span></text:p><text:p text:style-name="P139">',
    valueToken: "_______",
  },
  {
    slotId: "pcap.anexoI.2C.revisionPreciosLargo", part: "content.xml", sourceSection: "ANEXO I / 2.C", sourceLabel: "Revisión de precios - período de recuperación igual o superior a cinco años",
    xmlToken: '<text:p text:style-name="P469"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T134">Revisión de precios </text:span></text:span><text:span text:style-name="T134">en los contratos </text:span><text:span text:style-name="T144">de suministro de fabricación de armamento y equipamiento de las Administraciones Públicas, de suministro de energía y </text:span><text:span text:style-name="T145">en</text:span><text:span text:style-name="T144"> aquellos otros </text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T226">en los que el período de recuperación de la inversión sea igual o superior a cinco años</text:span></text:span><text:span text:style-name="T62">: Sí/No</text:span></text:p>',
    valueToken: "Sí/No",
  },
  {
    slotId: "pcap.anexoI.2C.revisionPreciosCorto", part: "content.xml", sourceSection: "ANEXO I / 2.C", sourceLabel: "Revisión de precios - período de recuperación inferior a cinco años",
    xmlToken: '<text:p text:style-name="P60"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1032">Revisión de precios </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T716">en los contratos en los que </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T646">el período de recuperación de la inversión sea i</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T647">nferior</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T646"> a cinco años</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T1032">: </text:span></text:span>Sí/No </text:p>',
    valueToken: "Sí/No",
  },
  {
    slotId: "pcap.anexoI.3.posibilidadProrroga", part: "content.xml", sourceSection: "ANEXO I / 3", sourceLabel: "Posibilidad de prórroga",
    xmlToken: '<text:p text:style-name="P174"><text:span text:style-name="T1032">Posibilidad de prórroga</text:span>: Sí/No</text:p>',
    valueToken: "Sí/No",
  },
  {
    slotId: "pcap.anexoI.3.preavisoProrroga", part: "content.xml", sourceSection: "ANEXO I / 3", sourceLabel: "Plazo de preaviso de la prórroga",
    xmlToken: '<text:p text:style-name="P439"><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T326">Plazo de preaviso de la prórroga: </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T337">_______</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T338"> </text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T339">(</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T340">mínimo 2 meses, salvo que la duración del contrato sea inferior a 2 meses).</text:span></text:span></text:p>',
    valueToken: "_______",
  },
] as const;

const textList: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (!Array.isArray(value) || value.length === 0 || !value.every(item => typeof item === "string" && item.trim())) {
    throw new Error(`${fieldKey}: se requiere una lista textual validada.`);
  }
  return (value as string[]).map(item => item.trim()).join("; ");
};

const yesNo: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (typeof value !== "boolean") throw new Error(`${fieldKey}: se requiere una decisión booleana validada.`);
  return value ? "Sí" : "No";
};

const euroCents: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${fieldKey}: se requieren céntimos enteros no negativos.`);
  return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((value as number) / 100);
};

const validatedText: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${fieldKey}: se requiere texto documental validado.`);
  return value.trim();
};

const extensionExists: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${fieldKey}: duración de prórroga inválida.`);
  return (value as number) > 0 ? "Sí" : "No";
};

const months: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error(`${fieldKey}: número de meses inválido.`);
  return `${value as number} meses`;
};

const noPriceRevisionV1: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (typeof value !== "string" || !/^no(?:\b|\s|\.|;)|^no procede/i.test(value.trim())) {
    throw new Error(`${fieldKey}: el perfil V1 solo certifica físicamente el supuesto sin revisión de precios.`);
  }
  return "No";
};

export const JDA_SUPPLY_ASA_EXPANDED_RENDERER_CONFIGURATION: UniversalOdtRendererConfiguration = {
  bindingsByTemplateId: { [JDA_SUPPLY_ASA_TEMPLATE_ID]: JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS },
  formattersBySlotId: {
    ...JDA_SUPPLY_ASA_RENDERER_CONFIGURATION.formattersBySlotId,
    "pcap.anexoI.1.lugarEntrega": textList,
    "pcap.anexoI.1A.justificacionNoDivision": validatedText,
    "pcap.anexoI.1C.da33": yesNo,
    "pcap.anexoI.2A.iva": euroCents,
    "pcap.anexoI.2A.pblIncVat": euroCents,
    "pcap.anexoI.2B.metodoCalculo": validatedText,
    "pcap.anexoI.2C.sistemaPrecio": validatedText,
    "pcap.anexoI.2C.revisionPreciosLargo": noPriceRevisionV1,
    "pcap.anexoI.2C.revisionPreciosCorto": noPriceRevisionV1,
    "pcap.anexoI.3.posibilidadProrroga": extensionExists,
    "pcap.anexoI.3.preavisoProrroga": months,
  },
};

export const JDA_SUPPLY_ASA_PRODUCTION_MAPPING_PROFILE: RealTemplateMappingProfile = {
  profileId: "realmap:jda:supply:asa:pcap:anexo-i:production-2025-12-17",
  contractType: "SUPPLY",
  documentKind: "PCAP",
  templateFamilyId: "JDA-PCAP-SUPPLY-ASA-ELECTRONIC",
  templateId: JDA_SUPPLY_ASA_TEMPLATE_ID,
  sourceId: JDA_SUPPLY_ASA_OFFICIAL_ODT_DISCOVERY.sourceId,
  evidenceLocators: ["ANEXO I / 1", "ANEXO I / 1.A", "ANEXO I / 1.C", "ANEXO I / 2.A", "ANEXO I / 2.B", "ANEXO I / 2.C", "ANEXO I / 3", "ANEXO I / 7", "ANEXO I / 8"],
  slots: [
    { slotId: "pcap.anexoI.1.objeto", fieldKey: "object", required: true, sourceSection: "1", sourceLabel: "Objeto del contrato" },
    { slotId: "pcap.anexoI.1.cpv", fieldKey: "cpvMain", required: true, sourceSection: "1", sourceLabel: "Código CPV" },
    { slotId: "pcap.anexoI.1.lugarEntrega", fieldKey: "technical.executionLocations", required: true, sourceSection: "1", sourceLabel: "Lugar de entrega del suministro" },
    { slotId: "pcap.anexoI.1A.divisionLotes", fieldKey: "lots.divisionIntoLots", required: true, sourceSection: "1.A", sourceLabel: "División en lotes" },
    { slotId: "pcap.anexoI.1A.justificacionNoDivision", fieldKey: "lots.noDivisionJustification", required: true, sourceSection: "1.A", sourceLabel: "Justificación no división" },
    { slotId: "pcap.anexoI.1C.da33", fieldKey: "economic.needsBasedContractDa33", required: true, sourceSection: "1.C", sourceLabel: "DA 33ª" },
    { slotId: "pcap.anexoI.2.pbl", fieldKey: "baseTenderBudgetCents", required: true, sourceSection: "2.A", sourceLabel: "PBL IVA excluido" },
    { slotId: "pcap.anexoI.2A.iva", fieldKey: "economic.initialVatAmountCents", required: true, sourceSection: "2.A", sourceLabel: "IVA" },
    { slotId: "pcap.anexoI.2A.pblIncVat", fieldKey: "economic.initialPblVatIncludedCents", required: true, sourceSection: "2.A", sourceLabel: "PBL IVA incluido" },
    { slotId: "pcap.anexoI.2.valorEstimado", fieldKey: "economic.legalEstimatedValueCents", required: true, sourceSection: "2.B", sourceLabel: "Valor estimado" },
    { slotId: "pcap.anexoI.2B.metodoCalculo", fieldKey: "economic.estimatedValueCalculationMethod", required: true, sourceSection: "2.B", sourceLabel: "Método de cálculo" },
    { slotId: "pcap.anexoI.2C.sistemaPrecio", fieldKey: "economic.priceDeterminationRegime", required: true, sourceSection: "2.C", sourceLabel: "Sistema de precio" },
    { slotId: "pcap.anexoI.2C.revisionPreciosLargo", fieldKey: "economic.priceRevisionRegime", required: true, sourceSection: "2.C", sourceLabel: "Revisión precios >=5 años" },
    { slotId: "pcap.anexoI.2C.revisionPreciosCorto", fieldKey: "economic.priceRevisionRegime", required: true, sourceSection: "2.C", sourceLabel: "Revisión precios <5 años" },
    { slotId: "pcap.anexoI.3.duracion", fieldKey: "durationMonths", required: true, sourceSection: "3", sourceLabel: "Duración" },
    { slotId: "pcap.anexoI.3.posibilidadProrroga", fieldKey: "extensionMonths", required: true, sourceSection: "3", sourceLabel: "Posibilidad de prórroga" },
    { slotId: "pcap.anexoI.3.prorrogas", fieldKey: "execution.extensionStructure", required: true, sourceSection: "3", sourceLabel: "Duración de la prórroga" },
    { slotId: "pcap.anexoI.3.preavisoProrroga", fieldKey: "execution.extensionNoticeMonths", required: true, sourceSection: "3", sourceLabel: "Preaviso" },
    { slotId: "pcap.anexoI.7.criterios", fieldKey: "criteria.awardCriteria", required: true, sourceSection: "7", sourceLabel: "Criterio único" },
    { slotId: "pcap.anexoI.8.condicionesEspeciales", fieldKey: "execution.specialExecutionConditions", required: true, sourceSection: "8.A", sourceLabel: "Condiciones especiales" },
  ],
};

export const JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS = [
  "1.B contratación reservada DA 4ª: el Sí/No está fragmentado en varios spans y controles; no se elimina estilo con una sustitución insegura.",
  "2.A anualidades y partida presupuestaria: requieren binding estructurado de tabla, no serialización plana.",
  "5 tramitación del expediente: Ordinaria/Urgente se expresa mediante controles ODF; falta manipulación segura del estado de formulario.",
  "7 motivación específica del criterio único precio: requiere hueco físico independiente además del indicador Sí/No.",
  "14 modificación prevista: causa, alcance y porcentaje están distribuidos en varios párrafos; no se reduce el régimen al campo modificationPercent.",
] as const;
