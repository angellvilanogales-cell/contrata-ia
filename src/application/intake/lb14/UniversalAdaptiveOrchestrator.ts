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

function pendingEconomicQuestion(expediente: UniversalExpedienteV13, missingFields: readonly string[]): UniversalAdaptiveAction | null {
  const field = missingFields[0];
  if (!field) return null;

  if (field === "economic.initialEstimatedValueBaseCents") {
    return {
      kind: "ASK_USER",
      id: "ask:ve-initial-base",
      fieldKey: field,
      question: "¿Cuál es el importe inicial que debe computarse en el valor estimado, sin IVA?",
      help: "Indique el importe económico de la prestación inicial. No se copiará automáticamente desde el PBL ni desde el presupuesto máximo si no consta que sean la misma magnitud.",
      reason: "El motor económico necesita una base inicial expresa para calcular el VE sin crear equivalencias jurídicas silenciosas.",
      priority: "NORMAL",
    };
  }

  if (field === "economic.extensionAmountExVatCents") {
    return {
      kind: "ASK_USER",
      id: "ask:ve-extension-amount",
      fieldKey: field,
      question: `Se han previsto ${String(expediente.canonical.fields.extensionMonths.value ?? "varios")} meses de prórroga. ¿Cuál es el importe económico total de esas prórrogas, sin IVA?`,
      help: "No se extrapola el importe desde los meses de duración. Debe aportarse el importe económico previsto o procedente de la fuente correspondiente.",
      reason: "Una duración temporal positiva no determina por sí sola el valor económico de la prórroga.",
      priority: "NORMAL",
    };
  }

  if (field === "economic.modificationAmountExVatCents") {
    const modificationPercent = expediente.canonical.fields.modificationPercent;
    if (modificationPercent.status === "PENDING") {
      return {
        kind: "ASK_USER",
        id: "ask:modification-percent-for-ve",
        fieldKey: modificationPercent.key,
        question: "¿Se prevén modificaciones y cuál es su porcentaje máximo computable?",
        help: "Indique 0 si no se prevén. Si existe un porcentaje positivo y una base económica validada, el sistema propondrá el importe aritmético para validación humana.",
        reason: "El porcentaje de modificación es necesario antes de poder proponer su componente económico.",
        priority: "NORMAL",
      };
    }
    return {
      kind: "ASK_USER",
      id: "ask:ve-modification-amount",
      fieldKey: field,
      question: "¿Cuál es el importe máximo de las modificaciones que debe computarse en el valor estimado, sin IVA?",
      help: "Aporte el importe cuando el porcentaje no pueda aplicarse con seguridad sobre la base económica disponible.",
      reason: "No existe una base suficientemente acreditada para derivar automáticamente el importe de modificación.",
      priority: "NORMAL",
    };
  }

  if (field === "economic.optionsAmountExVatCents") {
    return {
      kind: "ASK_USER",
      id: "ask:ve-options-amount",
      fieldKey: field,
      question: "¿Existen opciones u otros derechos económicos previstos que deban computarse en el valor estimado y cuál es su importe sin IVA?",
      help: "Indique 0 si no existen opciones computables.",
      reason: "Las opciones solo se incorporan al VE cuando existe un importe económico explícito.",
      priority: "NORMAL",
    };
  }

  if (field === "economic.otherEstimatedValueComponentsCents") {
    return {
      kind: "ASK_USER",
      id: "ask:ve-other-components",
      fieldKey: field,
      question: "¿Existe algún otro componente económico que deba integrarse en el valor estimado y cuál es su importe sin IVA?",
      help: "Indique 0 si no existe ningún otro componente computable.",
      reason: "El motor no incorpora conceptos económicos no declarados.",
      priority: "NORMAL",
    };
  }

  return null;
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
      let economicMissingFields: readonly string[] = [];
      if (this.economicBridge) {
        const economic = this.economicBridge.tryAdvance(current);
        current = economic.expediente;
        economicMissingFields = economic.missingFields;
        if (economic.blockers.length > 0) {
          return {
            expediente: current,
            next: this.planner.next(current),
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
          continue;
        }
      }

      const action = this.planner.next(current);
      if (action.kind !== "RUN_ENGINE") {
        if (action.id === "ask:estimated-value") {
          const economicQuestion = pendingEconomicQuestion(current, economicMissingFields);
          if (economicQuestion) {
            return { expediente: current, next: economicQuestion, automaticSteps, blockers: [] };
          }
        }
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
