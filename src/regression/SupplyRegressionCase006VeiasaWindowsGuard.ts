import { SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS } from "./SupplyRegressionCase006VeiasaWindows";

export const VEIASA_REGRESSION_VERSION = "REG-SUPPLY-006-VEIASA-GUARD-11.7.11-v1";

const facts = SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS.facts;

const checks = [
  { id: "VEIASA-SUPPLY", ok: facts.contractType === "SUMINISTRO", purpose: "Conservar la naturaleza de contrato de suministro." },
  { id: "VEIASA-PROCEDURE", ok: facts.procedure === "ABIERTO_SIMPLIFICADO", purpose: "Mantener el procedimiento abierto simplificado ordinario y evitar heredar el abreviado del golden." },
  { id: "VEIASA-ONE-LOT", ok: facts.lots === false, purpose: "Conservar el lote único." },
  { id: "VEIASA-DA33-OFF", ok: facts.needsBasedDA33 === false, purpose: "Impedir que se active la lógica de contrato en función de necesidades de la DA 33.ª." },
  { id: "VEIASA-GLOBAL-PRICE", ok: facts.economicMode === "PRECIO_GLOBAL", purpose: "Evitar que el motor transforme el precio global en precios unitarios." },
  { id: "VEIASA-PRICE-ONLY", ok: facts.awardMode === "PRECIO_UNICO", purpose: "Conservar el criterio económico único validado en 11.7.10." },
  { id: "VEIASA-NO-EXTENSIONS", ok: facts.extensions === false, purpose: "Impedir la herencia de las prórrogas 12+12 del golden case." },
  { id: "VEIASA-NO-PLANNED-MODIFICATION", ok: facts.plannedModification === false, purpose: "Impedir la herencia de la modificación prevista por mayores necesidades del golden case." },
] as const;

export const VEIASA_REGRESSION_BASELINE = {
  version: VEIASA_REGRESSION_VERSION,
  caseId: SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS.id,
  checks,
  blockers: checks.filter((check) => !check.ok),
  passed: checks.every((check) => check.ok),
  protectedScope: SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS.extractionScope.verifiedForStep11710,
  deliberatelyNotFrozenYet: SUPPLY_REGRESSION_CASE_006_VEIASA_WINDOWS.extractionScope.deliberatelyNotFrozenYet,
  forbiddenGoldenInheritance: [
    "DA33_ACTIVE",
    "DA33_MAXIMUM_BUDGET",
    "UNIT_PRICES",
    "EXTENSIONS_12_12",
    "DA33_NEEDS_INCREASE_MODIFICATION",
    "FERRETERIA_CATALOGUE_98_REFERENCES",
    "FORCE_GOLDEN_ECONOMIC_AMOUNTS",
  ],
} as const;

export type VeiasaRegressionBaseline = typeof VEIASA_REGRESSION_BASELINE;
