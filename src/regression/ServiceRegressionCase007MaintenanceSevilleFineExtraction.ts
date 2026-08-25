import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE } from "./ServiceRegressionCase007MaintenanceSeville";

export const SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE = {
  id: "REG-SERVICE-007",
  step: "11.9.1",
  expediente: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.expediente,
  status: "FINE_EVIDENCE_ENVELOPE_PENDING_HUMAN_VALIDATION",
  sourceDocuments: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.sourceDocuments,
  confirmed: {
    contractType: "SERVICIO",
    object: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.facts.object,
    procedure: "ABIERTO",
    sara: true,
    lots: true,
    lotCount: 4,
    lotNames: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.facts.lotNames,
    cpvs: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.facts.mainAndRelatedCpvs,
    insufficientOwnMeansJustified: true,
    gmaoRequiredAsTechnicalMeans: true,
    electronicTendering: true,
  },
  blockedBySourceInconsistency: {
    field: "MAX_LOTS_PER_TENDERER",
    severity: "BLOCKING_FOR_FREEZE",
    statementA: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.sourceInconsistencies[0].statementA,
    statementB: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE.sourceInconsistencies[0].statementB,
    resolutionPolicy: "NO_INFERENCE_REQUIRE_SOURCE_CLARIFICATION_OR_HUMAN_DOCUMENT_REVIEW",
  },
  pendingPrimaryEvidence: [
    "PBL, IVA y valor estimado exactos",
    "duración exacta y régimen de prórrogas",
    "sistema de determinación del precio",
    "aplicación o no de DA 33.ª",
    "existencia, porcentaje y causa de modificación prevista",
    "criterios de adjudicación, ponderaciones y fórmulas",
    "existencia y alcance de criterios sujetos a juicio de valor",
    "garantía definitiva y eventual complementaria",
    "solvencia económica y técnica exacta por lote",
    "existencia y régimen de subrogación de personal",
    "condiciones especiales de ejecución",
    "penalidades específicas",
  ] as const,
  evidencePolicy: {
    freezeOnlyExplicitlySupportedFacts: true,
    contradictionMustRemainVisible: true,
    contradictionCannotBeResolvedByPrevalenceHeuristic: true,
    pendingFieldsCannotBeInheritedFromCarl: true,
    pendingFieldsCannotBeInheritedFromSupplyCases: true,
    humanValidationRequired: true,
  },
} as const;

export type ServiceRegressionCase007MaintenanceSevilleFineExtraction = typeof SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE;
