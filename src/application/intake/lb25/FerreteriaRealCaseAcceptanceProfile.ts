export interface FerreteriaRealCaseCandidate {
  caseId: string;
  contractType: "SUPPLY" | "SERVICE" | "WORKS" | "CONCESSION" | "MIXED" | "OTHER";
  procedure: string;
  cpv: string;
  divisionIntoLots: boolean;
  noLotJustificationPresent: boolean;
  needsBasedContractDa33: boolean;
  maximumBudgetCents: number;
  budgetCoversEntireContractLife: boolean;
  initialPblExVatCents: number;
  initialVatCents: number;
  initialPblVatIncludedCents: number;
  legalEstimatedValueCents: number;
  modificationPercent: number;
  durationMonths: number;
  extensionMonths: number;
  priceDetermination: "UNIT_PRICES" | "LUMP_SUM" | "OTHER";
  catalogReferenceCount: number;
  priceOnlyCriterion: boolean;
  priceWeightPercent: number;
  priceEvaluableByFormula: boolean;
  singleCriterionSpecialMotivationPresent: boolean;
  plannedModificationCause: "REAL_NEEDS_ABOVE_ESTIMATES_DA33" | "OTHER" | "NONE";
  includesIndeterminateNewArticlesModificationCause: boolean;
}

export interface FerreteriaRealCaseAcceptanceResult {
  ready: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
}

/**
 * LB25 - perfil de aceptación del primer expediente real CONTR/2026/240267.
 *
 * Esta función no infiere hechos ni corrige el expediente. Contrasta un candidato
 * con los hechos que constan en el PCAP V7 y con las observaciones del informe
 * AJ-SAE 2026/16. Su finalidad es impedir que una salida técnicamente válida se
 * acepte si altera la semántica económica/jurídica del caso real.
 */
export function evaluateFerreteriaRealCaseAcceptance(
  candidate: FerreteriaRealCaseCandidate,
): FerreteriaRealCaseAcceptanceResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (candidate.caseId !== "CONTR/2026/240267") blockers.push("El caso de aceptación debe ser CONTR/2026/240267.");
  if (candidate.contractType !== "SUPPLY") blockers.push("El expediente real es un contrato de suministro; no se promociona otra tipología por referencias léxicas aisladas.");
  if (!/abierto\s+simplificado\s+abreviado/i.test(candidate.procedure)) blockers.push("El procedimiento del caso real debe conservarse como abierto simplificado abreviado.");
  if (candidate.cpv !== "44316400-2") blockers.push("El CPV principal debe ser 44316400-2.");

  if (candidate.divisionIntoLots) blockers.push("El PCAP real declara expresamente que no existe división en lotes.");
  if (!candidate.noLotJustificationPresent) blockers.push("La no división en lotes necesita conservar su justificación expresa del expediente real.");
  if (!candidate.needsBasedContractDa33) blockers.push("El expediente debe conservar su configuración como contrato en función de las necesidades conforme a la DA 33.ª LCSP.");

  if (candidate.maximumBudgetCents !== 1_816_096) blockers.push("El presupuesto máximo DA 33.ª para toda la vigencia debe ser 18.160,96 € sin IVA.");
  if (!candidate.budgetCoversEntireContractLife) blockers.push("El presupuesto máximo DA 33.ª debe regir toda la vigencia, incluidas las prórrogas, sin incrementarse automáticamente al activarlas.");
  if (candidate.initialPblExVatCents !== 1_055_244) blockers.push("El PBL de la duración inicial debe ser 10.552,44 € sin IVA.");
  if (candidate.initialVatCents !== 221_601) blockers.push("El IVA del PBL inicial debe ser 2.216,01 €.");
  if (candidate.initialPblVatIncludedCents !== 1_276_845) blockers.push("El PBL inicial IVA incluido debe ser 12.768,45 €.");
  if (candidate.legalEstimatedValueCents !== 2_179_315) blockers.push("El valor estimado debe ser 21.793,15 € sin IVA.");
  if (candidate.modificationPercent !== 20) blockers.push("La modificación prevista máxima del caso real es del 20 %.");

  if (candidate.durationMonths !== 24) blockers.push("La duración inicial validada es de 24 meses.");
  if (candidate.extensionMonths !== 24) blockers.push("La suma máxima de prórrogas validada es de 24 meses.");
  if (candidate.priceDetermination !== "UNIT_PRICES") blockers.push("El sistema de determinación del precio debe conservarse como precios unitarios.");
  if (candidate.catalogReferenceCount !== 98) blockers.push("El catálogo técnico del caso real contiene 98 referencias.");

  if (!candidate.priceOnlyCriterion || candidate.priceWeightPercent !== 100 || !candidate.priceEvaluableByFormula) {
    blockers.push("El caso real utiliza precio como único criterio, ponderado al 100 % y evaluable mediante fórmula.");
  }
  if (!candidate.singleCriterionSpecialMotivationPresent) blockers.push("El criterio único precio requiere conservar la motivación específica exigida en el informe jurídico del expediente.");

  if (candidate.plannedModificationCause !== "REAL_NEEDS_ABOVE_ESTIMATES_DA33") {
    blockers.push("La modificación prevista debe limitarse a mayores necesidades reales respecto de las inicialmente estimadas, en el marco de la DA 33.ª.");
  }
  if (candidate.includesIndeterminateNewArticlesModificationCause) {
    blockers.push("No puede reintroducirse como causa prevista la incorporación indeterminada de artículos no contemplados sin precio unitario, rechazada por AJ-SAE 2026/16.");
  }

  warnings.push("AJ-SAE 2026/16 contiene una referencia aislada a 'contrato de servicios'; no se usa para alterar la tipología porque el objeto, el modelo y el expediente son de suministro.");
  warnings.push("Esta aceptación comprueba paridad factual/jurídica del caso, no sustituye la comparación visual del ODT generado ni la validación humana final.");

  return { ready: blockers.length === 0, blockers, warnings };
}

export const FERRETERIA_REAL_CASE_EXPECTED: FerreteriaRealCaseCandidate = {
  caseId: "CONTR/2026/240267",
  contractType: "SUPPLY",
  procedure: "ABIERTO SIMPLIFICADO ABREVIADO",
  cpv: "44316400-2",
  divisionIntoLots: false,
  noLotJustificationPresent: true,
  needsBasedContractDa33: true,
  maximumBudgetCents: 1_816_096,
  budgetCoversEntireContractLife: true,
  initialPblExVatCents: 1_055_244,
  initialVatCents: 221_601,
  initialPblVatIncludedCents: 1_276_845,
  legalEstimatedValueCents: 2_179_315,
  modificationPercent: 20,
  durationMonths: 24,
  extensionMonths: 24,
  priceDetermination: "UNIT_PRICES",
  catalogReferenceCount: 98,
  priceOnlyCriterion: true,
  priceWeightPercent: 100,
  priceEvaluableByFormula: true,
  singleCriterionSpecialMotivationPresent: true,
  plannedModificationCause: "REAL_NEEDS_ABOVE_ESTIMATES_DA33",
  includesIndeterminateNewArticlesModificationCause: false,
};
