import { createHash } from "node:crypto";
import type { UniversalEvidenceRecord } from "../../intake/lb52/UniversalEvidenceWorkspace";
import {
  computeOdtStyleFingerprint,
  UniversalOdtProductionRenderer,
  type UniversalEditableTemplateBinaryStore,
} from "../../intake/lb23/UniversalOdtProductionRenderer";
import { readOdtZip, writeOdtZip } from "../../intake/lb23/OdtPackageCodec";
import {
  JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET,
  JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE,
} from "../../intake/lb34/JuntaSupplyAsaModificationSection";
import { JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION } from "../../intake/lb95/SupplyAsaGeneralPcapRenderer";
import { auditJdaSupplyAsaRenderedOdt } from "../../intake/lb35/JuntaSupplyAsaAnexoIResidualAudit";

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

function decode(value: string): string {
  return value.replace(/<text:tab[^>]*\/>/g, "\t")
    .replace(/<text:line-break[^>]*\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/\s+/g, " ").trim();
}
function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function normalized(value: string): string { return value.replace(/\s+/g, " ").trim(); }
function unresolved(text: string): boolean { return /(?:Sí\s*\/\s*No|_{3,}|:\s*$)/i.test(text); }

/**
 * LB102 — cierre específico del golden case CONTR/2026/240267.
 *
 * Estas decisiones proceden del PCAP final CI2006 / candidato V1 contrastado del
 * expediente. No son defaults generales de Supply ASA. Se materializan después
 * del mapping genérico porque el modelo oficial contiene decisiones del órgano
 * de contratación que todavía no están registradas como slots universales.
 */
