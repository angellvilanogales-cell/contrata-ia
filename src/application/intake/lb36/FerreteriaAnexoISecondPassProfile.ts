export type FerreteriaSecondPassDecisionStatus = "SOURCE_CONFIRMED" | "CONDITIONAL_NOT_APPLICABLE";

export interface FerreteriaSecondPassDecision {
  id: string;
  section: string;
  target: string;
  value: string;
  status: FerreteriaSecondPassDecisionStatus;
  source: "PCAP_V7_LETRADO" | "OFFICIAL_MODEL";
}

/**
 * LB36 — segunda pasada del Anexo I de CONTR/2026/240267.
 *
 * Este perfil no inventa decisiones para hacer desaparecer placeholders. Solo
 * contiene valores que constan en el PCAP V7 del expediente o, cuando el V7
 * deja un condicional sin contenido porque la respuesta principal es negativa,
 * materializa «No procede». La finalidad es separar la decisión administrativa
 * de su posterior binding físico al ODT oficial.
 */
export const FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE: readonly FerreteriaSecondPassDecision[] = [
  { id: "object-specification", section: "1", target: "Especificaciones del objeto", value: "Relación de 98 referencias del expediente, con precios unitarios y consumos estimados.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "lots-description", section: "1.A", target: "Descripción de lotes", value: "No procede.", status: "CONDITIONAL_NOT_APPLICABLE", source: "PCAP_V7_LETRADO" },
  { id: "lots-justification", section: "1.A", target: "Justificación de no división", value: "Gestión unificada por coordinación y control del suministro, homogeneidad de calidad y economías de escala en gestión, logística y transporte.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "lots-offer-limit", section: "1.A", target: "Limitación de presentación", value: "No procede.", status: "CONDITIONAL_NOT_APPLICABLE", source: "PCAP_V7_LETRADO" },
  { id: "lots-award-limit", section: "1.A", target: "Limitación de adjudicación", value: "No procede.", status: "CONDITIONAL_NOT_APPLICABLE", source: "PCAP_V7_LETRADO" },
  { id: "integrative-offer", section: "1.A", target: "Oferta integradora", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "specific-legal-regime", section: "1.D", target: "Régimen jurídico específico", value: "No procede.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "pbl-breakdown-direct", section: "2.A", target: "Costes directos", value: "8.019,85 € (76,00 %)", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "pbl-breakdown-indirect-profit", section: "2.A", target: "Costes indirectos y beneficio industrial", value: "1.899,44 € (18,00 %) + 633,15 € (6,00 %)", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "price-review-formula", section: "2.C", target: "Fórmula de revisión", value: "No procede.", status: "CONDITIONAL_NOT_APPLICABLE", source: "PCAP_V7_LETRADO" },
  { id: "price-variation", section: "2.C", target: "Variación de precios", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "goods-as-payment", section: "2.C", target: "Entrega de otros bienes como pago", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "ten-percent-unit-increase", section: "2.C", target: "Incremento de unidades hasta 10 %", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "partial-deadlines", section: "3", target: "Plazos parciales", value: "No procede.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "contracting-authority", section: "4", target: "Órgano de contratación", value: "Dirección Gerencia del Servicio Andaluz de Empleo", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "binding-clarifications", section: "4", target: "Respuestas vinculantes", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "procurement-board", section: "5", target: "Mesa de contratación", value: "Sí.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "variants", section: "5", target: "Variantes", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "withdrawal-compensation", section: "5", target: "Compensación por renuncia", value: "100 euros, previa justificación de los gastos ocasionados.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "desistance-compensation", section: "5", target: "Compensación por desistimiento", value: "100 euros, previa justificación de los gastos ocasionados.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "article-129-organisms", section: "5", target: "Organismos art. 129.1 LCSP", value: "No procede.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "professional-authorisation", section: "6", target: "Habilitación empresarial o profesional", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "ens", section: "6", target: "Requisitos ENS", value: "No procede.", status: "CONDITIONAL_NOT_APPLICABLE", source: "PCAP_V7_LETRADO" },
  { id: "organisation-requirements", section: "6", target: "Organización/destino de beneficios/financiación", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "award-criterion", section: "7.A", target: "Criterio 1", value: "Proposición económica: precio, 100 puntos.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "award-extra-criteria", section: "7.A", target: "Criterios 2 y 3", value: "No procede.", status: "CONDITIONAL_NOT_APPLICABLE", source: "PCAP_V7_LETRADO" },
  { id: "abnormal-offers", section: "7.B", target: "Parámetros objetivos", value: "Artículo 85 RGLCAP, de conformidad con el artículo 149.2 LCSP.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "special-condition-penalties", section: "8.B", target: "Penalidades condiciones especiales", value: "Sí: 300,00 € por pedido afectado por abandono de embalajes; 5 % del importe neto del pedido por falta de acreditación de reciclaje en los supuestos definidos.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "critical-subcontracting", section: "9", target: "Tareas críticas de ejecución directa", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "direct-subcontractor-payments", section: "9", target: "Pagos directos a subcontratistas", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "delay-penalty", section: "10", target: "Penalidad por demora", value: "Sí: 10,00 € IVA excluido por día hábil de retraso y pedido; máximo acumulado del 50 % del valor neto del pedido afectado.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "defective-performance-penalty", section: "10", target: "Cumplimiento defectuoso", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "partial-performance-penalty", section: "10", target: "Incumplimiento parcial", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "environmental-social-penalty", section: "10", target: "Obligaciones medioambientales/sociales/laborales", value: "Sí; remisión al régimen específico del apartado 8.B.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "payment-regime", section: "11", target: "Régimen de abono", value: "Pagos parciales en función de pedidos realizados y conformados.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "conformity-deadline", section: "11", target: "Plazo de conformidad", value: "Máximo 30 días naturales desde la entrega y recepción material.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "invoice-dir3", section: "11", target: "DIR3", value: "Órgano gestor SAE A01004615; unidad tramitadora SAE A01004615; oficina contable Intervención General A01004456.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "preparatory-advance-payments", section: "11", target: "Abonos a cuenta de operaciones preparatorias", value: "No procede.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "warranty", section: "12", target: "Plazo de garantía", value: "3 años para bienes duraderos; para fungibles/consumibles, perfecto estado, ausencia de defectos ocultos en la entrega y respeto de la caducidad del fabricante.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "work-programme", section: "12", target: "Programa de trabajo", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "confidentiality-info", section: "12", target: "Información confidencial", value: "La empresa contratista no tendrá acceso a información de carácter confidencial por razón del objeto.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "confidentiality-term", section: "12", target: "Plazo de confidencialidad", value: "5 años.", status: "SOURCE_CONFIRMED", source: "OFFICIAL_MODEL" },
  { id: "insurance", section: "12", target: "Seguro específico", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "assignment", section: "12", target: "Cesión", value: "Sí, conforme al apartado 15 del PCAP.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "suspension-special-rules", section: "13", target: "Reglas especiales de suspensión", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
  { id: "personal-data-treatment", section: "15", target: "Tratamiento de datos por cuenta del responsable", value: "No.", status: "SOURCE_CONFIRMED", source: "PCAP_V7_LETRADO" },
] as const;

export function evaluateFerreteriaAnexoISecondPassProfile() {
  const ids = new Set<string>();
  const invalid: string[] = [];
  for (const decision of FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE) {
    if (ids.has(decision.id)) invalid.push(`ID duplicado: ${decision.id}`);
    ids.add(decision.id);
    if (!decision.value.trim()) invalid.push(`Valor vacío: ${decision.id}`);
    if (decision.value.includes("_______") || /Sí\s*\/\s*No/i.test(decision.value)) invalid.push(`Decisión no resuelta: ${decision.id}`);
  }
  return {
    readyForPhysicalMaterialization: invalid.length === 0,
    decisionCount: FERRETERIA_ANEXO_I_SECOND_PASS_PROFILE.length,
    blockers: invalid,
    sourceIds: ["05_PCAP_suministro_abierto_simplificado_abreviado_autofinanciada (ferretería) V7_letrado.pdf", "JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17"],
  } as const;
}
