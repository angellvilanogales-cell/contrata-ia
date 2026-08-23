import { UniversalOdtPhysicalSlotBinding, UniversalOdtRendererConfiguration, UniversalTemplateValueFormatter } from "../lb23/UniversalOdtProductionRenderer";
import { JDA_SUPPLY_ASA_TEMPLATE_ID } from "../lb25/JuntaSupplyAsaOfficialActivation";
import {
  JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_EXPANDED_RENDERER_CONFIGURATION,
} from "../lb28/JuntaSupplyAsaExpandedPhysicalProfile";

/**
 * LB31.1 — cierre de los bloqueos físicos restantes que pueden resolverse sin
 * alterar estructura ODF ni inventar huecos documentales.
 *
 * La inspección del content.xml del ODT oficial exacto acreditó que la decisión
 * «Contrato reservado DA 4ª LCSP» es texto Sí/No, no un control de formulario.
 * Por tanto puede parametrizarse con el mismo mecanismo conservador usado para
 * DA 33ª y otros valores textuales, preservando spans y estilos.
 */
export const JDA_SUPPLY_ASA_RESERVED_DA4_BINDING: UniversalOdtPhysicalSlotBinding = {
  slotId: "pcap.anexoI.1B.contratoReservado",
  part: "content.xml",
  sourceSection: "ANEXO I / 1.B",
  sourceLabel: "Contrato reservado DA 4ª LCSP",
  xmlToken: '<text:span text:style-name="T217">:</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T200"> Sí/</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T201">N</text:span></text:span><text:span text:style-name="Fuente_20_de_20_párrafo_20_predeter."><text:span text:style-name="T200">o</text:span></text:span></text:p>',
  valueToken: "Sí/</text:span></text:span><text:span text:style-name=\"Fuente_20_de_20_párrafo_20_predeter.\"><text:span text:style-name=\"T201\">N</text:span></text:span><text:span text:style-name=\"Fuente_20_de_20_párrafo_20_predeter.\"><text:span text:style-name=\"T200\">o",
};

const reservedDa4: UniversalTemplateValueFormatter = (value, fieldKey) => {
  if (typeof value !== "boolean") throw new Error(`${fieldKey}: se requiere una decisión booleana validada.`);
  return value ? "Sí" : "No";
};

export const JDA_SUPPLY_ASA_LB31_EDITABLE_ASSET = {
  ...JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET,
  slotIds: [...JDA_SUPPLY_ASA_EXPANDED_EDITABLE_ASSET.slotIds, JDA_SUPPLY_ASA_RESERVED_DA4_BINDING.slotId],
} as const;

export const JDA_SUPPLY_ASA_LB31_PHYSICAL_BINDINGS: readonly UniversalOdtPhysicalSlotBinding[] = [
  ...JDA_SUPPLY_ASA_EXPANDED_PHYSICAL_BINDINGS,
  JDA_SUPPLY_ASA_RESERVED_DA4_BINDING,
] as const;

export const JDA_SUPPLY_ASA_LB31_RENDERER_CONFIGURATION: UniversalOdtRendererConfiguration = {
  bindingsByTemplateId: { [JDA_SUPPLY_ASA_TEMPLATE_ID]: JDA_SUPPLY_ASA_LB31_PHYSICAL_BINDINGS },
  formattersBySlotId: {
    ...JDA_SUPPLY_ASA_EXPANDED_RENDERER_CONFIGURATION.formattersBySlotId,
    "pcap.anexoI.1B.contratoReservado": reservedDa4,
  },
};

export type RemainingPhysicalIssueStatus =
  | "REQUIRES_ODF_TABLE_MUTATION"
  | "REQUIRES_ODF_FORM_CONTROL_MUTATION"
  | "NO_DEDICATED_PHYSICAL_SLOT"
  | "REQUIRES_STRUCTURED_SECTION_MUTATION";

export interface RemainingPhysicalIssue {
  id: string;
  status: RemainingPhysicalIssueStatus;
  blockingForFullRender: boolean;
  finding: string;
  treatment: string;
}

/**
 * Resultado de la revisión física del original exacto frente a los cinco
 * bloqueos heredados de LB28.
 *
 * Importante: la motivación del criterio único deja de contarse como bloqueo
 * físico. El modelo oficial no contiene un hueco específico de «motivación» en
 * el Anexo I; la exigencia se conserva como evidencia jurídica y de auditoría,
 * pero no se inserta artificialmente en un párrafo que el modelo no prevé.
 */
export const JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES: readonly RemainingPhysicalIssue[] = [
  {
    id: "annualities-budget-table",
    status: "REQUIRES_ODF_TABLE_MUTATION",
    blockingForFullRender: true,
    finding: "Las anualidades se materializan en table:table Tabla1 con cabecera Año/Importe/Partida Presupuestaria y filas ODF, no en un placeholder textual único.",
    treatment: "Añadir mutación estructurada de tabla que reutilice estilos Tabla1.* y solo admita filas económicas ya validadas.",
  },
  {
    id: "processing-ordinary-urgent-controls",
    status: "REQUIRES_ODF_FORM_CONTROL_MUTATION",
    blockingForFullRender: true,
    finding: "La tramitación del expediente usa controles ODF draw:control vinculados a control9 (Ordinaria) y control10 (Urgente).",
    treatment: "Implementar soporte explícito de estado de checkbox ODF; no sustituirlo por texto ni símbolos Unicode.",
  },
  {
    id: "single-price-criterion-motivation",
    status: "NO_DEDICATED_PHYSICAL_SLOT",
    blockingForFullRender: false,
    finding: "El modelo contiene el Sí/No de criterio único y la estructura de criterios, pero no un hueco específico para insertar la motivación jurídica del criterio único.",
    treatment: "Mantener criteria.singleCriterionMotivation como evidencia/auditoría y no fabricar un slot físico inexistente.",
  },
  {
    id: "planned-modification-section",
    status: "REQUIRES_STRUCTURED_SECTION_MUTATION",
    blockingForFullRender: true,
    finding: "El apartado 14 combina posibilidad Sí/No, causas numeradas, alcance/límites y porcentaje máximo en varios párrafos y secuencias ODF.",
    treatment: "Parametrizar la sección como estructura controlada, preservando la causa estándar del modelo y añadiendo solo la causa DA 33ª validada, alcance y 20 % sin reintroducir artículos/precios nuevos.",
  },
] as const;

export interface Lb31PhysicalClosureResult {
  safeBindingCount: number;
  remainingBlockingCount: number;
  fullPhysicalCoverageReady: boolean;
  blockers: readonly RemainingPhysicalIssue[];
  nonBlockingFindings: readonly RemainingPhysicalIssue[];
}

export function evaluateJdaSupplyAsaLb31PhysicalClosure(): Lb31PhysicalClosureResult {
  const blockers = JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES.filter(item => item.blockingForFullRender);
  const nonBlockingFindings = JDA_SUPPLY_ASA_LB31_REMAINING_ISSUES.filter(item => !item.blockingForFullRender);
  return {
    safeBindingCount: JDA_SUPPLY_ASA_LB31_PHYSICAL_BINDINGS.length,
    remainingBlockingCount: blockers.length,
    fullPhysicalCoverageReady: blockers.length === 0,
    blockers,
    nonBlockingFindings,
  };
}