function sourceBackedFerreteriaDecision(text: string, counters: { total: number }): string | null {
  const t = normalized(text);
  if (!unresolved(t)) return null;

  if (/^Especificaciones del objeto del contrato/i.test(t)) return "Especificaciones del objeto del contrato: catálogo cerrado de 98 referencias de ferretería, con cantidades estimativas por referencia y precios unitarios; no podrán incorporarse artículos nuevos ni precios unitarios nuevos mediante la modificación prevista.";
  if (/^Total:/i.test(t)) {
    counters.total += 1;
    if (/unidad/i.test(t) || counters.total === 1) return "Total: cantidades estimadas por referencia.";
    return "Total: 10.552,44 euros.";
  }
  if (/^Descripción de los lotes/i.test(t)) return "Descripción de los lotes: No procede.";
  if (/^LOTE\s+\d+/i.test(t)) return t.replace(/:.*/, ": No procede.").replace(/_+/g, "No procede.");
  if (/^Número máximo de lotes para los que/i.test(t)) return "Número máximo de lotes para los que una misma persona licitadora puede presentar oferta: No procede.";
  if (/^Número máximo de lotes que pueden adjudicarse/i.test(t)) return "Número máximo de lotes que pueden adjudicarse a cada persona licitadora: No procede.";
  if (/^Oferta integradora/i.test(t)) return "Oferta integradora: No.";
  if (/^Régimen jurídico específico/i.test(t)) return "Régimen jurídico específico por razón del objeto del contrato: No procede.";
  if (/^Fórmula de revisión/i.test(t) || /^Fórmula:/i.test(t)) return "Fórmula: No procede.";
  if (/^Variación de precios/i.test(t)) return "Variación de precios en función del cumplimiento o incumplimiento de objetivos de plazos o rendimiento: No.";
  if (/^Pago mediante entrega/i.test(t) || /^Entrega de otros bienes/i.test(t)) return "Entrega de otros bienes de la misma clase como pago de parte del precio: No.";
  if (/^Incremento.*10\s*%/i.test(t) || /^Posibilidad de incremento del número de unidades/i.test(t)) return "Posibilidad de incremento del número de unidades a suministrar de hasta el 10 % del precio del contrato: No.";
  if (/^Plazos parciales/i.test(t)) return "Plazos parciales: No procede como hitos temporales; cada pedido deberá entregarse en un máximo de cinco días hábiles conforme al PPT.";
  if (/^Órgano de contratación/i.test(t)) return "Órgano de contratación: Dirección Gerencia del Servicio Andaluz de Empleo.";
  if (/^Respuestas vinculantes/i.test(t)) return "Respuestas vinculantes sobre la aclaración de los pliegos: No.";
  if (/^Constitución de mesa/i.test(t)) return "Constitución de mesa de contratación: Sí.";
  if (/^Posibilidad de variantes/i.test(t)) return "Posibilidad de variantes: No.";
  if (/^En caso de renuncia/i.test(t)) return "En caso de renuncia: 100 euros, previa justificación de los gastos ocasionados.";
  if (/^En caso de desistimiento/i.test(t)) return "En caso de desistimiento: 100 euros, previa justificación de los gastos ocasionados.";
  if (/^Organismos de los que/i.test(t)) return "Organismos de los que las personas licitadoras pueden obtener la información pertinente sobre las obligaciones previstas en el artículo 129.1 de la LCSP: No procede.";
  if (/^Se exige habilitación empresarial/i.test(t)) return "Se exige habilitación empresarial o profesional: No.";
  if (/^Otros requisitos necesarios.*ENS/i.test(t)) return "Otros requisitos necesarios para asegurar la conformidad de dichos sistemas con el ENS, en su caso: No procede.";
  if (/^Criterios de adjudicación/i.test(t)) return "Criterios de adjudicación: proposición económica, precio, 100 puntos; restantes criterios: No procede.";
  if (/^Parámetros objetivos/i.test(t)) return "Parámetros objetivos para considerar una oferta anormalmente baja: artículo 85 del RGLCAP, de conformidad con el artículo 149.2 de la LCSP.";
  if (/^Criterios de desempate/i.test(t)) return "Criterios de desempate: los previstos en el modelo oficial y, si persiste el empate, aplicación supletoria del artículo 147.2 LCSP.";
  if (/^Subcontratación/i.test(t)) return "Subcontratación: régimen materializado en el apartado 9; no se exige indicar en la oferta una parte prevista para subcontratar y no procede subcontratación de servidores con acceso a datos personales.";

  if (/^Penalidades por incumplimiento de las condiciones especiales/i.test(t)) return "Penalidades por incumplimiento de las condiciones especiales de ejecución del contrato: Sí.";
  if (/^Penalidades por demora/i.test(t)) return "Penalidades por demora en la ejecución parcial o total del plazo de ejecución, distintas de las establecidas en el primer párrafo del artículo 193.3 de la LCSP: Sí.";
  if (/^Penalidades por cumplimiento defectuoso/i.test(t)) return "Penalidades por cumplimiento defectuoso: No.";
  if (/^Penalidades por incumplimiento parcial/i.test(t)) return "Penalidades por incumplimiento parcial en la ejecución de las prestaciones definidas en el contrato, por causas imputables a la persona contratista: No.";
  if (/^Penalidades por incumplimiento de las obligaciones en materia medioambiental/i.test(t)) return "Penalidades por incumplimiento de las obligaciones en materia medioambiental, social o laboral: Sí.";
  if (/^Penalidades/i.test(t)) return "Penalidades: se aplican las previstas expresamente en los apartados 8.B y 10 del Anexo I; no se dejan decisiones pendientes del órgano de contratación.";

  if (/^Periodicidad del pago/i.test(t)) return "Periodicidad del pago: No procede para pagos directos a subcontratistas.";
  if (/^Datos a incluir en la factura/i.test(t)) return "Datos a incluir en la factura electrónica: órgano gestor Servicio Andaluz de Empleo A01004615; unidad tramitadora Servicio Andaluz de Empleo A01004615; oficina contable Intervención General A01004456.";
  if (/^Plazo de garantía/i.test(t)) return "Plazo de garantía: 3 años para bienes duraderos; para fungibles o consumibles, perfecto estado, ausencia de defectos ocultos en la entrega y respeto de la caducidad del fabricante.";
  if (/^Programa de trabajo/i.test(t)) return "Programa de trabajo: No.";
  if (/^Información a la que se le atribuye carácter confidencial/i.test(t) || /^Información a la que se atribuye carácter confidencial/i.test(t)) return "Información a la que se atribuye carácter confidencial: la empresa contratista no tendrá acceso a información de carácter confidencial por razón del objeto, sin perjuicio del deber legal de confidencialidad.";
  if (/^Plazo durante el que.*confidencialidad/i.test(t) || /^Plazo del deber de confidencialidad/i.test(t)) return "Plazo durante el que la persona contratista deberá mantener el deber de confidencialidad: 5 años, salvo plazo legal superior.";
  if (/^Obligación de tener suscrito seguro/i.test(t)) return "Obligación de tener suscrito seguro que cubra las responsabilidades que se deriven de la ejecución del contrato: No.";
  if (/^En su caso, términos del seguro/i.test(t)) return "En su caso, términos del seguro: No procede.";
  if (/^Cesión del contrato/i.test(t)) return "Cesión del contrato: Sí, conforme al apartado 15 del PCAP y a la LCSP.";
  if (/^En el supuesto de suspensión/i.test(t)) return "En el supuesto de suspensión del contrato o demora en el pago superior a cuatro meses, se establecen reglas especiales para el abono de daños y perjuicios: No.";
  if (/^La ejecución del contrato requiere el tratamiento/i.test(t)) return "La ejecución del contrato requiere el tratamiento por la persona contratista de datos personales por cuenta de la persona responsable del tratamiento: No.";

  if (/^En caso afirmativo, indicar las penalidades conforme al artículo 192/i.test(t)) return "En caso afirmativo, indicar las penalidades conforme al artículo 192 de la LCSP: abandono de embalajes, 300,00 € por pedido afectado; falta de acreditación de reciclaje de envases peligrosos o componentes químicos en diez días, 5 % del importe neto del pedido afectado, con audiencia previa y límites legales aplicables.";
  if (/^En caso afirmativo, especificar las penalidades en caso de que el contratista no remita/i.test(t)) return "En caso afirmativo, especificar las penalidades: No procede.";
  if (/^En caso afirmativo, especificar/i.test(t)) {
    if (/demora/i.test(t)) return "En caso afirmativo, especificar: plazo máximo de entrega de cinco días hábiles; demora imputable: 10,00 € IVA excluido por cada día hábil de retraso y pedido, con máximo acumulado del 50 % del valor neto del pedido afectado.";
    return "En caso afirmativo, especificar: No procede.";
  }
  if (/^En caso afirmativo, indicar/i.test(t)) return "En caso afirmativo, indicar: No procede.";
  if (/^En caso afirmativo, las reglas/i.test(t)) return "En caso afirmativo, las reglas a aplicar serán las siguientes: No procede.";
  return null;
}

