import { JDA_SUPPLY_ASA_EDITABLE_ASSET } from "../lb25/JuntaSupplyAsaOfficialActivation";

export type AnexoICoverageStatus =
  | "PHYSICALLY_BOUND"
  | "PHYSICAL_BINDING_MISSING"
  | "UNIVERSAL_FIELD_MISSING"
  | "COMPOSITE_FORMATTER_REQUIRED"
  | "CONDITIONAL_NOT_APPLICABLE";

export interface AnexoIRequiredField {
  slotId: string;
  sourceSection: string;
  sourceLabel: string;
  sourceEvidence: string;
  targetCaseValue: string;
  universalFieldKey?: string;
  status: AnexoICoverageStatus;
  blocking: boolean;
  note?: string;
}

const physicallyBound = new Set(JDA_SUPPLY_ASA_EDITABLE_ASSET.slotIds);

function covered(
  slotId: string,
  sourceSection: string,
  sourceLabel: string,
  sourceEvidence: string,
  targetCaseValue: string,
  universalFieldKey: string,
): AnexoIRequiredField {
  return {
    slotId,
    sourceSection,
    sourceLabel,
    sourceEvidence,
    targetCaseValue,
    universalFieldKey,
    status: physicallyBound.has(slotId) ? "PHYSICALLY_BOUND" : "PHYSICAL_BINDING_MISSING",
    blocking: !physicallyBound.has(slotId),
  };
}

/**
 * LB26.1 — inventario de cobertura física del Anexo I para el primer caso real
 * CONTR/2026/240267. El inventario se apoya en el ODT oficial de diciembre de
 * 2025 y en el expediente cumplimentado contrastado. No se fuerza una
 * equivalencia cuando el expediente universal no representa todavía el dato con
 * semántica exacta: esos campos quedan bloqueados de forma explícita.
 */
