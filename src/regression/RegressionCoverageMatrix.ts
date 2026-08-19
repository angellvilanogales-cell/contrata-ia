import { SUPPLY_GOLDEN_CASE_001 } from "./SupplyGoldenCase001";

export type RegressionCaseStatus =
  | "VALIDATED_GOLDEN"
  | "PLANNED"
  | "SOURCE_VALIDATION_REQUIRED";

export type RegressionCoverageCase = {
  id: string;
  label: string;
  status: RegressionCaseStatus;
  contractType: "SUMINISTRO" | "SERVICIO";
  procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO" | "ABIERTO_SIMPLIFICADO" | "ABIERTO";
  needsBased: boolean;
  lots: boolean;
  extensions: boolean;
  plannedModification: boolean;
  awardMode: "PRECIO_UNICO" | "CRITERIOS_MULTIPLES";
  economicMode: "PRECIOS_UNITARIOS" | "PRECIO_GLOBAL";
  sourceBasis: "GOLDEN_CASE" | "PENDING_REAL_CASE";
  purpose: string;
};

export const REGRESSION_COVERAGE_MATRIX: readonly RegressionCoverageCase[] = [
  {
    id: SUPPLY_GOLDEN_CASE_001.id,
    label: "Suministro DA 33.ª · lote único · precio único",
    status: "VALIDATED_GOLDEN",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
    needsBased: true,
    lots: false,
    extensions: true,
    plannedModification: true,
    awardMode: "PRECIO_UNICO",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "GOLDEN_CASE",
    purpose: "Línea base documental y jurídica ya validada de extremo a extremo.",
  },
  {
    id: "REG-SUPPLY-002",
    label: "Suministro ordinario · sin DA 33.ª · lote único",
    status: "SOURCE_VALIDATION_REQUIRED",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
    needsBased: false,
    lots: false,
    extensions: false,
    plannedModification: false,
    awardMode: "PRECIO_UNICO",
    economicMode: "PRECIO_GLOBAL",
    sourceBasis: "PENDING_REAL_CASE",
    purpose: "Comprobar que el motor no aplica reglas DA 33.ª cuando el contrato no es por necesidades.",
  },
  {
    id: "REG-SUPPLY-003",
    label: "Suministro por necesidades · varios lotes",
    status: "SOURCE_VALIDATION_REQUIRED",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO_SIMPLIFICADO",
    needsBased: true,
    lots: true,
    extensions: true,
    plannedModification: true,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "PENDING_REAL_CASE",
    purpose: "Cubrir distribución por lotes, presupuestos diferenciados y reglas de adjudicación no idénticas al golden case.",
  },
  {
    id: "REG-SUPPLY-004",
    label: "Suministro · abierto simplificado · criterios múltiples",
    status: "SOURCE_VALIDATION_REQUIRED",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO_SIMPLIFICADO",
    needsBased: false,
    lots: false,
    extensions: true,
    plannedModification: false,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIO_GLOBAL",
    sourceBasis: "PENDING_REAL_CASE",
    purpose: "Probar ponderación de criterios y evitar reutilizar la motivación de precio único del caso ferretería.",
  },
  {
    id: "REG-SERVICE-005",
    label: "Servicio · precio global · sin DA 33.ª",
    status: "SOURCE_VALIDATION_REQUIRED",
    contractType: "SERVICIO",
    procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
    needsBased: false,
    lots: false,
    extensions: true,
    plannedModification: false,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIO_GLOBAL",
    sourceBasis: "PENDING_REAL_CASE",
    purpose: "Abrir cobertura a servicios sin trasladar estructura documental propia de suministros.",
  },
  {
    id: "REG-SERVICE-006",
    label: "Servicio por necesidades · precios unitarios",
    status: "SOURCE_VALIDATION_REQUIRED",
    contractType: "SERVICIO",
    procedure: "ABIERTO_SIMPLIFICADO",
    needsBased: true,
    lots: false,
    extensions: true,
    plannedModification: true,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "PENDING_REAL_CASE",
    purpose: "Comprobar la generalización del régimen de necesidades fuera del suministro piloto.",
  },
  {
    id: "REG-SUPPLY-007",
    label: "Suministro · procedimiento abierto · varios lotes",
    status: "SOURCE_VALIDATION_REQUIRED",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO",
    needsBased: false,
    lots: true,
    extensions: true,
    plannedModification: true,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "PENDING_REAL_CASE",
    purpose: "Cubrir procedimiento abierto y decisiones de lote fuera del itinerario abreviado.",
  },
  {
    id: "REG-SUPPLY-008",
    label: "Suministro · sin prórroga ni modificación prevista",
    status: "SOURCE_VALIDATION_REQUIRED",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
    needsBased: false,
    lots: false,
    extensions: false,
    plannedModification: false,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "PENDING_REAL_CASE",
    purpose: "Verificar ramas negativas: sin prórroga, sin modificación y sin inferencias automáticas de campos subordinados.",
  },
] as const;

export const REGRESSION_COVERAGE_DIMENSIONS = {
  contractTypes: ["SUMINISTRO", "SERVICIO"],
  procedures: ["ABIERTO_SIMPLIFICADO_ABREVIADO", "ABIERTO_SIMPLIFICADO", "ABIERTO"],
  needsBased: [true, false],
  lots: [true, false],
  extensions: [true, false],
  plannedModification: [true, false],
  awardModes: ["PRECIO_UNICO", "CRITERIOS_MULTIPLES"],
  economicModes: ["PRECIOS_UNITARIOS", "PRECIO_GLOBAL"],
} as const;
