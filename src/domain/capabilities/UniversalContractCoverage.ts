import { CanonicalContractType } from "../expediente/CanonicalExpedienteState";
import { DocumentType } from "../documentModel/DocumentType";

/**
 * Matriz conservadora de cobertura universal.
 * Un motor disponible no equivale a expediente cerrado: las decisiones siguen
 * condicionadas por evidencia, aplicabilidad al subtipo y validación humana.
 */
export type UniversalTargetContractType = Exclude<CanonicalContractType, "OTHER">;

export type UniversalCapability =
  | "OBJECT_AND_NEED"
  | "CPV"
  | "LOTS"
  | "ECONOMICS"
  | "PROCEDURE"
  | "SOLVENCY"
  | "PUBLICITY"
  | "AWARD_CRITERIA"
  | "GUARANTEES"
  | "EXECUTION"
  | "MODIFICATIONS"
  | "PRICE_REVISION"
  | "REMEDIES"
  | "DOCUMENT_MODEL_SELECTION"
  | "EDITABLE_DOCUMENT_GENERATION"
  | "CROSS_DOCUMENT_AUDIT";

export type UniversalCoverageStatus =
  | "VALIDATED_ENGINE"
  | "AVAILABLE_WITH_HUMAN_VALIDATION"
  | "PARTIAL_SOURCE_BACKED"
  | "SOURCE_REFERENCE_ONLY"
  | "NOT_IMPLEMENTED";

export interface CapabilityCoverage {
  capability: UniversalCapability;
  status: UniversalCoverageStatus;
  criticalForOperationalClaim: boolean;
  evidence: readonly string[];
  notes: readonly string[];
}

export interface ContractFamilyCoverage {
  contractType: UniversalTargetContractType;
  requiredDocuments: readonly DocumentType[];
  capabilities: readonly CapabilityCoverage[];
  realSourceCoverage: "VALIDATED_CASE" | "REAL_SOURCES_AVAILABLE" | "LEGAL_SOURCE_ONLY" | "MISSING";
}

const COMMON_DOCUMENTS = [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT] as const;
const CORE_CAPABILITIES: readonly UniversalCapability[] = [
  "OBJECT_AND_NEED", "CPV", "LOTS", "ECONOMICS", "PROCEDURE", "SOLVENCY", "PUBLICITY",
  "AWARD_CRITERIA", "GUARANTEES", "EXECUTION", "MODIFICATIONS", "PRICE_REVISION", "REMEDIES",
  "DOCUMENT_MODEL_SELECTION", "EDITABLE_DOCUMENT_GENERATION", "CROSS_DOCUMENT_AUDIT",
];

function capability(name: UniversalCapability, status: UniversalCoverageStatus, evidence: readonly string[], notes: readonly string[] = []): CapabilityCoverage {
  return { capability: name, status, criticalForOperationalClaim: CORE_CAPABILITIES.includes(name), evidence, notes };
}

const TRANSVERSAL = {
  lots: capability("LOTS", "AVAILABLE_WITH_HUMAN_VALIDATION", ["UniversalLotsEngine"], ["No inventa motivación y exige subtipo cuando la concesión lo requiere."]),
  award: capability("AWARD_CRITERIA", "AVAILABLE_WITH_HUMAN_VALIDATION", ["UniversalAwardCriteriaEngine", "criterios.rules.yaml"], ["Valida criterios aportados; no crea ponderaciones ni fórmulas."]),
  guarantees: capability("GUARANTEES", "AVAILABLE_WITH_HUMAN_VALIDATION", ["UniversalGuaranteeEngine"], ["Distingue ASA, régimen ordinario, concesiones y otros supuestos especiales."]),
  modifications: capability("MODIFICATIONS", "AVAILABLE_WITH_HUMAN_VALIDATION", ["UniversalModificationEngine"], ["Art. 205 permanece siempre sujeto a revisión jurídica individual."]),
  priceRevision: capability("PRICE_REVISION", "AVAILABLE_WITH_HUMAN_VALIDATION", ["UniversalPriceRevisionEngine"], ["No fabrica fórmula ni índices."]),
  remedies: capability("REMEDIES", "AVAILABLE_WITH_HUMAN_VALIDATION", ["UniversalRemediesEngine"], ["Cubre solo el ámbito contractual del recurso especial; no sustituye el análisis del acto concreto."]),
} as const;

