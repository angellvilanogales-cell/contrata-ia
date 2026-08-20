import { SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM } from "./SupplyRegressionCase005TabletsPlatform";

export const TABLETS_REGRESSION_VERSION = "REG-SUPPLY-005-TABLETS-GUARD-11.7.9-v1";

const FACTS = SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.facts;

export const TABLETS_REGRESSION_CHECKS = [
  { id: "TABLETS-SUPPLY", ok: FACTS.contractType === "SUMINISTRO", purpose: "Mantener la calificación de suministro validada en 11.7.8." },
  { id: "TABLETS-PLATFORM-COMPONENT", ok: FACTS.complexSupplyWithPlatformComponent === true, purpose: "Impedir que desaparezca el componente de plataforma de gestión del objeto." },
  { id: "TABLETS-OPEN-PROCEDURE", ok: FACTS.procedure === "ABIERTO", purpose: "Evitar heredar el procedimiento simplificado abreviado del golden case." },
  { id: "TABLETS-SINGLE-LOT", ok: FACTS.lots === false, purpose: "Conservar el lote único validado para este expediente." },
  { id: "TABLETS-DA33", ok: FACTS.needsBasedDA33 === true, purpose: "Mantener activa la lógica DA 33.ª propia del caso." },
  { id: "TABLETS-UNIT-PRICES", ok: FACTS.economicMode === "PRECIOS_UNITARIOS", purpose: "Conservar la modalidad económica de precios unitarios." },
  { id: "TABLETS-MULTIPLE-CRITERIA", ok: FACTS.awardMode === "CRITERIOS_MULTIPLES", purpose: "Impedir sustituir la pluralidad de criterios por precio único 100 puntos." },
  { id: "TABLETS-FORMULA-CRITERIA", ok: FACTS.formulaEvaluatedCriteria === true, purpose: "Conservar la evaluación mediante fórmulas validada en la extracción." },
  { id: "TABLETS-EXTENSION-EXISTS", ok: FACTS.extensions === true, purpose: "Mantener la existencia de prórroga sin congelar aún su detalle temporal." },
  { id: "TABLETS-MODIFICATION-EXISTS", ok: FACTS.plannedModification === true, purpose: "Mantener la existencia de modificación prevista sin inferir todavía causa o porcentaje." },
] as const;

export const TABLETS_REGRESSION_BLOCKERS = TABLETS_REGRESSION_CHECKS.filter((item) => !item.ok);

export const TABLETS_REGRESSION_BASELINE = {
  version: TABLETS_REGRESSION_VERSION,
  caseId: SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.id,
  passed: TABLETS_REGRESSION_BLOCKERS.length === 0,
  blockers: TABLETS_REGRESSION_BLOCKERS,
  checks: TABLETS_REGRESSION_CHECKS,
  protectedScope: SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.extractionScope.verifiedForStep1178,
  deliberatelyNotFrozenYet: SUPPLY_REGRESSION_CASE_005_TABLETS_PLATFORM.extractionScope.deliberatelyNotFrozenYet,
  classificationGuard: "La existencia de una plataforma no autoriza a recalificar automáticamente el contrato como servicio o contrato mixto sin extracción y validación jurídica específica.",
} as const;
