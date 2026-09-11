import {
  CapabilityCoverage,
  ContractFamilyCoverage,
  UniversalCapability,
  UniversalCoverageStatus,
  UniversalTargetContractType,
  getContractFamilyCoverage,
} from "./UniversalContractCoverage";

interface CoverageOverride {
  status: UniversalCoverageStatus;
  evidence: readonly string[];
  notes: readonly string[];
}

type OverrideMap = Partial<Record<UniversalCapability, CoverageOverride>>;

const OVERRIDES: Readonly<Partial<Record<UniversalTargetContractType, OverrideMap>>> = {
  SUPPLY: {
    EXECUTION: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalExecutionEngine", "golden supply DA33"], notes: ["El motor valida condiciones aportadas; no redacta automáticamente decisiones materiales."] },
    CROSS_DOCUMENT_AUDIT: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalAdministrativePackageAudit", "protected supply package audit"], notes: ["El audit universal exige hechos mínimos y el caso protegido conserva controles adicionales."] },
  },
  SERVICE: {
    EXECUTION: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalExecutionEngine", "ejecucion.rules.yaml", "service real sources"], notes: ["La configuración concreta permanece vinculada al objeto y validada humanamente."] },
    CROSS_DOCUMENT_AUDIT: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalAdministrativePackageAudit"], notes: ["Disponible auditoría semántica de Memoria-PCAP-PPT; la extracción física debe ser trazable."] },
  },
  WORKS: {
    ECONOMICS: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalWorksEconomicEngine", "UniversalEconomicEngine", "real works sources"], notes: ["Exige proyecto aprobado y mediciones; conserva VE declarado y audita diferencias."] },
    EXECUTION: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalWorksExecutionEngine", "LCSP arts. 237-244"], notes: ["Valida replanteo, dirección facultativa, certificaciones, recepción, garantía y vicios ocultos; no sustituye el proyecto ni la dirección técnica."] },
    CROSS_DOCUMENT_AUDIT: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalAdministrativePackageAudit"], notes: ["Exige identidad y versión del proyecto en Memoria-PCAP-PPT."] },
  },
  CONCESSION: {
    ECONOMICS: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalConcessionEconomicEngine", "LCSP art. 101"], notes: ["Calcula desde cifra neta de negocios y evita doble contabilización, pero falta calibración con expediente real de concesión."] },
    PROCEDURE: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalConcessionProcedureEngine", "LCSP arts. 131 y 156-177"], notes: ["Valida abierto/restringido y bloquea procedimientos excepcionales sin supuesto legal documentado; el art. 159 no se extiende a concesiones."] },
    EXECUTION: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalConcessionExecutionEngine", "LCSP arts. 251-270 y 286-297"], notes: ["Preserva riesgo operacional, régimen económico, controles, reequilibrio y especialidades de obras/servicios; no fabrica tarifas ni causas de intervención."] },
    CROSS_DOCUMENT_AUDIT: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalAdministrativePackageAudit"], notes: ["Exige subtipo, riesgo operacional y estudio de viabilidad; no sustituye la falta de modelo real."] },
  },
  MIXED: {
    CROSS_DOCUMENT_AUDIT: { status: "AVAILABLE_WITH_HUMAN_VALIDATION", evidence: ["UniversalAdministrativePackageAudit", "CARL mixed source"], notes: ["Exige prestación principal y estructura de componentes en los documentos correspondientes."] },
  },
};

function applyOverride(item: CapabilityCoverage, override?: CoverageOverride): CapabilityCoverage {
  return override ? { ...item, ...override } : item;
}

/** Vista efectiva tras LB91; conserva bloqueos documentales y de evidencia aunque exista motor técnico. */
export function getReconciledContractFamilyCoverage(contractType: UniversalTargetContractType): ContractFamilyCoverage {
  const baseline = getContractFamilyCoverage(contractType);
  const overrides = OVERRIDES[contractType] ?? {};
  return { ...baseline, capabilities: baseline.capabilities.map(item => applyOverride(item, overrides[item.capability])) };
}

export function getReconciledOperationalGaps(contractType?: UniversalTargetContractType) {
  const types: readonly UniversalTargetContractType[] = contractType ? [contractType] : ["SUPPLY", "SERVICE", "WORKS", "CONCESSION", "MIXED"];
  return types.flatMap(type => getReconciledContractFamilyCoverage(type).capabilities
    .filter(item => item.criticalForOperationalClaim && item.status !== "VALIDATED_ENGINE" && item.status !== "AVAILABLE_WITH_HUMAN_VALIDATION")
    .map(item => ({ contractType: type, capability: item.capability, status: item.status, reason: item.notes[0] ?? `Cobertura ${item.status} insuficiente.` })));
}

export function canClaimReconciledUniversalOperationalCoverage(): boolean {
  return getReconciledOperationalGaps().length === 0;
}
