import { CPVEngine } from "./CPVEngine";
import { ProcedimientoEngine } from "./ProcedimientoEngine";
import { CanonicalExpedienteState } from "../domain/expediente/CanonicalExpedienteState";
import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";
import { promoteEngineProposal, promoteNormativeEngineDecision } from "./CanonicalEnginePromotion";

export interface CanonicalEngineRunResult {
  state: CanonicalExpedienteState;
  context: ExpedienteContext;
  executed: readonly string[];
}

function toLegacyContext(state: CanonicalExpedienteState): ExpedienteContext {
  const context = new ExpedienteContext();
  context.expediente = state.id;
  context.objeto = state.fields.object.value ?? "";
  context.tipoContrato = state.fields.contractType.value ?? "";
  context.valorEstimado = (state.fields.estimatedValueCents.value ?? 0) / 100;
  context.presupuestoBase = (state.fields.baseTenderBudgetCents.value ?? 0) / 100;
  context.duracionMeses = state.fields.durationMonths.value ?? 0;
  context.prorrogas = state.fields.extensionMonths.value ?? 0;
  context.divisionLotes = (state.fields.lots.value?.length ?? 0) > 1;
  context.criterios = state.fields.awardCriteria.value ? [...state.fields.awardCriteria.value] : [];
  return context;
}

export class CanonicalExpedienteEngine {
  constructor(
    private readonly cpvEngine: CPVEngine,
    private readonly procedimientoEngine: ProcedimientoEngine,
  ) {}

  public ejecutarIdentificacion(state: CanonicalExpedienteState): CanonicalEngineRunResult {
    const context = toLegacyContext(state);
    const executed: string[] = [];
    let fields = state.fields;

    if (context.objeto.trim().length > 0) {
      const cpvDecision = this.cpvEngine.ejecutar(context);
      const cpvPrincipal = cpvDecision.resultado?.[0]?.codigo;
      fields = {
        ...fields,
        cpvMain: promoteEngineProposal(
          {
            ...cpvDecision,
            resultado: cpvPrincipal,
          } as typeof cpvDecision & { resultado?: string },
          {
            key: "cpvMain",
            motor: "CPVEngine",
            sourceId: "CPVEngine:CPV-001",
            requiresHumanValidation: true,
            diagnostics: ["El CPV es una propuesta automática y no se promueve sin validación humana."],
          },
        ),
      };
      executed.push("CPVEngine");
    }

    if (context.valorEstimado > 0 && context.tipoContrato.trim().length > 0) {
      const procedimientoDecision = this.procedimientoEngine.ejecutar(context);
      fields = {
        ...fields,
        procedure: promoteNormativeEngineDecision(procedimientoDecision, {
          key: "procedure",
          motor: "ProcedimientoEngine",
          sourceId: procedimientoDecision.reglasAplicadas[0] ?? "procedimiento.rules.json",
          requiresHumanValidation: true,
          diagnostics: ["La regla aplicada se conserva con sus artículos y requiere validación humana antes de generar pliegos."],
        }),
      };
      executed.push("ProcedimientoEngine");
    }

    return {
      state: {
        ...state,
        fields,
      },
      context,
      executed,
    };
  }
}
