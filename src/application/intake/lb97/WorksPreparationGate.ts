export interface WorksPreparationGateInput {
  projectExists: boolean;
  projectApproved: boolean;
  baseTenderBudgetExVatCents: number | null;
  affectsStabilitySafetyOrWatertightness: boolean | null;
  supervisionReportAvailable: boolean;
  replanteoCompleted: boolean;
  terrainAvailabilityAccredited: boolean | null;
  jointProjectAndWorks?: boolean;
}

export interface WorksPreparationGateResult {
  readyForTenderPreparation: boolean;
  supervisionRequired: boolean;
  projectRequiredBeforeWorksExecution: true;
  replanteoRequiredBeforeTenderApproval: true;
  blockers: readonly string[];
  humanValidationRequired: true;
}

/**
 * Gate jurídico LB97 basado en los arts. 231, 235 y 236 LCSP.
 * No presume excepciones ni disponibilidad de terrenos. Para PBL >= 500.000 €
 * sin IVA el informe de supervisión es preceptivo; por debajo también lo es si
 * la obra afecta a estabilidad, seguridad o estanqueidad. En adjudicación
 * conjunta proyecto+obra la ejecución sigue condicionada a supervisión,
 * aprobación y replanteo del proyecto.
 */
export function evaluateWorksPreparationGate(input: WorksPreparationGateInput): WorksPreparationGateResult {
  const blockers: string[] = [];
  const threshold = 50_000_000;
  const supervisionRequired =
    (typeof input.baseTenderBudgetExVatCents === "number" && input.baseTenderBudgetExVatCents >= threshold) ||
    input.affectsStabilitySafetyOrWatertightness === true;

  if (!input.projectExists && !input.jointProjectAndWorks) blockers.push("Falta proyecto de obras previo conforme al artículo 231 LCSP.");
  if (!input.projectApproved && !input.jointProjectAndWorks) blockers.push("Falta aprobación del proyecto antes de la licitación de la obra.");
  if (input.baseTenderBudgetExVatCents === null) blockers.push("Falta PBL sin IVA para determinar la obligatoriedad de supervisión del proyecto.");
  if (input.affectsStabilitySafetyOrWatertightness === null) blockers.push("Debe declararse si la obra afecta a estabilidad, seguridad o estanqueidad para resolver el artículo 235 LCSP.");
  if (supervisionRequired && !input.supervisionReportAvailable) blockers.push("Falta informe preceptivo de supervisión del proyecto conforme al artículo 235 LCSP.");
  if (!input.replanteoCompleted && !input.jointProjectAndWorks) blockers.push("Falta replanteo del proyecto previo a la aprobación del expediente conforme al artículo 236 LCSP.");
  if (input.terrainAvailabilityAccredited === false) blockers.push("No consta disponibilidad de los terrenos precisos para la normal ejecución; deben resolverse las excepciones del artículo 236 LCSP de forma expresa.");
  if (input.terrainAvailabilityAccredited === null) blockers.push("Debe acreditarse o motivarse la disponibilidad de terrenos conforme al artículo 236 LCSP.");

  return {
    readyForTenderPreparation: blockers.length === 0,
    supervisionRequired,
    projectRequiredBeforeWorksExecution: true,
    replanteoRequiredBeforeTenderApproval: true,
    blockers,
    humanValidationRequired: true,
  };
}