export function finalizeFerreteriaPilotPcapAuthorityFields(bytes: Uint8Array): Uint8Array {
  const entries = readOdtZip(bytes);
  const contentIndex = entries.findIndex(entry => entry.name === "content.xml");
  if (contentIndex < 0) throw new Error("ODT inválido: falta content.xml.");
  const content = Buffer.from(entries[contentIndex]!.bytes).toString("utf8");
  const counters = { total: 0 };
  let replacements = 0;
  const updated = content.replace(/<text:p\b[^>]*>[\s\S]*?<\/text:p>/g, paragraph => {
    const replacement = sourceBackedFerreteriaDecision(decode(paragraph), counters);
    if (!replacement) return paragraph;
    const opening = paragraph.match(/^<text:p\b[^>]*>/)?.[0] ?? "<text:p>";
    replacements += 1;
    return `${opening}${esc(replacement)}</text:p>`;
  });
  if (replacements === 0) throw new Error("PCAP Ferretería: el finalizador no ha encontrado decisiones residuales que materializar.");
  const next = entries.map((entry, index) => index === contentIndex ? { ...entry, bytes: Buffer.from(updated, "utf8") } : entry);
  return writeOdtZip(next);
}

export async function renderFerreteriaPilotPcap(input: { record: UniversalEvidenceRecord; templateStore: UniversalEditableTemplateBinaryStore }): Promise<FerreteriaPilotPcapResult> {
  const blockers: string[] = [];
  try {
    if (input.record.caseId !== "CONTR/2026/240267") throw new Error("El renderer final Ferretería LB102 solo puede utilizarse con CONTR/2026/240267.");
    const values = JDA_SUPPLY_ASA_LB34_MAPPING_PROFILE.slots.map(slot => ({ slotId: slot.slotId, value: validated(input.record, slot.fieldKey), sourceFieldKey: slot.fieldKey }));
    const renderer = new UniversalOdtProductionRenderer(input.templateStore, JDA_SUPPLY_ASA_LB95_RENDERER_CONFIGURATION);
    const rendered = await renderer.render({ asset: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET, values });
    const originalStyle = computeOdtStyleFingerprint(readOdtZip(rendered.bytes));
    const bytes = finalizeFerreteriaPilotPcapAuthorityFields(rendered.bytes);
    const finalStyle = computeOdtStyleFingerprint(readOdtZip(bytes));
    if (finalStyle !== originalStyle) throw new Error("PCAP Ferretería: el cierre de decisiones alteró la huella de estilos del modelo oficial.");
    const residual = auditJdaSupplyAsaRenderedOdt(bytes);
    if (!residual.ready) throw new Error(`Auditoría residual PCAP Ferretería: ${residual.blockers.join(" ")}`);
    return {
      ready: true,
      document: {
        kind: "PCAP",
        fileName: "PCAP_CONTR-2026-240267.odt",
        bytes,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        templateId: JDA_SUPPLY_ASA_LB34_EDITABLE_ASSET.templateId,
        renderedStyleFingerprint: finalStyle,
      },
      blockers: [],
      humanValidationRequired: true,
    };
  } catch (error) {
    blockers.push(error instanceof Error ? error.message : String(error));
    return { ready: false, document: null, blockers, humanValidationRequired: true };
  }
}