export const UNIVERSAL_CONTRACT_COVERAGE: readonly ContractFamilyCoverage[] = [
  {
    contractType: "SUPPLY",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "VALIDATED_CASE",
    capabilities: [
      capability("OBJECT_AND_NEED", "VALIDATED_ENGINE", ["ObjetoEngine", "golden supply DA33"]),
      capability("CPV", "AVAILABLE_WITH_HUMAN_VALIDATION", ["CPVEngine", "CPVMatcher"], ["La propuesta CPV nunca se auto-valida."]),
      TRANSVERSAL.lots,
      capability("ECONOMICS", "VALIDATED_ENGINE", ["UniversalEconomicEngine", "CONTR/2026/240267"]),
      capability("PROCEDURE", "VALIDATED_ENGINE", ["ProcedimientoEngine"]),
      capability("SOLVENCY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["SolvenciaEngine"]),
      capability("PUBLICITY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["PublicidadEngine"]),
      TRANSVERSAL.award,
      TRANSVERSAL.guarantees,
      capability("EXECUTION", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13", "ejecucion.rules.yaml"], ["Falta motor universal consolidado de ejecución."]),
      TRANSVERSAL.modifications,
      TRANSVERSAL.priceRevision,
      TRANSVERSAL.remedies,
      capability("DOCUMENT_MODEL_SELECTION", "AVAILABLE_WITH_HUMAN_VALIDATION", ["CanonicalDocumentProfileSelector"]),
      capability("EDITABLE_DOCUMENT_GENERATION", "PARTIAL_SOURCE_BACKED", ["protected supply pipeline"]),
      capability("CROSS_DOCUMENT_AUDIT", "PARTIAL_SOURCE_BACKED", ["protected supply package audit"]),
    ],
  },
  {
    contractType: "SERVICE",
    requiredDocuments: [DocumentType.MEMORY, DocumentType.PCAP, DocumentType.PPT, DocumentType.MEANS_INSUFFICIENCY_REPORT],
    realSourceCoverage: "REAL_SOURCES_AVAILABLE",
    capabilities: [
      capability("OBJECT_AND_NEED", "VALIDATED_ENGINE", ["ObjetoEngine"]),
      capability("CPV", "AVAILABLE_WITH_HUMAN_VALIDATION", ["CPVEngine", "service real sources"]),
      TRANSVERSAL.lots,
      capability("ECONOMICS", "PARTIAL_SOURCE_BACKED", ["UniversalEconomicEngine", "service sources"], ["Falta regresión económica general multicaso de servicios."]),
      capability("PROCEDURE", "VALIDATED_ENGINE", ["ProcedimientoEngine"]),
      capability("SOLVENCY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["SolvenciaEngine"]),
      capability("PUBLICITY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["PublicidadEngine"]),
      TRANSVERSAL.award,
      TRANSVERSAL.guarantees,
      capability("EXECUTION", "PARTIAL_SOURCE_BACKED", ["CARL cleaning case", "ejecucion.rules.yaml"], ["Falta motor universal consolidado de ejecución."]),
      TRANSVERSAL.modifications,
      TRANSVERSAL.priceRevision,
      TRANSVERSAL.remedies,
      capability("DOCUMENT_MODEL_SELECTION", "PARTIAL_SOURCE_BACKED", ["CanonicalDocumentProfileSelector", "service PCAP sources"]),
      capability("EDITABLE_DOCUMENT_GENERATION", "PARTIAL_SOURCE_BACKED", ["LB5/LB6 document pipeline"]),
      capability("CROSS_DOCUMENT_AUDIT", "PARTIAL_SOURCE_BACKED", ["existing document gates"]),
    ],
  },
  {
    contractType: "WORKS",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "REAL_SOURCES_AVAILABLE",
    capabilities: [
      capability("OBJECT_AND_NEED", "AVAILABLE_WITH_HUMAN_VALIDATION", ["ObjetoEngine", "PCAP OBRAS ABIERTO real"]),
      capability("CPV", "AVAILABLE_WITH_HUMAN_VALIDATION", ["CPVEngine"]),
      TRANSVERSAL.lots,
      capability("ECONOMICS", "NOT_IMPLEMENTED", ["UniversalEconomicEngine"], ["Falta cerrar mediciones/proyecto, costes y economía específica de obras como perfil universal validado."]),
      capability("PROCEDURE", "AVAILABLE_WITH_HUMAN_VALIDATION", ["ProcedimientoEngine"]),
      capability("SOLVENCY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["SolvenciaEngine"]),
      capability("PUBLICITY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["PublicidadEngine"]),
      TRANSVERSAL.award,
      TRANSVERSAL.guarantees,
      capability("EXECUTION", "NOT_IMPLEMENTED", ["ejecucion.rules.yaml"], ["Falta ejecución específica de obras: proyecto, comprobación de replanteo, certificaciones, recepción y garantías técnicas."]),
      TRANSVERSAL.modifications,
      TRANSVERSAL.priceRevision,
      TRANSVERSAL.remedies,
      capability("DOCUMENT_MODEL_SELECTION", "PARTIAL_SOURCE_BACKED", ["PCAP OBRAS ABIERTO real", "CanonicalDocumentProfileSelector"]),
      capability("EDITABLE_DOCUMENT_GENERATION", "NOT_IMPLEMENTED", ["PCAP OBRAS ABIERTO real"], ["Debe verificarse un activo editable de obras y su pipeline antes de generar."]),
      capability("CROSS_DOCUMENT_AUDIT", "NOT_IMPLEMENTED", [], ["Falta auditoría cruzada específica de obras."]),
    ],
  },
  {
    contractType: "CONCESSION",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "LEGAL_SOURCE_ONLY",
    capabilities: [
      capability("OBJECT_AND_NEED", "AVAILABLE_WITH_HUMAN_VALIDATION", ["ObjetoEngine", "LCSP arts. 14-15"]),
      capability("CPV", "AVAILABLE_WITH_HUMAN_VALIDATION", ["CPVEngine"]),
      TRANSVERSAL.lots,
      capability("ECONOMICS", "NOT_IMPLEMENTED", [], ["Falta modelo económico de concesión, riesgo operacional, ingresos, inversiones y recuperación."]),
      capability("PROCEDURE", "NOT_IMPLEMENTED", [], ["La cobertura actual de ProcedimientoEngine no se declara suficiente para concesiones."]),
      capability("SOLVENCY", "PARTIAL_SOURCE_BACKED", ["SolvenciaEngine"], ["Falta calibración específica de concesiones."]),
      capability("PUBLICITY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["PublicidadEngine"]),
      TRANSVERSAL.award,
      TRANSVERSAL.guarantees,
      capability("EXECUTION", "NOT_IMPLEMENTED", [], ["Falta riesgo operacional, tarifas, equilibrio, secuestro/intervención y régimen concesional específico."]),
      capability("MODIFICATIONS", "PARTIAL_SOURCE_BACKED", ["UniversalModificationEngine"], ["Los arts. 203-207 son base común, pero faltan reglas específicas del régimen concesional."]),
      TRANSVERSAL.priceRevision,
      TRANSVERSAL.remedies,
      capability("DOCUMENT_MODEL_SELECTION", "NOT_IMPLEMENTED", [], ["No se ha acreditado todavía un modelo real de concesión en las fuentes recuperadas."]),
      capability("EDITABLE_DOCUMENT_GENERATION", "NOT_IMPLEMENTED", [], ["Sin modelo acreditado no se habilita generación."]),
      capability("CROSS_DOCUMENT_AUDIT", "NOT_IMPLEMENTED", [], ["Falta auditoría cruzada concesional."]),
    ],
  },
  {
    contractType: "MIXED",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "REAL_SOURCES_AVAILABLE",
    capabilities: [
      capability("OBJECT_AND_NEED", "PARTIAL_SOURCE_BACKED", ["CARL cleaning mixed service/supply case"]),
      capability("CPV", "AVAILABLE_WITH_HUMAN_VALIDATION", ["CPVEngine"]),
      TRANSVERSAL.lots,
      capability("ECONOMICS", "PARTIAL_SOURCE_BACKED", ["CARL cleaning mixed service/supply case", "UniversalEconomicEngine"], ["Debe separar prestaciones y conservar la principal."]),
      capability("PROCEDURE", "PARTIAL_SOURCE_BACKED", ["ProcedimientoEngine", "CARL cleaning mixed service/supply case"], ["Debe determinarse primero la prestación principal y régimen del art. 18."]),
      capability("SOLVENCY", "PARTIAL_SOURCE_BACKED", ["SolvenciaEngine"]),
      capability("PUBLICITY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["PublicidadEngine"]),
      TRANSVERSAL.award,
      capability("GUARANTEES", "PARTIAL_SOURCE_BACKED", ["UniversalGuaranteeEngine"], ["Debe conocer el régimen aplicable derivado de la prestación principal antes de cerrar excepciones."]),
      capability("EXECUTION", "NOT_IMPLEMENTED", ["CARL cleaning mixed service/supply case"], ["Falta orquestación de obligaciones de prestaciones heterogéneas."]),
      capability("MODIFICATIONS", "PARTIAL_SOURCE_BACKED", ["UniversalModificationEngine"], ["Debe preservarse la naturaleza global y la prestación principal."]),
      capability("PRICE_REVISION", "PARTIAL_SOURCE_BACKED", ["UniversalPriceRevisionEngine"], ["Debe resolverse la prestación principal y el régimen aplicable."]),
      TRANSVERSAL.remedies,
      capability("DOCUMENT_MODEL_SELECTION", "NOT_IMPLEMENTED", ["CARL cleaning mixed service/supply case"], ["Falta selector formal de modelo según prestación principal y combinación contractual."]),
      capability("EDITABLE_DOCUMENT_GENERATION", "NOT_IMPLEMENTED", [], ["Falta pipeline mixto general."]),
      capability("CROSS_DOCUMENT_AUDIT", "NOT_IMPLEMENTED", [], ["Falta auditoría cruzada que preserve la estructura mixta."]),
    ],
  },
] as const;

export interface UniversalCoverageGap { contractType: UniversalTargetContractType; capability: UniversalCapability; status: UniversalCoverageStatus; reason: string; }

export function getContractFamilyCoverage(contractType: UniversalTargetContractType): ContractFamilyCoverage {
  const coverage = UNIVERSAL_CONTRACT_COVERAGE.find(item => item.contractType === contractType);
  if (!coverage) throw new Error(`Cobertura no registrada para ${contractType}`);
  return coverage;
}

export function getOperationalCoverageGaps(contractType?: UniversalTargetContractType): readonly UniversalCoverageGap[] {
  const families = contractType ? [getContractFamilyCoverage(contractType)] : UNIVERSAL_CONTRACT_COVERAGE;
  return families.flatMap(family => family.capabilities
    .filter(item => item.criticalForOperationalClaim && item.status !== "VALIDATED_ENGINE" && item.status !== "AVAILABLE_WITH_HUMAN_VALIDATION")
    .map(item => ({ contractType: family.contractType, capability: item.capability, status: item.status, reason: item.notes[0] ?? `Cobertura ${item.status} todavía insuficiente para una afirmación operativa universal.` })));
}

export function canClaimUniversalOperationalCoverage(): boolean {
  return getOperationalCoverageGaps().length === 0;
}
