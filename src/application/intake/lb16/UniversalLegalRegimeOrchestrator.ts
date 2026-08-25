import { isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { DeadlineRule } from "../../../domain/legal/modules/plazos/DeadlineRule";
import { UniversalEngineRunResult } from "../../../engines/UniversalExpedienteEngine";
import { evaluateEconomicLegalClosure } from "../lb15/UniversalEconomicLegalClosureGate";

export type UniversalLegalRegimeStage =
  | "BLOCKED_LB15"
  | "RUN_REGIME_ENGINES"
  | "VALIDATE_REGIME_PROPOSALS"
  | "NEEDS_REGIME_EVIDENCE"
  | "NEEDS_DEADLINE_INPUT"
  | "NEEDS_DEADLINE_RULES"
  | "RUN_DEADLINE_ENGINE"
  | "VALIDATE_DEADLINE_PROPOSAL"
  | "COMPLETE";

export interface UniversalLegalRegimeEnginePort {
  ejecutarRegimen(expediente: UniversalExpedienteV13): UniversalEngineRunResult;
  resolverPlazos(expediente: UniversalExpedienteV13, rules: DeadlineRule[]): UniversalEngineRunResult;
}

export interface UniversalLegalRegimeAdvanceResult {
  expediente: UniversalExpedienteV13;
  stage: UniversalLegalRegimeStage;
  executed: readonly string[];
  blockers: readonly string[];
  missingFields: readonly string[];
}

function deadlineMissing(expediente: UniversalExpedienteV13): string[] {
  const fields = [
    expediente.processing.processingType,
    expediente.regulation.harmonizedRegulation,
    expediente.processing.urgency,
    expediente.processing.emergency,
    expediente.regulation.europeanFunding,
  ];
  return fields.filter(field => !isPromotableEvidenceField(field) || field.value === null).map(field => field.key);
}

/**
 * Bloque 16 - orquestación universal del régimen jurídico posterior al cierre
 * económico. Reutiliza motores existentes pero añade puertas para impedir que
 * éstos sobrescriban evidencia previa o trabajen con hechos jurídicos inventados.
 */
export class UniversalLegalRegimeOrchestrator {
  constructor(private readonly engine: UniversalLegalRegimeEnginePort) {}

  public advance(
    expediente: UniversalExpedienteV13,
    deadlineRules: readonly DeadlineRule[] = [],
  ): UniversalLegalRegimeAdvanceResult {
    const economicLegal = evaluateEconomicLegalClosure(expediente);
    if (!economicLegal.ready) {
      return { expediente, stage: "BLOCKED_LB15", executed: [], blockers: economicLegal.blockers, missingFields: [] };
    }

    const solvency = expediente.canonical.fields.solvency;
    const publicity = expediente.canonical.fields.publicity;
    if (solvency.status === "SOURCE_CONFLICT" || publicity?.status === "SOURCE_CONFLICT") {
      return {
        expediente,
        stage: "NEEDS_REGIME_EVIDENCE",
        executed: [],
        blockers: ["Solvencia o publicidad mantienen un conflicto de fuente; el Bloque 16 no los sustituye automáticamente."],
        missingFields: [],
      };
    }

    const publicityField = publicity;
    const solvencyPending = solvency.status === "PENDING";
    const publicityPending = !publicityField || publicityField.status === "PENDING";
    if (solvencyPending && publicityPending) {
      const result = this.engine.ejecutarRegimen(expediente);
      if (result.blockers.length > 0) {
        return { expediente: result.expediente, stage: "RUN_REGIME_ENGINES", executed: result.executed, blockers: result.blockers, missingFields: [] };
      }
      return {
        expediente: result.expediente,
        stage: "VALIDATE_REGIME_PROPOSALS",
        executed: result.executed,
        blockers: [],
        missingFields: [],
      };
    }

    if (
      solvency.status === "SYSTEM_PROPOSAL" ||
      publicityField?.status === "SYSTEM_PROPOSAL"
    ) {
      return { expediente, stage: "VALIDATE_REGIME_PROPOSALS", executed: [], blockers: [], missingFields: [] };
    }

    if (!isPromotableEvidenceField(solvency) || !publicityField || !isPromotableEvidenceField(publicityField)) {
      const missing: string[] = [];
      if (!isPromotableEvidenceField(solvency)) missing.push(solvency.key);
      if (!publicityField || !isPromotableEvidenceField(publicityField)) missing.push(publicityField?.key ?? "publicity");
      return {
        expediente,
        stage: "NEEDS_REGIME_EVIDENCE",
        executed: [],
        blockers: ["No se ejecutan conjuntamente SolvenciaEngine/PublicidadEngine sobre un paquete parcialmente protegido; debe completarse o validarse la evidencia existente."],
        missingFields: missing,
      };
    }

    const missingDeadline = deadlineMissing(expediente);
    if (missingDeadline.length > 0) {
      return { expediente, stage: "NEEDS_DEADLINE_INPUT", executed: [], blockers: [], missingFields: missingDeadline };
    }

    const deadlines = expediente.regulation.deadlines;
    if (deadlines.status === "SOURCE_CONFLICT") {
      return {
        expediente,
        stage: "VALIDATE_DEADLINE_PROPOSAL",
        executed: [],
        blockers: ["Los plazos contienen conflicto de fuente y no pueden recalcularse para ocultarlo."],
        missingFields: [],
      };
    }
    if (deadlines.status === "SYSTEM_PROPOSAL") {
      return { expediente, stage: "VALIDATE_DEADLINE_PROPOSAL", executed: [], blockers: [], missingFields: [] };
    }
    if (isPromotableEvidenceField(deadlines) && deadlines.value !== null) {
      return { expediente, stage: "COMPLETE", executed: [], blockers: [], missingFields: [] };
    }

    if (deadlineRules.length === 0) {
      return { expediente, stage: "NEEDS_DEADLINE_RULES", executed: [], blockers: [], missingFields: ["deadlineRules"] };
    }

    const result = this.engine.resolverPlazos(expediente, [...deadlineRules]);
    if (result.blockers.length > 0) {
      return { expediente: result.expediente, stage: "RUN_DEADLINE_ENGINE", executed: result.executed, blockers: result.blockers, missingFields: [] };
    }
    return {
      expediente: result.expediente,
      stage: result.expediente.regulation.deadlines.status === "SYSTEM_PROPOSAL" ? "VALIDATE_DEADLINE_PROPOSAL" : "COMPLETE",
      executed: result.executed,
      blockers: [],
      missingFields: [],
    };
  }
}

export interface UniversalLegalRegimeClosureResult {
  ready: boolean;
  blockers: readonly string[];
}

/** Cierre del Bloque 16: no muta el expediente y no convierte pendientes en datos confirmados. */
export function evaluateUniversalLegalRegimeClosure(expediente: UniversalExpedienteV13): UniversalLegalRegimeClosureResult {
  const blockers = [...evaluateEconomicLegalClosure(expediente).blockers];
  const required = [
    expediente.canonical.fields.solvency,
    expediente.canonical.fields.publicity,
    expediente.processing.processingType,
    expediente.processing.urgency,
    expediente.processing.emergency,
    expediente.regulation.europeanFunding,
    expediente.regulation.deadlines,
  ].filter(Boolean);

  for (const field of required) {
    if (!field || field.status === "SOURCE_CONFLICT") {
      blockers.push(`Campo jurídico bloqueado por conflicto: ${field?.key ?? "desconocido"}.`);
      continue;
    }
    if (!isPromotableEvidenceField(field) || field.value === null) {
      blockers.push(`Campo jurídico pendiente de promoción/validación: ${field.key}.`);
    }
  }

  return { ready: blockers.length === 0, blockers };
}
