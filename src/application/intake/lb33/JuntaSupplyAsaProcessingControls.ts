import { UniversalOdtPhysicalSlotBinding, UniversalOdtRendererConfiguration, UniversalTemplateValueFormatter } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_TEMPLATE_ID } from "../lb25/JuntaSupplyAsaOfficialActivation";
import {
  JDA_SUPPLY_ASA_LB32_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB32_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_LB32_RENDERER_CONFIGURATION,
  JDA_SUPPLY_ASA_LB32_REMAINING_ISSUES,
} from "../lb32/JuntaSupplyAsaAnnualityTableBinding";

const CONTROL9 = '<form:checkbox form:name="Casilla 1" form:control-implementation="ooo:com.sun.star.form.component.CheckBox" xml:id="control9" form:id="control9" form:label="Casilla" form:input-required="false" form:image-position="center"><form:properties><form:property form:property-name="ControlTypeinMSO" office:value-type="float" office:value="0"/><form:property form:property-name="DefaultControl" office:value-type="string" office:string-value="com.sun.star.form.control.CheckBox"/><form:property form:property-name="ObjIDinMSO" office:value-type="float" office:value="65535"/><form:property form:property-name="SecondaryRefValue" office:value-type="string" office:string-value=""/></form:properties></form:checkbox>';
const CONTROL10 = '<form:checkbox form:name="Casilla 1" form:control-implementation="ooo:com.sun.star.form.component.CheckBox" xml:id="control10" form:id="control10" form:label="Casilla" form:input-required="false" form:image-position="center"><form:properties><form:property form:property-name="ControlTypeinMSO" office:value-type="float" office:value="0"/><form:property form:property-name="DefaultControl" office:value-type="string" office:string-value="com.sun.star.form.control.CheckBox"/><form:property form:property-name="ObjIDinMSO" office:value-type="float" office:value="65535"/><form:property form:property-name="SecondaryRefValue" office:value-type="string" office:string-value=""/></form:properties></form:checkbox>';

export const JDA_SUPPLY_ASA_PROCESSING_CONTROL_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  {
    slotId: "pcap.anexoI.5.tramitacion.ordinariaControl",
    part: "content.xml",
    sourceSection: "ANEXO I / 5",
    sourceLabel: "Tramitación del expediente - Ordinaria",
    xmlToken: CONTROL9,
    escapeMode: "RAW_XML",
  },
  {
    slotId: "pcap.anexoI.5.tramitacion.urgenteControl",
    part: "content.xml",
    sourceSection: "ANEXO I / 5",
    sourceLabel: "Tramitación del expediente - Urgente",
    xmlToken: CONTROL10,
    escapeMode: "RAW_XML",
  },
] as const;

function normalizedProcessing(value: unknown, fieldKey: string): "ORDINARY" | "URGENT" {
  if (typeof value !== "string") throw new Error(`${fieldKey}: se requiere tipo de tramitación validado.`);
  const normalized = value.trim().toUpperCase();
  if (["ORDINARY", "ORDINARIA"].includes(normalized)) return "ORDINARY";
  if (["URGENT", "URGENTE"].includes(normalized)) return "URGENT";
  throw new Error(`${fieldKey}: el perfil ASA solo materializa tramitación ordinaria o urgente.`);
}

function checkboxXml(original: string, state: "checked" | "unchecked"): string {
  const marker = " form:control-implementation=";
  if (!original.includes(marker)) throw new Error("Control ODF sin anclaje de implementación.");
  return original.replace(marker, ` form:current-state="${state}"${marker}`);
}

const ordinaryControl: UniversalTemplateValueFormatter = (value, fieldKey) =>
  checkboxXml(CONTROL9, normalizedProcessing(value, fieldKey) === "ORDINARY" ? "checked" : "unchecked");

const urgentControl: UniversalTemplateValueFormatter = (value, fieldKey) =>
  checkboxXml(CONTROL10, normalizedProcessing(value, fieldKey) === "URGENT" ? "checked" : "unchecked");

export const JDA_SUPPLY_ASA_LB33_EDITABLE_ASSET = {
  ...JDA_SUPPLY_ASA_LB32_EDITABLE_ASSET,
  slotIds: [...JDA_SUPPLY_ASA_LB32_EDITABLE_ASSET.slotIds, ...JDA_SUPPLY_ASA_PROCESSING_CONTROL_BINDINGS.map(item => item.slotId)],
} as const;

export const JDA_SUPPLY_ASA_LB33_PHYSICAL_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  ...JDA_SUPPLY_ASA_LB32_PHYSICAL_BINDINGS,
  ...JDA_SUPPLY_ASA_PROCESSING_CONTROL_BINDINGS,
] as const;

export const JDA_SUPPLY_ASA_LB33_RENDERER_CONFIGURATION: UniversalOdtRendererConfiguration = {
  bindingsByTemplateId: { [JDA_SUPPLY_ASA_TEMPLATE_ID]: JDA_SUPPLY_ASA_LB33_PHYSICAL_BINDINGS },
  formattersBySlotId: {
    ...JDA_SUPPLY_ASA_LB32_RENDERER_CONFIGURATION.formattersBySlotId,
    "pcap.anexoI.5.tramitacion.ordinariaControl": ordinaryControl,
    "pcap.anexoI.5.tramitacion.urgenteControl": urgentControl,
  },
};

export const JDA_SUPPLY_ASA_LB33_REMAINING_ISSUES = JDA_SUPPLY_ASA_LB32_REMAINING_ISSUES.filter(
  issue => issue.id !== "processing-ordinary-urgent-controls",
);

export function evaluateJdaSupplyAsaLb33PhysicalClosure() {
  const blockers = JDA_SUPPLY_ASA_LB33_REMAINING_ISSUES.filter(issue => issue.blockingForFullRender);
  return {
    safeBindingCount: JDA_SUPPLY_ASA_LB33_PHYSICAL_BINDINGS.length,
    remainingBlockingCount: blockers.length,
    fullPhysicalCoverageReady: blockers.length === 0,
    blockers,
  } as const;
}
