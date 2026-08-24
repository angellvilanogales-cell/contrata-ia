export type ProcurementReferenceContractType = "SUPPLY" | "SERVICE" | "WORKS" | "MIXED" | "LEASE" | "CONCESSION";
export type ProcurementReferenceProcedure = "OPEN" | "OPEN_SIMPLIFIED" | "OPEN_SIMPLIFIED_ABBREVIATED" | "FRAMEWORK" | "OTHER";
export type ProcurementReferenceStatus = "PRODUCTION_VALIDATED" | "REGRESSION_VALIDATED" | "SOURCE_REFERENCE_ONLY" | "NORMATIVE_ONLY";

export interface ProcurementSourceCaseReference {
  id: string;
  title: string;
  contractType: ProcurementReferenceContractType;
  procedure: ProcurementReferenceProcedure;
  sourceFamily: string;
  distinguishingFeatures: readonly string[];
  status: ProcurementReferenceStatus;
}

/**
 * LB50 — matriz explícita del corpus de casos reales disponible en las fuentes del proyecto.
 *
 * La finalidad no es declarar soporte universal por el mero hecho de disponer de ejemplos,
 * sino conservarlos como banco de contraste y convertir progresivamente cada familia en
 * regresión productiva. Solo el caso de ferretería ha completado a fecha de este bloque el
 * ciclo documental integral PCAP + Memoria + PPT con render real y cierre técnico conjunto.
 */
