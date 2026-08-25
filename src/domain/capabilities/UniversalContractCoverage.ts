import { CanonicalContractType } from "../expediente/CanonicalExpedienteState";
import { DocumentType } from "../documentModel/DocumentType";

/**
 * LB91.1 - Matriz conservadora de cobertura universal.
 *
 * Esta matriz no convierte ejemplos ni motores existentes en doctrina jurídica.
 * Describe qué capacidades están materialmente disponibles y qué huecos impiden
 * afirmar cobertura operativa universal. La generación definitiva mantiene la
 * validación humana y los gates documentales existentes.
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
  "OBJECT_AND_NEED",
  "CPV",
  "LOTS",
  "ECONOMICS",
  "PROCEDURE",
  "SOLVENCY",
  "PUBLICITY",
  "AWARD_CRITERIA",
  "GUARANTEES",
  "EXECUTION",
  "MODIFICATIONS",
  "PRICE_REVISION",
  "REMEDIES",
  "DOCUMENT_MODEL_SELECTION",
  "EDITABLE_DOCUMENT_GENERATION",
  "CROSS_DOCUMENT_AUDIT",
];

function capability(
  name: UniversalCapability,
  status: UniversalCoverageStatus,
  evidence: readonly string[],
  notes: readonly string[] = [],
): CapabilityCoverage {
  return {
    capability: name,
    status,
    criticalForOperationalClaim: CORE_CAPABILITIES.includes(name),
    evidence,
    notes,
  };
}

export const UNIVERSAL_CONTRACT_COVERAGE: readonly ContractFamilyCoverage[] = [
  {
    contractType: "SUPPLY",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "VALIDATED_CASE",
    capabilities: [
      capability("OBJECT_AND_NEED", "VALIDATED_ENGINE", ["ObjetoEngine", "golden supply DA33"]),
      capability("CPV", "AVAILABLE_WITH_HUMAN_VALIDATION", ["CPVEngine", "CPVMatcher"], ["La propuesta CPV nunca se auto-valida."]),
      capability("LOTS", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13", "supply multi-case sources"]),
      capability("ECONOMICS", "VALIDATED_ENGINE", ["UniversalEconomicEngine", "CONTR/2026/240267"]),
      capability("PROCEDURE", "VALIDATED_ENGINE", ["ProcedimientoEngine"]),
      capability("SOLVENCY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["SolvenciaEngine"]),
      capability("PUBLICITY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["PublicidadEngine"]),
      capability("AWARD_CRITERIA", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13", "supply regression cases"]),
      capability("GUARANTEES", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13"]),
      capability("EXECUTION", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13"]),
      capability("MODIFICATIONS", "PARTIAL_SOURCE_BACKED", ["golden supply DA33", "UniversalEconomicEngine"]),
      capability("PRICE_REVISION", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13"]),
      capability("REMEDIES", "NOT_IMPLEMENTED", [], ["Falta motor universal de recursos/revisión especial."]),
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
      capability("LOTS", "PARTIAL_SOURCE_BACKED", ["CARL cleaning case"]),
      capability("ECONOMICS", "PARTIAL_SOURCE_BACKED", ["UniversalEconomicEngine", "service sources"]),
      capability("PROCEDURE", "VALIDATED_ENGINE", ["ProcedimientoEngine"]),
      capability("SOLVENCY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["SolvenciaEngine"]),
      capability("PUBLICITY", "AVAILABLE_WITH_HUMAN_VALIDATION", ["PublicidadEngine"]),
      capability("AWARD_CRITERIA", "PARTIAL_SOURCE_BACKED", ["CARL cleaning case"]),
      capability("GUARANTEES", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13"]),
      capability("EXECUTION", "PARTIAL_SOURCE_BACKED", ["CARL cleaning case", "UniversalExpedienteV13"]),
      capability("MODIFICATIONS", "PARTIAL_SOURCE_BACKED", ["CARL cleaning case"]),
      capability("PRICE_REVISION", "PARTIAL_SOURCE_BACKED", ["UniversalExpedienteV13"]),
      capability("REMEDIES", "NOT_IMPLEMENTED", []),
      capability("DOCUMENT_MODEL_SELECTION", "PARTIAL_SOURCE_BACKED", ["CanonicalDocumentProfileSelector", "service PCAP sources"]),
      capability("EDITABLE_DOCUMENT_GENERATION", "PARTIAL_SOURCE_BACKED", ["LB5/LB6 document pipeline"]),
      capability("CROSS_DOCUMENT_AUDIT", "PARTIAL_SOURCE_BACKED", ["existing document gates"]),
    ],
  },
  {
    contractType: "WORKS",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "LEGAL_SOURCE_ONLY",
    capabilities: CORE_CAPABILITIES.map(name => capability(
      name,
      ["OBJECT_AND_NEED", "CPV", "PROCEDURE", "PUBLICITY"].includes(name)
        ? "AVAILABLE_WITH_HUMAN_VALIDATION"
        : "NOT_IMPLEMENTED",
      ["LCSP arts. 12-13 and universal base architecture"],
      name === "EDITABLE_DOCUMENT_GENERATION" ? ["No se ha acreditado todavía un modelo real de obras en las fuentes recuperadas."] : [],
    )),
  },
  {
    contractType: "CONCESSION",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "LEGAL_SOURCE_ONLY",
    capabilities: CORE_CAPABILITIES.map(name => capability(
      name,
      ["OBJECT_AND_NEED", "CPV", "PUBLICITY"].includes(name)
        ? "AVAILABLE_WITH_HUMAN_VALIDATION"
        : "NOT_IMPLEMENTED",
      ["LCSP arts. 14-15 and universal base architecture"],
      ["La transferencia del riesgo operacional, duración y equilibrio económico requieren módulo específico."],
    )),
  },
  {
    contractType: "MIXED",
    requiredDocuments: COMMON_DOCUMENTS,
    realSourceCoverage: "REAL_SOURCES_AVAILABLE",
    capabilities: CORE_CAPABILITIES.map(name => capability(
      name,
      ["OBJECT_AND_NEED", "CPV", "LOTS", "PROCEDURE"].includes(name)
        ? "PARTIAL_SOURCE_BACKED"
        : "NOT_IMPLEMENTED",
      ["CARL cleaning mixed service/supply case"],
      ["Debe conservarse la prestación principal y no heredar automáticamente reglas de una prestación accesoria."],
    )),
  },
] as const;

export interface UniversalCoverageGap {
  contractType: UniversalTargetContractType;
  capability: UniversalCapability;
  status: UniversalCoverageStatus;
  reason: string;
}

export function getContractFamilyCoverage(contractType: UniversalTargetContractType): ContractFamilyCoverage {
  const coverage = UNIVERSAL_CONTRACT_COVERAGE.find(item => item.contractType === contractType);
  if (!coverage) throw new Error(`Cobertura no registrada para ${contractType}`);
  return coverage;
}

export function getOperationalCoverageGaps(contractType?: UniversalTargetContractType): readonly UniversalCoverageGap[] {
  const families = contractType ? [getContractFamilyCoverage(contractType)] : UNIVERSAL_CONTRACT_COVERAGE;
  return families.flatMap(family => family.capabilities
    .filter(item => item.criticalForOperationalClaim && item.status !== "VALIDATED_ENGINE" && item.status !== "AVAILABLE_WITH_HUMAN_VALIDATION")
    .map(item => ({
      contractType: family.contractType,
      capability: item.capability,
      status: item.status,
      reason: item.notes[0] ?? `Cobertura ${item.status} todavía insuficiente para una afirmación operativa universal.`,
    })));
}

export function canClaimUniversalOperationalCoverage(): boolean {
  return getOperationalCoverageGaps().length === 0;
}
