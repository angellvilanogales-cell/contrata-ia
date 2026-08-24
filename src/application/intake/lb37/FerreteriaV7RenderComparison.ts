export type FerreteriaV7ComparisonStatus = "MATCH" | "BLOCKING_DIFFERENCE" | "REVIEW_REQUIRED";

export interface FerreteriaV7ComparisonFinding {
  id: string;
  status: FerreteriaV7ComparisonStatus;
  sourceArea: string;
  referenceV7: string;
  secondRender: string;
  requiredAction: string;
}

/**
 * LB37 — comparación semántica/visual del segundo render frente al PCAP V7 del
 * expediente CONTR/2026/240267.
 *
 * La matriz se limita a diferencias observadas y respaldadas por las fuentes del
 * caso. No convierte diferencias de paginación aisladas en errores jurídicos, pero
 * impide la aceptación final mientras falten contenidos que el V7 materializa.
 */
export const FERRETERIA_V7_SECOND_RENDER_FINDINGS: readonly FerreteriaV7ComparisonFinding[] = [
  {
    id: "front-matter-case-identification",
    status: "BLOCKING_DIFFERENCE",
    sourceArea: "Portada / ficha inicial del PCAP",
    referenceV7: "Expediente, título, localidad de entrega, NUTS ES618, CPV 44316400-2 y órgano/imagen institucional del Servicio Andaluz de Empleo aparecen materializados.",
    secondRender: "La portada del modelo oficial conserva vacíos los datos de expediente/título/localidad/NUTS/CPV y mantiene la cabecera institucional genérica del modelo.",
    requiredAction: "Parametrizar la ficha inicial del PCAP con los datos del expediente y el órgano promotor, sin alterar los estilos administrativos del modelo.",
  },
  {
    id: "anexo-i-98-reference-table",
    status: "BLOCKING_DIFFERENCE",
    sourceArea: "Anexo I / 1. Especificaciones del objeto",
    referenceV7: "La tabla contiene las 98 referencias de ferretería con unidades estimadas e importe/precio de referencia correspondiente.",
    secondRender: "La tabla solo conserva el encabezado y un resumen/total; no materializa las 98 filas del expediente.",
    requiredAction: "Renderizar estructuralmente las 98 filas source-declared dentro de la tabla ODF del Anexo I, preservando estilos, anchos y saltos de página.",
  },
  {
    id: "anexo-v-economic-proposal-98-reference-table",
    status: "BLOCKING_DIFFERENCE",
    sourceArea: "Anexo V / Modelo de proposición económica",
    referenceV7: "El modelo de oferta incorpora la relación de 98 artículos, cantidades estimadas y coste unitario máximo sin IVA, dejando las columnas de oferta para la persona licitadora.",
    secondRender: "Conserva el modelo genérico sin la relación completa del expediente y con campos de identificación sin propagar.",
    requiredAction: "Construir la tabla ODF de proposición económica desde la misma fuente canónica de 98 referencias y precios máximos usada por el expediente, dejando editables únicamente las columnas del licitador.",
  },
  {
    id: "annex-case-identifiers",
    status: "BLOCKING_DIFFERENCE",
    sourceArea: "Anexos II-XIII",
    referenceV7: "Los anexos del expediente propagan CONTR/2026/240267 y el título contractual en sus cabeceras cuando el modelo lo prevé.",
    secondRender: "Los anexos posteriores al Anexo I conservan EXPEDIENTE y TÍTULO en blanco.",
    requiredAction: "Propagar de forma controlada expediente y título a todos los anexos del modelo que contienen esos campos, sin rellenar datos que correspondan al licitador/adjudicatario.",
  },
  {
    id: "anexo-i-core-economic-administrative-data",
    status: "MATCH",
    sourceArea: "Anexo I / datos económicos y administrativos ya parametrizados",
    referenceV7: "PBL 10.552,44 €, IVA 2.216,01 €, total 12.768,45 €, anualidades, tramitación ordinaria y demás decisiones source-backed.",
    secondRender: "Los valores principales contrastados ya están materializados y la auditoría residual LB35 no detecta decisiones administrativas pendientes dentro de su ámbito.",
    requiredAction: "Mantener estos valores sin regresión en el siguiente render.",
  },
  {
    id: "modification-section-14",
    status: "MATCH",
    sourceArea: "Anexo I / 14. Modificaciones",
    referenceV7: "Estabilidad presupuestaria como reducción máxima del 20 % y DA 33.ª como incremento máximo del 20 % por mayores necesidades, sin nuevos artículos ni nuevos precios unitarios.",
    secondRender: "La decisión jurídica LB34 ya se materializa con direcciones y límites separados.",
    requiredAction: "Mantener el perfil jurídico validado y bloquear cualquier conversión en un 40 % acumulable.",
  },
  {
    id: "pagination-and-visual-parity",
    status: "REVIEW_REQUIRED",
    sourceArea: "Documento completo",
    referenceV7: "El PDF V7 de referencia consta de 83 páginas y presenta una maquetación final cerrada del expediente.",
    secondRender: "La exportación local del segundo ODT produce una paginación distinta; la mera diferencia de páginas no acredita por sí sola un error, pero revela que todavía no hay paridad visual completa.",
    requiredAction: "Repetir comparación visual página a página después de incorporar tablas y cabeceras; aceptar diferencias solo si no alteran estructura, legibilidad ni identidad administrativa.",
  },
] as const;

export function evaluateFerreteriaV7SecondRenderComparison() {
  const blockers = FERRETERIA_V7_SECOND_RENDER_FINDINGS.filter(item => item.status === "BLOCKING_DIFFERENCE");
  const reviews = FERRETERIA_V7_SECOND_RENDER_FINDINGS.filter(item => item.status === "REVIEW_REQUIRED");
  return {
    caseId: "CONTR/2026/240267",
    referenceDocument: "05_PCAP_suministro_abierto_simplificado_abreviado_autofinanciada (ferretería) V7_letrado.pdf",
    readyForHumanFinalAcceptance: blockers.length === 0 && reviews.length === 0,
    blockingDifferenceCount: blockers.length,
    reviewRequiredCount: reviews.length,
    blockers,
    reviews,
  } as const;
}