export const PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX: readonly ProcurementSourceCaseReference[] = [
  {
    id: "REG-SUPPLY-FERRETERIA-240267",
    title: "Suministro de materiales de ferretería para SSCC SAE",
    contractType: "SUPPLY",
    procedure: "OPEN_SIMPLIFIED_ABBREVIATED",
    sourceFamily: "Ferretería SAE CONTR/2026/240267",
    distinguishingFeatures: ["DA33", "precios unitarios", "sin lotes", "criterio único precio", "98 referencias", "PCAP+Memoria+PPT"],
    status: "PRODUCTION_VALIDATED",
  },
  {
    id: "REG-SUPPLY-FURNITURE-SEVILLA-64336",
    title: "Suministro e instalación de mobiliario para oficinas y centros SAE Sevilla",
    contractType: "SUPPLY",
    procedure: "OTHER",
    sourceFamily: "ejemplos 2.zip",
    distinguishingFeatures: ["suministro con instalación", "mobiliario", "memoria", "PPT", "contrato formalizado"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-SUPPLY-CLOTHING-GRANADA",
    title: "Suministro de vestuario para personal laboral",
    contractType: "SUPPLY",
    procedure: "OTHER",
    sourceFamily: "Ejemplos 3.zip",
    distinguishingFeatures: ["vestuario", "prescripciones por artículos", "PCAP", "PPT", "posible lotificación"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-SERVICE-CLEANING-HUELVA-468715",
    title: "Servicio de limpieza de oficinas y centros de empleo de Huelva",
    contractType: "SERVICE",
    procedure: "OTHER",
    sourceFamily: "ejemplos 2.zip",
    distinguishingFeatures: ["limpieza", "varios centros", "memoria", "PPT", "servicio intensivo en personal"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-SERVICE-SECURITY-CADIZ-115962",
    title: "Vigilancia de oficinas de empleo SAE Cádiz",
    contractType: "SERVICE",
    procedure: "OPEN",
    sourceFamily: "ejemplos 2.zip",
    distinguishingFeatures: ["vigilancia", "servicio regulado", "memoria", "PPT", "contrato de referencia"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-SERVICE-EVENTS-8-LOTS-112626",
    title: "Servicios para organización de quince eventos provinciales en ocho lotes",
    contractType: "SERVICE",
    procedure: "OPEN_SIMPLIFIED_ABBREVIATED",
    sourceFamily: "Ejemplos 3.zip",
    distinguishingFeatures: ["8 lotes", "eventos", "PCAP", "PPT", "memoria", "criterios por lote"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-SERVICE-EVENTS-OPEN-374417",
    title: "Organización de gala de premios al trabajo autónomo",
    contractType: "SERVICE",
    procedure: "OPEN",
    sourceFamily: "Ejemplos 3.zip",
    distinguishingFeatures: ["eventos", "PCAP", "PPT", "memoria", "varios criterios"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-SERVICE-PROFESSIONAL-BUILDING",
    title: "Redacción de IEE, proyecto, dirección facultativa y coordinación de seguridad y salud",
    contractType: "SERVICE",
    procedure: "OPEN_SIMPLIFIED",
    sourceFamily: "Ejemplos 3.zip",
    distinguishingFeatures: ["prestaciones intelectuales", "dirección facultativa", "seguridad y salud", "PCAP", "PPT", "memoria"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-SERVICE-MAINTENANCE-TUNNEL",
    title: "Mantenimiento de sistemas de protección contra incendios y ventilación de túnel",
    contractType: "SERVICE",
    procedure: "OTHER",
    sourceFamily: "Ejemplos 3.zip",
    distinguishingFeatures: ["mantenimiento", "instalaciones críticas", "PPT", "PCAP tipo", "memoria"],
    status: "REGRESSION_VALIDATED",
  },
  {
    id: "REG-WORKS-LINARES-86582",
    title: "Terminación de obras de remodelación integral del Parque Deportivo de La Garza",
    contractType: "WORKS",
    procedure: "OPEN",
    sourceFamily: "Ejemplos 3.zip",
    distinguishingFeatures: ["obra", "proyecto", "PPTP", "PCAP de obras abierto"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-MIXED-REHAB-FAROLA-MALAGA",
    title: "Redacción de proyecto, dirección facultativa y obras de rehabilitación energética",
    contractType: "MIXED",
    procedure: "OTHER",
    sourceFamily: "Ejemplos 3.zip",
    distinguishingFeatures: ["contrato mixto", "servicios técnicos", "obra", "rehabilitación energética", "memoria", "PPT"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "REG-LEASE-ALBUNOL",
    title: "Arrendamiento de inmueble para oficina SAE de Albuñol",
    contractType: "LEASE",
    procedure: "OTHER",
    sourceFamily: "ejemplos 2.zip",
    distinguishingFeatures: ["arrendamiento patrimonial", "inmueble", "memoria justificativa"],
    status: "SOURCE_REFERENCE_ONLY",
  },
  {
    id: "NORM-CONCESSION-LCSP",
    title: "Concesiones de obras y servicios — régimen LCSP",
    contractType: "CONCESSION",
    procedure: "OTHER",
    sourceFamily: "BOE-A-2017-12902-consolidado.pdf",
    distinguishingFeatures: ["riesgo operacional", "duración concesional", "reversión", "equilibrio económico", "tarifas"],
    status: "NORMATIVE_ONLY",
  },
] as const;

export function evaluateProcurementSourceCaseCoverage() {
  const productive = PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.filter(item => item.status === "PRODUCTION_VALIDATED");
  const regression = PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.filter(item => item.status === "REGRESSION_VALIDATED");
  const references = PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.filter(item => item.status === "SOURCE_REFERENCE_ONLY");
  const normativeOnly = PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.filter(item => item.status === "NORMATIVE_ONLY");
  const contractTypes = [...new Set(PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.map(item => item.contractType))];
  const procedures = [...new Set(PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.map(item => item.procedure))];

  return {
    corpusCaseCount: PROCUREMENT_SOURCE_CASE_COVERAGE_MATRIX.length,
    contractTypes,
    procedures,
    productiveCaseIds: productive.map(item => item.id),
    regressionCaseIds: regression.map(item => item.id),
    referenceCaseIds: references.map(item => item.id),
    normativeOnlyIds: normativeOnly.map(item => item.id),
    universalProductionClaimAllowed: false,
    universalProductionClaimBlocker:
      "El corpus cubre una casuística amplia, pero disponer de fuentes no equivale a soporte productivo. Cada familia debe superar extracción, expediente universal, plantilla editable, render protegido, regresión y validación humana.",
  } as const;
}
