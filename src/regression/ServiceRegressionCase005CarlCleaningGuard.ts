import { SERVICE_REGRESSION_CASE_005_CARL_CLEANING } from "./ServiceRegressionCase005CarlCleaning";

export const CARL_SERVICE_REGRESSION_VERSION = "REG-SERVICE-005-CARL-GUARD-11.8.1-v1";

const f = SERVICE_REGRESSION_CASE_005_CARL_CLEANING.facts;

export const CARL_SERVICE_REGRESSION_BASELINE = {
  caseId: SERVICE_REGRESSION_CASE_005_CARL_CLEANING.id,
  version: CARL_SERVICE_REGRESSION_VERSION,
  checks: [
    { id: "CARL-SERVICE-TYPE", ok: f.contractType === "SERVICIO", purpose: "Impedir que el expediente se recodifique como suministro por incorporar materiales o maquinaria." },
    { id: "CARL-CLEANING-SERVICE", ok: f.serviceCategory === "LIMPIEZA", purpose: "Conservar la prestación principal de limpieza." },
    { id: "CARL-PROCEDURE", ok: f.procedure === "ABIERTO_SIMPLIFICADO" && f.ordinarySimplified === true, purpose: "Mantener el abierto simplificado ordinario y no heredar el abreviado del golden." },
    { id: "CARL-MAIN-CPV", ok: f.mainCpv === "90919200-4", purpose: "Conservar el CPV principal de servicios de limpieza de oficinas." },
    { id: "CARL-OWN-MEANS", ok: f.insufficientOwnMeans === true, purpose: "Mantener la insuficiencia de medios propios como hecho propio del expediente de servicios." },
    { id: "CARL-SUBROGATION", ok: f.personnelSubrogation === true, purpose: "Impedir que se pierda la subrogación de personal y su tratamiento laboral específico." },
    { id: "CARL-ACCESSORY-INPUTS", ok: f.accessoryCleaningMaterialsAndMachineryIncluded === true, purpose: "Conservar materiales y maquinaria como elementos instrumentales sin alterar la calificación principal." },
  ],
  protectedScope: SERVICE_REGRESSION_CASE_005_CARL_CLEANING.extractionScope.verifiedForStep118,
  deliberatelyNotFrozenYet: SERVICE_REGRESSION_CASE_005_CARL_CLEANING.extractionScope.deliberatelyNotFrozenYet,
  forbiddenSupplyInheritance: SERVICE_REGRESSION_CASE_005_CARL_CLEANING.regressionGuards.forbiddenSupplyInheritance,
} as const;

export const CARL_SERVICE_REGRESSION_BLOCKERS = CARL_SERVICE_REGRESSION_BASELINE.checks.filter((c) => !c.ok);
export const CARL_SERVICE_REGRESSION_PASSED = CARL_SERVICE_REGRESSION_BLOCKERS.length === 0;

export const CARL_SERVICE_REGRESSION_MANIFEST = {
  ...CARL_SERVICE_REGRESSION_BASELINE,
  blockers: CARL_SERVICE_REGRESSION_BLOCKERS,
  passed: CARL_SERVICE_REGRESSION_PASSED,
  status: CARL_SERVICE_REGRESSION_PASSED ? "AUTOMATIC_REGRESSION_READY" : "AUTOMATIC_REGRESSION_BLOCKED",
} as const;
