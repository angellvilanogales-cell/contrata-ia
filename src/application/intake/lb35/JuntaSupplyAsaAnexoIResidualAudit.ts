import { readOdtZip } from "../lb23/OdtPackageCodec";

export type AnexoIResidualSeverity = "BLOCKING" | "NON_BLOCKING";

export interface AnexoIResidualFinding {
  id: string;
  severity: AnexoIResidualSeverity;
  line: string;
  reason: string;
}

export interface AnexoIResidualAuditResult {
  ready: boolean;
  findings: readonly AnexoIResidualFinding[];
  blockers: readonly string[];
  auditedLineCount: number;
}

/**
 * LB35 — auditoría posterior al primer render real.
 *
 * La huella de estilos y la aplicación exacta de los slots registrados son
 * necesarias, pero no suficientes: un Anexo I puede conservar el ODT oficial y
 * seguir conteniendo decisiones del órgano de contratación sin cumplimentar.
 * Esta auditoría se limita al Anexo I. No inspecciona los Anexos II-XIII, cuyos
 * blancos pertenecen en gran parte a formularios que debe cumplimentar la
 * persona licitadora/adjudicataria.
 */
const AUTHORITY_FIELD_PREFIXES: readonly RegExp[] = [
  /^Especificaciones del objeto del contrato/i,
  /^Total:/i,
  /^Descripción de los lotes/i,
  /^LOTE\s+\d+/i,
  /^Número máximo de lotes/i,
  /^Oferta integradora/i,
  /^Régimen jurídico específico/i,
  /^Fórmula de revisión/i,
  /^Variación de precios/i,
  /^Pago mediante entrega/i,
  /^Incremento.*10\s*%/i,
  /^Plazos parciales/i,
  /^Órgano de contratación/i,
  /^Respuestas vinculantes/i,
  /^Constitución de mesa/i,
  /^Posibilidad de variantes/i,
  /^En caso afirmativo, indicar/i,
  /^En caso de renuncia/i,
  /^En caso de desistimiento/i,
  /^Organismos de los que/i,
  /^Se exige habilitación empresarial/i,
  /^En caso afirmativo, especificar/i,
  /^Otros requisitos necesarios.*ENS/i,
  /^Criterios de adjudicación/i,
  /^Parámetros objetivos.*anormal/i,
  /^Criterios de desempate/i,
  /^Penalidades/i,
  /^Subcontratación/i,
  /^Periodicidad del pago/i,
  /^Datos a incluir en la factura/i,
  /^Plazo de garantía/i,
  /^Programa de trabajo/i,
  /^Información a la que se le atribuye carácter confidencial/i,
  /^Plazo durante el que.*confidencialidad/i,
  /^Obligación de tener suscrito seguro/i,
  /^En su caso, términos del seguro/i,
  /^Cesión del contrato/i,
  /^En el supuesto de suspensión/i,
  /^En caso afirmativo, las reglas/i,
  /^La ejecución del contrato requiere el tratamiento/i,
];

const GENERIC_UNRESOLVED = /(?:Sí\s*\/\s*No|_{3,})/i;

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function odtContentXmlToText(contentXml: string): string {
  return decodeXmlEntities(
    contentXml
      .replace(/<text:tab\s*\/>/g, "\t")
      .replace(/<text:s(?:\s+text:c="(\d+)")?\s*\/>/g, (_match, count: string | undefined) => " ".repeat(Number(count ?? 1)))
      .replace(/<text:line-break\s*\/>/g, "\n")
      .replace(/<\/text:p>/g, "\n")
      .replace(/<\/table:table-row>/g, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n");
}

export function extractContractingAuthorityAnexoIText(contentXml: string): string {
  const text = odtContentXmlToText(contentXml);
  const starts = [...text.matchAll(/ANEXO I\s*\n\s*CARACTERÍSTICAS DEL CONTRATO/gi)].map(match => match.index ?? -1).filter(index => index >= 0);
  if (starts.length === 0) throw new Error("No se ha localizado el ANEXO I - CARACTERÍSTICAS DEL CONTRATO en el ODT renderizado.");

  // El modelo puede mencionar ANEXO I en portada/índice. El último encabezado
  // completo antes de ANEXO II es el formulario real a cumplimentar.
  const start = starts[starts.length - 1] ?? 0;
  const afterStart = text.slice(start);
  const endMatch = /\n\s*ANEXO II\b/i.exec(afterStart);
  if (!endMatch || endMatch.index <= 0) throw new Error("No se ha localizado el final del ANEXO I antes del ANEXO II.");
  return afterStart.slice(0, endMatch.index);
}

function isAuthorityField(line: string): boolean {
  return AUTHORITY_FIELD_PREFIXES.some(pattern => pattern.test(line));
}

function isUnresolved(line: string): boolean {
  if (GENERIC_UNRESOLVED.test(line)) return true;
  const colon = line.indexOf(":");
  return colon >= 0 && line.slice(colon + 1).trim().length === 0;
}

export function auditJdaSupplyAsaAnexoIText(anexoIText: string): AnexoIResidualAuditResult {
  const lines = anexoIText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const findings: AnexoIResidualFinding[] = [];

  for (const line of lines) {
    if (!isAuthorityField(line) || !isUnresolved(line)) continue;
    findings.push({
      id: `anexo-i-residual-${findings.length + 1}`,
      severity: "BLOCKING",
      line,
      reason: "Campo del órgano de contratación sin decisión materializada (placeholder, Sí/No o valor vacío).",
    });
  }

  return {
    ready: findings.length === 0,
    findings,
    blockers: findings.map(item => `${item.line} — ${item.reason}`),
    auditedLineCount: lines.length,
  };
}

export function auditJdaSupplyAsaRenderedOdt(bytes: Uint8Array): AnexoIResidualAuditResult {
  const entries = readOdtZip(bytes);
  const content = entries.find(entry => entry.name === "content.xml");
  if (!content) throw new Error("ODT inválido: falta content.xml para auditoría del Anexo I.");
  const contentXml = Buffer.from(content.bytes).toString("utf8");
  return auditJdaSupplyAsaAnexoIText(extractContractingAuthorityAnexoIText(contentXml));
}

export const FERRETERIA_FIRST_REAL_RENDER_AUDIT = {
  caseId: "CONTR/2026/240267",
  status: "REQUIRES_SECOND_RENDER",
  finding: "El primer render real preserva el modelo oficial y el apartado 14, pero conserva decisiones del órgano de contratación sin cumplimentar en el Anexo I.",
  rule: "STYLE_AND_REGISTERED_SLOTS_ARE_NECESSARY_BUT_NOT_SUFFICIENT",
} as const;