export const CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS: readonly AnexoIRequiredField[] = [
  covered("pcap.anexoI.1.objeto", "1", "Objeto del contrato", "Modelo: Objeto del contrato: _______", "Suministro de materiales y artículos de ferretería para pequeñas reparaciones y reposiciones en los edificios del SAE.", "object"),
  covered("pcap.anexoI.1.cpv", "1", "Código CPV", "Modelo: Código CPV: _______", "44316400-2", "cpvMain"),
  {
    slotId: "pcap.anexoI.1.lugarEntrega", sourceSection: "1", sourceLabel: "Lugar de entrega del suministro",
    sourceEvidence: "Modelo: Lugar de entrega del suministro: _______",
    targetCaseValue: "Instalaciones de los Servicios Centrales del SAE y oficinas anexas en Sevilla, conforme al PPT.",
    universalFieldKey: "technical.executionLocations", status: "PHYSICAL_BINDING_MISSING", blocking: true,
  },
  covered("pcap.anexoI.1A.divisionLotes", "1.A", "División en lotes", "Modelo: División en lotes: Sí/No", "No", "lots.divisionIntoLots"),
  {
    slotId: "pcap.anexoI.1A.justificacionNoDivision", sourceSection: "1.A", sourceLabel: "Justificación de la no división del contrato en lotes",
    sourceEvidence: "Modelo: Justificación de la no división del contrato en lotes: _______",
    targetCaseValue: "La gestión unificada evita dificultades de coordinación y control, mantiene homogénea la calidad del suministro y permite aprovechar economías de escala en gestión, logística y transporte.",
    status: "UNIVERSAL_FIELD_MISSING", blocking: true,
    note: "No debe reutilizarse technicalPurpose ni otro campo aproximado: hace falta evidencia específica de justificación de no división.",
  },
  {
    slotId: "pcap.anexoI.1B.contratoReservado", sourceSection: "1.B", sourceLabel: "Contrato reservado DA 4ª LCSP",
    sourceEvidence: "Modelo: Contrato reservado DA 4ª LCSP: Sí/No", targetCaseValue: "No",
    status: "UNIVERSAL_FIELD_MISSING", blocking: true,
  },
  {
    slotId: "pcap.anexoI.1C.da33", sourceSection: "1.C", sourceLabel: "Contrato en función de las necesidades (DA 33ª LCSP)",
    sourceEvidence: "Modelo: CONTRATO EN FUNCIÓN DE LAS NECESIDADES (DA 33ª LCSP): Sí/No", targetCaseValue: "Sí",
    status: "UNIVERSAL_FIELD_MISSING", blocking: true,
    note: "La existencia de maximumApprovedBudgetCents no equivale por sí sola a una decisión jurídica DA 33ª validada.",
  },
  {
    slotId: "pcap.anexoI.2A.pblExVat", sourceSection: "2.A", sourceLabel: "Importe total (IVA excluido)",
    sourceEvidence: "Modelo: Importe total (IVA excluido): _______ euros.", targetCaseValue: "10.552,44 €",
    universalFieldKey: "baseTenderBudgetCents", status: "PHYSICALLY_BOUND", blocking: false,
  },
  {
    slotId: "pcap.anexoI.2A.iva", sourceSection: "2.A", sourceLabel: "Importe del IVA",
    sourceEvidence: "Modelo: Importe del IVA: _______ euros.", targetCaseValue: "2.216,01 €",
    universalFieldKey: "economic.vatPercent", status: "COMPOSITE_FORMATTER_REQUIRED", blocking: true,
    note: "El importe del IVA debe derivarse únicamente de PBL inicial y porcentaje IVA ya validados; no se representa como campo monetario independiente.",
  },
  {
    slotId: "pcap.anexoI.2A.pblIncVat", sourceSection: "2.A", sourceLabel: "Importe total (IVA incluido)",
    sourceEvidence: "Modelo: Importe total (IVA incluido): _______ euros.", targetCaseValue: "12.768,45 €",
    universalFieldKey: "baseTenderBudgetCents + economic.vatPercent", status: "COMPOSITE_FORMATTER_REQUIRED", blocking: true,
  },
  {
    slotId: "pcap.anexoI.2A.anualidades", sourceSection: "2.A", sourceLabel: "Anualidades (IVA incluido)",
    sourceEvidence: "Modelo: tabla Año / Importe / Partida Presupuestaria",
    targetCaseValue: "2026: 1.596,06 €; 2027: 6.384,23 €; 2028: 4.788,16 €; partida 1439010000 G/32L/22000/00 01",
    universalFieldKey: "economic.annualities + economic.budgetApplication", status: "COMPOSITE_FORMATTER_REQUIRED", blocking: true,
  },
  covered("pcap.anexoI.2.valorEstimado", "2.B", "Valor estimado del contrato", "Modelo: Valor estimado del contrato: _______ euros.", "21.793,15 € sin IVA", "economic.legalEstimatedValueCents"),
  {
    slotId: "pcap.anexoI.2B.metodoCalculo", sourceSection: "2.B", sourceLabel: "Método de cálculo",
    sourceEvidence: "Modelo: Método de cálculo: _______",
    targetCaseValue: "Presupuesto máximo DA 33.ª para toda la vigencia 18.160,96 € sin IVA, más modificación prevista máxima del 20 %, resultando 21.793,15 € sin IVA.",
    status: "UNIVERSAL_FIELD_MISSING", blocking: true,
  },
  {
    slotId: "pcap.anexoI.2C.sistemaPrecio", sourceSection: "2.C", sourceLabel: "Sistema de determinación del precio",
    sourceEvidence: "Modelo: Sistema de determinación del precio: _______",
    targetCaseValue: "Precios unitarios por referencia del catálogo validado de 98 artículos.",
    universalFieldKey: "economic.unitPrices", status: "COMPOSITE_FORMATTER_REQUIRED", blocking: true,
    note: "La lista de precios unitarios no debe convertirse sin más en la declaración jurídica del sistema de determinación del precio.",
  },
  {
    slotId: "pcap.anexoI.2C.revisionPrecios", sourceSection: "2.C", sourceLabel: "Revisión de precios",
    sourceEvidence: "Modelo: Revisión de precios ... Sí/No; Fórmula: _______", targetCaseValue: "No; fórmula: No procede",
    universalFieldKey: "economic.priceRevisionRegime", status: "PHYSICAL_BINDING_MISSING", blocking: true,
  },
  covered("pcap.anexoI.3.duracion", "3", "Plazo total (en meses)", "Modelo: Plazo total (en meses): _______", "24", "durationMonths"),
  {
    slotId: "pcap.anexoI.3.posibilidadProrroga", sourceSection: "3", sourceLabel: "Posibilidad de prórroga",
    sourceEvidence: "Modelo: Posibilidad de prórroga: Sí/No", targetCaseValue: "Sí",
    universalFieldKey: "extensionMonths", status: "COMPOSITE_FORMATTER_REQUIRED", blocking: true,
    note: "extensionMonths permite conocer duración, pero el Sí/No debe derivarse de manera explícita y auditada.",
  },
  covered("pcap.anexoI.3.prorrogas", "3", "Duración de la prórroga", "Modelo: Duración de la prórroga: _______", "Hasta dos prórrogas de 12 meses cada una, máximo acumulado 24 meses.", "extensionMonths"),
  {
    slotId: "pcap.anexoI.3.preavisoProrroga", sourceSection: "3", sourceLabel: "Plazo de preaviso de la prórroga",
    sourceEvidence: "Modelo: Plazo de preaviso de la prórroga: _______", targetCaseValue: "2 meses",
    status: "UNIVERSAL_FIELD_MISSING", blocking: true,
  },
  {
    slotId: "pcap.anexoI.5.procedimiento", sourceSection: "5", sourceLabel: "Procedimiento de adjudicación",
    sourceEvidence: "Caso validado: Abierto simplificado abreviado", targetCaseValue: "Abierto simplificado abreviado",
    universalFieldKey: "procedure", status: "PHYSICAL_BINDING_MISSING", blocking: true,
  },
  {
    slotId: "pcap.anexoI.5.tramitacion", sourceSection: "5", sourceLabel: "Tramitación del expediente",
    sourceEvidence: "Caso validado: Ordinaria", targetCaseValue: "Ordinaria",
    universalFieldKey: "processing.processingType", status: "PHYSICAL_BINDING_MISSING", blocking: true,
  },
  covered("pcap.anexoI.7.criterios", "7", "Único criterio de adjudicación relacionado con los costes", "Modelo: Único criterio ... Sí/No", "Sí; precio 100 puntos y evaluable por fórmula", "criteria.awardCriteria"),
  covered("pcap.anexoI.8.condicionesEspeciales", "8.A", "Condición especial de ejecución de tipo ambiental o social", "Modelo: condición obligatoria: _______", "Gestión y retirada de embalajes y residuos vinculados directamente a las entregas.", "execution.specialExecutionConditions"),
  {
    slotId: "pcap.anexoI.14.modificacionPrevista", sourceSection: "14", sourceLabel: "Posibilidad y causas de modificación prevista",
    sourceEvidence: "Caso validado: modificación por mayores necesidades reales DA 33.ª, máximo 20 %, sin nuevos artículos ni nuevos precios unitarios.",
    targetCaseValue: "Sí; máximo 20 %; aumento exclusivo de unidades de artículos existentes manteniendo precios unitarios adjudicados.",
    universalFieldKey: "modificationPercent", status: "COMPOSITE_FORMATTER_REQUIRED", blocking: true,
    note: "El porcentaje por sí solo no contiene la causa, alcance y límites exigidos por el apartado 14.",
  },
] as const;

export interface AnexoICoverageEvaluation {
  readyForFullPhysicalRendering: boolean;
  total: number;
  physicallyBound: number;
  blockers: readonly AnexoIRequiredField[];
}

export function evaluateContr2026240267AnexoICoverage(): AnexoICoverageEvaluation {
  const blockers = CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.filter(field => field.blocking);
  return {
    readyForFullPhysicalRendering: blockers.length === 0,
    total: CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.length,
    physicallyBound: CONTR_2026_240267_ANEXO_I_REQUIRED_FIELDS.filter(field => field.status === "PHYSICALLY_BOUND").length,
    blockers,
  };
}
