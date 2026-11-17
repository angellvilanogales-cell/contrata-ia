import type { WorksPreparationGateResult } from "../lb97/WorksPreparationGate";
import type { WorksProjectContentResult } from "../lb97/WorksProjectContentGate";

export interface WorksConcessionPreparationInput {
  viabilityStudyApproved: boolean;
  viabilityContentComplete: boolean;
  administrationFullyDefinesWorks: boolean | null;
  anteprojectRequired: boolean | null;
  anteprojectAvailable: boolean;
  anteprojectApproved: boolean;
  anteprojectPublicInformationCompleted: boolean;
  projectAvailable: boolean;
  projectContent: WorksProjectContentResult | null;
  worksPreparation: WorksPreparationGateResult | null;
  financialEvaluationOfficeReportApplicable: boolean | null;
  financialEvaluationOfficeReportAvailable: boolean;
}

export interface WorksConcessionPreparationResult {
  ready: boolean;
  anteprojectLayerReady: boolean;
  projectLayerReady: boolean;
  financialEvaluationLayerReady: boolean;
  blockers: readonly string[];
  legalBasis: readonly string[];
  humanValidationRequired: true;
}

/**
 * Gate de preparación para concesión de obras. No reutiliza un PCAP Works ordinario
 * como concesional: solo comparte controles técnicos de proyecto cuando el art. 249
 * activa esa vía. La decisión sobre necesidad de anteproyecto/informe financiero no
 * se infiere si la evidencia no la resuelve expresamente.
 */
export function evaluateWorksConcessionPreparation(input: WorksConcessionPreparationInput): WorksConcessionPreparationResult {
  const blockers: string[] = [];
  if (!input.viabilityStudyApproved) blockers.push("Falta estudio de viabilidad aprobado de la concesión de obras (art. 247 LCSP).");
  if (!input.viabilityContentComplete) blockers.push("El estudio de viabilidad no acredita todavía su contenido material exigible.");

  if (input.anteprojectRequired === null) blockers.push("Debe resolverse expresamente si procede anteproyecto de construcción y explotación conforme al artículo 248 LCSP.");
  if (input.anteprojectRequired === true) {
    if (!input.anteprojectAvailable) blockers.push("Falta anteproyecto de construcción y explotación cuando resulta exigible.");
    if (!input.anteprojectPublicInformationCompleted) blockers.push("Falta información pública del anteproyecto en los términos del artículo 248 LCSP.");
    if (!input.anteprojectApproved) blockers.push("Falta aprobación del anteproyecto de construcción y explotación.");
  }
  const anteprojectLayerReady = input.anteprojectRequired === false || (input.anteprojectRequired === true && input.anteprojectAvailable && input.anteprojectPublicInformationCompleted && input.anteprojectApproved);

  if (input.administrationFullyDefinesWorks === null) blockers.push("Debe resolverse si la Administración define íntegramente las obras para aplicar correctamente el artículo 249 LCSP.");
  let projectLayerReady = false;
  if (input.administrationFullyDefinesWorks === true) {
    if (!input.projectAvailable) blockers.push("Falta proyecto de obras cuando la Administración define íntegramente su ejecución (art. 249.1 LCSP).");
    if (!input.projectContent) blockers.push("Falta evaluación del contenido del proyecto de obras.");
    else blockers.push(...input.projectContent.blockers);
    if (!input.worksPreparation) blockers.push("Falta evaluación de supervisión, aprobación y replanteo del proyecto.");
    else blockers.push(...input.worksPreparation.blockers);
    projectLayerReady = input.projectAvailable && Boolean(input.projectContent?.complete) && Boolean(input.worksPreparation?.readyForTenderPreparation);
  } else if (input.administrationFullyDefinesWorks === false) {
    projectLayerReady = anteprojectLayerReady;
  }

  if (input.financialEvaluationOfficeReportApplicable === null) blockers.push("Debe resolverse la aplicabilidad del informe de la Oficina de Evaluación Financiera competente antes de cerrar la preparación concesional.");
  if (input.financialEvaluationOfficeReportApplicable === true && !input.financialEvaluationOfficeReportAvailable) blockers.push("Falta informe de evaluación financiera preceptivo o aplicable al expediente concesional.");
  const financialEvaluationLayerReady = input.financialEvaluationOfficeReportApplicable === false || (input.financialEvaluationOfficeReportApplicable === true && input.financialEvaluationOfficeReportAvailable);

  return {
    ready: blockers.length === 0 && anteprojectLayerReady && projectLayerReady && financialEvaluationLayerReady,
    anteprojectLayerReady,
    projectLayerReady,
    financialEvaluationLayerReady,
    blockers: [...new Set(blockers)],
    legalBasis: ["arts. 247-250 LCSP"],
    humanValidationRequired: true,
  };
}
