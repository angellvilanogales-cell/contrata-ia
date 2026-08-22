import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalAdaptiveActionExecutor } from "./UniversalAdaptiveActionExecutor";
import { UniversalAdaptiveAction, UniversalAdaptiveQuestionEngine } from "./UniversalAdaptiveQuestionEngine";
import { UniversalEconomicAdaptiveBridge } from "./UniversalEconomicAdaptiveBridge";

export interface AdaptiveAutomaticStep {
  actionId: string;
  engine: string;
  executed: readonly string[];
}

export interface UniversalAdaptiveAdvanceResult {
  expediente: UniversalExpedienteV13;
  next: UniversalAdaptiveAction;
  automaticSteps: readonly AdaptiveAutomaticStep[];
  blockers: readonly string[];
}

export class UniversalAdaptiveOrchestrator {
  constructor(
    private readonly planner: UniversalAdaptiveQuestionEngine,
    private readonly executor: UniversalAdaptiveActionExecutor,
    private readonly maxAutomaticSteps = 8,
    private readonly economicBridge?: UniversalEconomicAdaptiveBridge,
  ) {}

  public advance(expediente: UniversalExpedienteV13): UniversalAdaptiveAdvanceResult {
    let current = expediente;
    const automaticSteps: AdaptiveAutomaticStep[] = [];

    for (let index = 0; index < this.maxAutomaticSteps; index += 1) {
      if (this.economicBridge) {
        const economic = this.economicBridge.tryAdvance(current);
        if (economic.blockers.length > 0) {
          return {
            expediente: economic.expediente,
            next: this.planner.next(economic.expediente),
            automaticSteps,
            blockers: economic.blockers,
          };
        }
        if (economic.executed) {
          automaticSteps.push({
            actionId: "run:economic-value",
            engine: "UniversalEconomicEngine",
            executed: economic.executedEngines,
          });
          current = economic.expediente;
          continue;
        }
      }

      const action = this.planner.next(current);
      if (action.kind !== "RUN_ENGINE") {
        return { expediente: current, next: action, automaticSteps, blockers: [] };
      }

      const execution = this.executor.execute(current, action);
      automaticSteps.push({
        actionId: action.id,
        engine: action.engine ?? "UNKNOWN",
        executed: execution.executed,
      });

      if (execution.blockers.length > 0) {
        return {
          expediente: execution.expediente,
          next: action,
          automaticSteps,
          blockers: execution.blockers,
        };
      }

      if (execution.executed.length === 0) {
        return {
          expediente: execution.expediente,
          next: action,
          automaticSteps,
          blockers: [`La acción automática ${action.id} no ejecutó ningún motor y se detuvo para evitar un bucle.`],
        };
      }

      current = execution.expediente;
    }

    return {
      expediente: current,
      next: this.planner.next(current),
      automaticSteps,
      blockers: [`Se alcanzó el límite de ${this.maxAutomaticSteps} acciones automáticas consecutivas.`],
    };
  }
}
