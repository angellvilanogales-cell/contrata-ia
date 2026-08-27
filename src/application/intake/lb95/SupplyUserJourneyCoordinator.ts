import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";

export type SupplyJourneyStageId =
  | "IDENTIFICATION"
  | "ECONOMICS"
  | "PROCEDURE"
  | "TECHNICAL"
  | "EXECUTION"
  | "FINAL_REVIEW"
  | "DOCUMENTS";

export type SupplyJourneyStageStatus = "COMPLETE" | "IN_PROGRESS" | "BLOCKED";

export interface SupplyJourneyStage {
  id: SupplyJourneyStageId;
  label: string;
  status: SupplyJourneyStageStatus;
  applicablePaths: readonly string[];
  completedPaths: readonly string[];
  blockers: readonly string[];
}

export interface SupplyUserJourney {
  caseId: string;
  family: "SUPPLY";
  stages: readonly SupplyJourneyStage[];
  currentStage: SupplyJourneyStageId;
  progressPercent: number;
  blockers: readonly string[];
  humanValidationRequired: true;
  readyForFinalReview: boolean;
  readyForDocuments: boolean;
}

const BASE_STAGES: Readonly<Record<Exclude<SupplyJourneyStageId, "FINAL_REVIEW" | "DOCUMENTS">, readonly string[]>> = {
  IDENTIFICATION: [
    "contractType",
    "need",
    "object",
    "cpvMain",
    "administrative.contractingAuthority",
    "lots.divisionIntoLots",
  ],
  ECONOMICS: [
    "baseTenderBudgetCents",
    "economic.initialVatAmountCents",
    "economic.initialPblVatIncludedCents",
    "economic.legalEstimatedValueCents",
    "economic.priceDeterminationRegime",
    "economic.estimatedValueCalculationMethod",
    "economic.fundingSource",
    "economic.priceRevisionRegime",
    "durationMonths",
    "extensionMonths",
  ],
  PROCEDURE: [
    "procedure",
    "criteria.awardCriteria",
    "criteria.singleCriterionMotivation",
  ],
  TECHNICAL: [
    "technical.supplyVariant",
    "technical.technicalRequirements",
    "technical.executionLocations",
  ],
  EXECUTION: [
    "execution.extensionStructure",
    "execution.extensionNoticeMonths",
    "execution.specialExecutionConditions",
    "execution.receiptAndAcceptanceRegime",
    "execution.plannedModificationRegime",
  ],
};

const LABELS: Readonly<Record<SupplyJourneyStageId, string>> = {
  IDENTIFICATION: "Necesidad, objeto y lotes",
  ECONOMICS: "Economía y duración",
  PROCEDURE: "Procedimiento y adjudicación",
  TECHNICAL: "Prescripciones técnicas",
  EXECUTION: "Ejecución y recepción",
  FINAL_REVIEW: "Revisión final",
  DOCUMENTS: "Documentos",
};

function field(record: UniversalEvidenceRecord, path: string) {
  return record.fields[path];
}

function usable(record: UniversalEvidenceRecord, path: string): boolean {
  const current = field(record, path);
  if (!current) return false;
  if (["PENDING", "SOURCE_CONFLICT", "SYSTEM_PROPOSAL"].includes(current.status)) return false;
  return current.status === "NOT_APPLICABLE" || current.value !== undefined;
}

function validated(record: UniversalEvidenceRecord, path: string): boolean {
  const current = field(record, path);
  if (!current) return false;
  if (current.status === "NOT_APPLICABLE") return true;
  return current.status === "HUMAN_VALIDATED" && current.humanValidated === true;
}

function conditionalPaths(record: UniversalEvidenceRecord): Readonly<Record<Exclude<SupplyJourneyStageId, "FINAL_REVIEW" | "DOCUMENTS">, readonly string[]>> {
  const identification = [...BASE_STAGES.IDENTIFICATION];
  const economics = [...BASE_STAGES.ECONOMICS];
  const procedure = [...BASE_STAGES.PROCEDURE];
  const technical = [...BASE_STAGES.TECHNICAL];
  const execution = [...BASE_STAGES.EXECUTION];

  if (field(record, "lots.divisionIntoLots")?.value === false) identification.push("lots.noDivisionJustification");
  if (field(record, "lots.divisionIntoLots")?.value === true) identification.push("lots.lots");

  const procedureValue = String(field(record, "procedure")?.value ?? "");
  if (procedureValue !== "ABIERTO_SIMPLIFICADO_ABREVIADO" && procedureValue !== "CONTRATO_MENOR") {
    procedure.push("criteria.economicSolvency", "criteria.technicalSolvency");
  }

  const variant = String(field(record, "technical.supplyVariant")?.value ?? "");
  if (variant === "CATALOGUE_NEEDS") technical.push("technical.hasSuccessiveOrders");
  if (variant === "SUPPLY_WITH_SERVICE_COMPONENT") technical.push("technical.hasServicePlatformComponent");
  if (variant === "FURNITURE_INSTALLATION") technical.push("technical.hasInstallationOrAssembly");
  if (variant === "MEDICAL_FRAMEWORK") procedure.push("administrative.isFrameworkAgreement");
  if (variant === "DIGITAL_EQUIPMENT") economics.push("regulation.europeanFunding");

  return { IDENTIFICATION: identification, ECONOMICS: economics, PROCEDURE: procedure, TECHNICAL: technical, EXECUTION: execution };
}

