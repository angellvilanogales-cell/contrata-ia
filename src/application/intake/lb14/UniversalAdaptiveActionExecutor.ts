import { AdaptiveProcurementFlow } from "../lb7/AdaptiveProcurementFlow";
import { DeadlineRule } from "../../../domain/legal/modules/plazos/DeadlineRule";
import { EvidenceField, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalExpedienteEngine, UniversalEngineRunResult } from "../../../engines/UniversalExpedienteEngine";
import { UniversalAdaptiveAction } from "./UniversalAdaptiveQuestionEngine";

export interface UniversalAdaptiveEnginePort {
  ejecutarIdentificacion(expediente: UniversalExpedienteV13): UniversalEngineRunResult;
  resolverPlazos(expediente: UniversalExpedienteV13, rules: DeadlineRule[]): UniversalEngineRunResult;
}

export interface AdaptiveActionExecutionResult extends UniversalEngineRunResult {
  action: UniversalAdaptiveAction;
}

function proposal<T>(key: string, value: T, sourceId: string, diagnostic: string): EvidenceField<T> {
  return {
    key,
    value,
    status: "SYSTEM_PROPOSAL",
    sources: [{ kind: "SYSTEM_PROPOSAL", sourceId }],
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics: [diagnostic],
  };
}

function appendSource(expediente: UniversalExpedienteV13, source: EvidenceReference): UniversalExpedienteV13 {
  if (expediente.traceability.sourceRegistry.some(item => item.kind === source.kind && item.sourceId === source.sourceId)) {
    return expediente;
  }
  return {
    ...expediente,
    traceability: {
      ...expediente.traceability,
      sourceRegistry: [...expediente.traceability.sourceRegistry, source],
    },
  };
}

function classifyContractNature(expediente: UniversalExpedienteV13): UniversalEngineRunResult {
  const object = expediente.canonical.fields.object.value?.trim();
  if (!object) {
    return {
      expediente,
      executed: [],
      blockers: ["No puede clasificarse la naturaleza contractual sin una descripción de la necesidad."],
    };
  }

  const decision = new AdaptiveProcurementFlow().analyze({ needAndPurpose: object });
  const mapped = decision.contractNature === "SERVICES"
    ? "SERVICE"
    : decision.contractNature === "SUPPLIES"
      ? "SUPPLY"
      : decision.contractNature === "WORKS"
        ? "WORKS"
        : null;

  if (!mapped) {
    return {
      expediente,
      executed: [],
      blockers: ["La descripción disponible no permite proponer con suficiente determinación la naturaleza contractual."],
    };
  }

  const sourceId = "AdaptiveProcurementFlow:contract-nature";
  const updated: UniversalExpedienteV13 = {
    ...expediente,
    canonical: {
      ...expediente.canonical,
      fields: {
        ...expediente.canonical.fields,
        contractType: proposal(
          "contractType",
          mapped,
          sourceId,
          `${decision.contractNatureReason} La clasificación es una propuesta automática y requiere validación humana.`,
        ),
      },
    },
  };

  return {
    expediente: appendSource(updated, { kind: "SYSTEM_PROPOSAL", sourceId }),
    executed: ["CONTRACT_NATURE_CLASSIFIER"],
    blockers: [],
  };
}

export class UniversalAdaptiveActionExecutor {
  constructor(
    private readonly expedienteEngine: UniversalAdaptiveEnginePort,
    private readonly deadlineRules: readonly DeadlineRule[] = [],
  ) {}

  public execute(
    expediente: UniversalExpedienteV13,
    action: UniversalAdaptiveAction,
  ): AdaptiveActionExecutionResult {
    if (action.kind !== "RUN_ENGINE" || !action.engine) {
      throw new Error("Solo pueden ejecutarse automáticamente acciones RUN_ENGINE con motor explícito.");
    }

    let result: UniversalEngineRunResult;
    switch (action.engine) {
      case "CONTRACT_NATURE_CLASSIFIER":
        result = classifyContractNature(expediente);
        break;
      case "CPVEngine":
      case "ProcedimientoEngine":
        result = this.expedienteEngine.ejecutarIdentificacion(expediente);
        break;
      case "DeadlineDecisionEngine":
        result = this.expedienteEngine.resolverPlazos(expediente, [...this.deadlineRules]);
        break;
      default: {
        const exhaustive: never = action.engine;
        throw new Error(`Motor adaptativo no soportado: ${String(exhaustive)}`);
      }
    }

    return { ...result, action };
  }
}

export function createUniversalAdaptiveActionExecutor(
  expedienteEngine: UniversalExpedienteEngine,
  deadlineRules: readonly DeadlineRule[] = [],
): UniversalAdaptiveActionExecutor {
  return new UniversalAdaptiveActionExecutor(expedienteEngine, deadlineRules);
}
