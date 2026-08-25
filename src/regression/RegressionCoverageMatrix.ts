import { SUPPLY_GOLDEN_CASE_001 } from "./SupplyGoldenCase001";

export type RegressionCaseStatus =
  | "VALIDATED_GOLDEN"
  | "SOURCE_DOCUMENTS_AVAILABLE"
  | "PLANNED"
  | "SOURCE_VALIDATION_REQUIRED";

export type RegressionSourceDocument = "MEMORIA" | "PCAP" | "PPT" | "INFORME" | "ANEXOS";

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
  sourceBasis: "GOLDEN_CASE" | "REAL_SOURCE_DOCUMENTS" | "PENDING_REAL_CASE";
  purpose: string;
  source?: {
    expediente: string;
    shortName: string;
    documents: readonly RegressionSourceDocument[];
    legalValidation: "PENDING" | "VALIDATED";
    notes: string;
  };
  tags?: readonly string[];
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
    label: "Panda Antivirus AVRA · suministro ordinario · sin DA 33.ª · lote único",
    status: "SOURCE_DOCUMENTS_AVAILABLE",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO_SIMPLIFICADO",
    needsBased: false,
    lots: false,
    extensions: false,
    plannedModification: true,
    awardMode: "PRECIO_UNICO",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "REAL_SOURCE_DOCUMENTS",
    purpose: "Contrastar que DA 33.ª queda desactivada, manteniendo precios unitarios y una modificación prevista distinta: reducción de financiación hasta el 20 %, no mayores necesidades.",
    source: {
      expediente: "CONTR 2025 466864 (2025/001003)",
      shortName: "Panda Antivirus - AVRA",
      documents: ["MEMORIA", "PCAP", "PPT"],
      legalValidation: "PENDING",
      notes: "Extracción documental 11.7.2 disponible; pendiente de validación humana antes de fijar línea base jurídica.",
    },
    tags: ["SIN_DA33", "SIN_LOTES", "PRECIO_100", "PRECIOS_UNITARIOS", "MODIFICACION_20_REDUCCION_FINANCIACION", "CASO_PRIORITARIO"],
  },
  {
    id: "REG-SUPPLY-003",
    label: "Aulas digitales · 9 lotes · abierto SARA · DA 33.ª",
    status: "SOURCE_DOCUMENTS_AVAILABLE",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO",
    needsBased: true,
    lots: true,
    extensions: true,
    plannedModification: true,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "REAL_SOURCE_DOCUMENTS",
    purpose: "Cubrir lotes múltiples, procedimiento abierto sujeto a regulación armonizada, necesidades y financiación europea sin reutilizar la estructura del golden case.",
    source: { expediente: "CONTR 2025 0000489703", shortName: "Equipamiento para aulas digitales", documents: ["MEMORIA", "PCAP", "PPT"], legalValidation: "PENDING", notes: "Fuentes incorporadas con memoria complementaria. Pendiente de auditoría jurídica propia." },
    tags: ["9_LOTES", "DA33", "ABIERTO_SARA", "FONDOS_UE"],
  },
  {
    id: "REG-SUPPLY-004",
    label: "SAS 470/2025 · acuerdo marco · lotes · juicio de valor",
    status: "SOURCE_DOCUMENTS_AVAILABLE",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO",
    needsBased: false,
    lots: true,
    extensions: true,
    plannedModification: true,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "REAL_SOURCE_DOCUMENTS",
    purpose: "Probar acuerdo marco, suministro de tracto sucesivo, lotes, precios unitarios y coexistencia de criterios automáticos con juicio de valor.",
    source: { expediente: "470/2025", shortName: "SAS - nebulización y oxigenoterapia", documents: ["MEMORIA", "PCAP", "PPT", "ANEXOS"], legalValidation: "PENDING", notes: "Caso avanzado pendiente de validación independiente." },
    tags: ["ACUERDO_MARCO", "TRACTO_SUCESIVO", "JUICIO_VALOR", "LOTES"],
  },
  {
    id: "REG-SUPPLY-005",
    label: "Tablets + plataforma · abierto · DA 33.ª · lote único",
    status: "SOURCE_DOCUMENTS_AVAILABLE",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO",
    needsBased: true,
    lots: false,
    extensions: true,
    plannedModification: true,
    awardMode: "CRITERIOS_MULTIPLES",
    economicMode: "PRECIOS_UNITARIOS",
    sourceBasis: "REAL_SOURCE_DOCUMENTS",
    purpose: "Comprobar un suministro complejo con componente de plataforma, lote único, necesidades y criterios evaluables mediante fórmulas.",
    source: { expediente: "CONTR 2024 0001239412", shortName: "Tablets y plataforma de gestión", documents: ["MEMORIA", "PCAP", "PPT"], legalValidation: "PENDING", notes: "Debe auditarse expresamente la calificación del objeto y el componente de plataforma." },
    tags: ["DA33", "SUMINISTRO_COMPLEJO", "PLATAFORMA", "LOTE_UNICO"],
  },
  {
    id: "REG-SUPPLY-006",
    label: "VEIASA Windows Server · suministro ordinario · precio único",
    status: "SOURCE_DOCUMENTS_AVAILABLE",
    contractType: "SUMINISTRO",
    procedure: "ABIERTO_SIMPLIFICADO",
    needsBased: false,
    lots: false,
    extensions: false,
    plannedModification: false,
    awardMode: "PRECIO_UNICO",
    economicMode: "PRECIO_GLOBAL",
    sourceBasis: "REAL_SOURCE_DOCUMENTS",
    purpose: "Aportar un segundo control independiente de suministro ordinario sin DA 33.ª, sin lotes y con criterio económico único.",
    source: { expediente: "CF050-21-058", shortName: "VEIASA - licencias Windows Server", documents: ["MEMORIA", "PCAP", "PPT", "INFORME"], legalValidation: "PENDING", notes: "Caso redundante de control." },
    tags: ["SIN_DA33", "SIN_LOTES", "PRECIO_100", "CONTROL_REDUNDANTE"],
  },
  {
    id: "REG-SERVICE-005", label: "Servicio · precio global · sin DA 33.ª", status: "SOURCE_VALIDATION_REQUIRED", contractType: "SERVICIO", procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO", needsBased: false, lots: false, extensions: true, plannedModification: false, awardMode: "CRITERIOS_MULTIPLES", economicMode: "PRECIO_GLOBAL", sourceBasis: "PENDING_REAL_CASE", purpose: "Abrir cobertura a servicios sin trasladar estructura documental propia de suministros."
  },
  {
    id: "REG-SERVICE-006", label: "Servicio por necesidades · precios unitarios", status: "SOURCE_VALIDATION_REQUIRED", contractType: "SERVICIO", procedure: "ABIERTO_SIMPLIFICADO", needsBased: true, lots: false, extensions: true, plannedModification: true, awardMode: "CRITERIOS_MULTIPLES", economicMode: "PRECIOS_UNITARIOS", sourceBasis: "PENDING_REAL_CASE", purpose: "Comprobar la generalización del régimen de necesidades fuera del suministro piloto."
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

export const REGRESSION_SOURCE_CASES = REGRESSION_COVERAGE_MATRIX.filter(
  (item) => item.status === "SOURCE_DOCUMENTS_AVAILABLE",
);