function stageBlockers(record: UniversalEvidenceRecord, paths: readonly string[]): string[] {
  const blockers: string[] = [];
  for (const path of paths) {
    const current = field(record, path);
    if (current?.status === "SOURCE_CONFLICT") blockers.push(`${path}: conflicto de fuentes pendiente de decisión humana.`);
  }
  return blockers;
}

function stage(record: UniversalEvidenceRecord, id: Exclude<SupplyJourneyStageId, "FINAL_REVIEW" | "DOCUMENTS">, paths: readonly string[]): SupplyJourneyStage {
  const completedPaths = paths.filter(path => usable(record, path));
  const blockers = stageBlockers(record, paths);
  const status: SupplyJourneyStageStatus = blockers.length
    ? "BLOCKED"
    : completedPaths.length === paths.length
      ? "COMPLETE"
      : "IN_PROGRESS";
  return { id, label: LABELS[id], status, applicablePaths: paths, completedPaths, blockers };
}

/**
 * LB95: vista de recorrido para una persona tramitadora.
 * No crea ni transforma evidencia: solo proyecta el expediente universal ya
 * existente en etapas comprensibles y conserva los mismos estados/gates.
 */
export function evaluateSupplyUserJourney(record: UniversalEvidenceRecord, physicalPackageReady = false): SupplyUserJourney {
  const family = field(record, "contractType")?.value;
  const globalBlockers: string[] = [];
  if (family && family !== "SUPPLY") globalBlockers.push(`El expediente está clasificado como ${String(family)} y no puede tramitarse en el vertical Supply.`);

  const paths = conditionalPaths(record);
  const businessStages = (Object.keys(paths) as Array<Exclude<SupplyJourneyStageId, "FINAL_REVIEW" | "DOCUMENTS">>)
    .map(id => stage(record, id, paths[id]));

  const allApplicable = businessStages.flatMap(item => item.applicablePaths);
  const usableCount = allApplicable.filter(path => usable(record, path)).length;
  const allValidated = allApplicable.length > 0 && allApplicable.every(path => validated(record, path));
  const anyBlocked = businessStages.some(item => item.status === "BLOCKED");
  const businessComplete = businessStages.every(item => item.status === "COMPLETE");
  const readyForFinalReview = family === "SUPPLY" && businessComplete && !anyBlocked;

  const finalReviewBlockers = [...globalBlockers];
  if (!businessComplete) finalReviewBlockers.push("Quedan datos aplicables pendientes de completar.");
  if (anyBlocked) finalReviewBlockers.push("Existen conflictos de fuente pendientes.");
  if (readyForFinalReview && !allValidated) finalReviewBlockers.push("Todos los datos aplicables deben quedar validados humanamente antes de generar documentos.");

  const finalReviewStatus: SupplyJourneyStageStatus = finalReviewBlockers.some(item => item.includes("conflicto") || item.includes("clasificado"))
    ? "BLOCKED"
    : allValidated && readyForFinalReview
      ? "COMPLETE"
      : "IN_PROGRESS";

  const finalReview: SupplyJourneyStage = {
    id: "FINAL_REVIEW",
    label: LABELS.FINAL_REVIEW,
    status: finalReviewStatus,
    applicablePaths: allApplicable,
    completedPaths: allApplicable.filter(path => validated(record, path)),
    blockers: finalReviewBlockers,
  };

  const documentBlockers: string[] = [];
  if (finalReview.status !== "COMPLETE") documentBlockers.push("La revisión final no está completada.");
  if (!physicalPackageReady) documentBlockers.push("El paquete físico compatible no está disponible o acreditado.");
  const documents: SupplyJourneyStage = {
    id: "DOCUMENTS",
    label: LABELS.DOCUMENTS,
    status: documentBlockers.length ? "IN_PROGRESS" : "COMPLETE",
    applicablePaths: [],
    completedPaths: [],
    blockers: documentBlockers,
  };

  const stages = [...businessStages, finalReview, documents];
  const currentStage = stages.find(item => item.status !== "COMPLETE")?.id ?? "DOCUMENTS";
  const progressPercent = allApplicable.length ? Math.round((usableCount / allApplicable.length) * 80 + (finalReview.status === "COMPLETE" ? 10 : 0) + (documents.status === "COMPLETE" ? 10 : 0)) : 0;
  const blockers = [...globalBlockers, ...stages.flatMap(item => item.blockers)];

  return {
    caseId: record.caseId,
    family: "SUPPLY",
    stages,
    currentStage,
    progressPercent: Math.min(100, progressPercent),
    blockers: [...new Set(blockers)],
    humanValidationRequired: true,
    readyForFinalReview,
    readyForDocuments: documents.status === "COMPLETE",
  };
}
