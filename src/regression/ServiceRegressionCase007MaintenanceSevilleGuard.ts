import { SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE } from "./ServiceRegressionCase007MaintenanceSevilleFineExtraction";

const C = SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE.confirmed;

export const MAINTENANCE_007_REGRESSION_VERSION = "REG-SERVICE-007-MAINTENANCE-SEVILLE-GUARD-11.9.2-v1";

export const MAINTENANCE_007_REGRESSION_MANIFEST = {
  caseId: "REG-SERVICE-007",
  step: "11.9.2",
  version: MAINTENANCE_007_REGRESSION_VERSION,
  protectedScope: {
    contractType: C.contractType,
    procedure: C.procedure,
    sara: C.sara,
    lots: C.lots,
    lotCount: C.lotCount,
    lotNames: C.lotNames,
    cpvs: C.cpvs,
    insufficientOwnMeansJustified: C.insufficientOwnMeansJustified,
    gmaoRequiredAsTechnicalMeans: C.gmaoRequiredAsTechnicalMeans,
  },
  checks: [
    { id: "MAINT-007-TYPE-SERVICE", ok: C.contractType === "SERVICIO", purpose: "Mantener la naturaleza de servicio." },
    { id: "MAINT-007-OPEN-PROCEDURE", ok: C.procedure === "ABIERTO", purpose: "Impedir heredar procedimiento simplificado del CARL o suministros." },
    { id: "MAINT-007-SARA", ok: C.sara === true, purpose: "Conservar el carácter SARA del expediente." },
    { id: "MAINT-007-LOTS-ON", ok: C.lots === true, purpose: "Impedir reducción automática a lote único." },
    { id: "MAINT-007-FOUR-LOTS", ok: C.lotCount === 4 && C.lotNames.length === 4, purpose: "Conservar los cuatro lotes acreditados." },
    { id: "MAINT-007-CPV-SET", ok: C.cpvs.length === 6, purpose: "Conservar la pluralidad de CPV técnicos acreditada." },
    { id: "MAINT-007-OWN-MEANS", ok: C.insufficientOwnMeansJustified === true, purpose: "Conservar la insuficiencia de medios propios justificada." },
    { id: "MAINT-007-GMAO", ok: C.gmaoRequiredAsTechnicalMeans === true, purpose: "Conservar GMAO como medio técnico exigido." },
  ] as const,
  blockingSourceInconsistency: {
    id: "LOT-PRESENTATION-LIMIT-AMBIGUITY",
    severity: "BLOCKING_FOR_RULE_FREEZE",
    unresolved: true,
    statementA: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE.blockedBySourceInconsistency.statementA,
    statementB: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE.blockedBySourceInconsistency.statementB,
    protectedTreatment: "La regresión debe fallar si el motor transforma esta contradicción en una regla definitiva sin evidencia primaria adicional y validación humana.",
  },
  forbiddenInheritance: [
    "LOTE_UNICO",
    "PROCEDIMIENTO_SIMPLIFICADO_CARL",
    "SUBROGACION_CARL",
    "PBL_VE_CARL",
    "DA33_SUMINISTROS",
    "CATALOGO_98_REFERENCIAS",
    "PRECIOS_UNITARIOS_SUMINISTRO",
    "MAXIMO_DOS_LOTES_COMO_REGLA_RESUELTA",
    "SIN_LIMITACION_DE_LOTES_COMO_REGLA_RESUELTA",
  ] as const,
  deliberatelyNotFrozenYet: SERVICE_REGRESSION_CASE_007_MAINTENANCE_SEVILLE_FINE.pendingPrimaryEvidence,
  requiresFineExtractionHumanValidation: true,
} as const;

export const MAINTENANCE_007_REGRESSION_RESULT = {
  ...MAINTENANCE_007_REGRESSION_MANIFEST,
  blockers: MAINTENANCE_007_REGRESSION_MANIFEST.checks.filter((check) => !check.ok),
  passed: MAINTENANCE_007_REGRESSION_MANIFEST.checks.every((check) => check.ok),
} as const;
