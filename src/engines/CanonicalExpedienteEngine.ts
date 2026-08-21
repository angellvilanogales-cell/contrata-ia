import { CPVEngine } from "./CPVEngine";
import { ProcedimientoEngine } from "./ProcedimientoEngine";
import { SolvenciaEngine } from "./SolvenciaEngine";
import { PublicidadEngine } from "./PublicidadEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { CanonicalExpedienteState } from "../domain/expediente/CanonicalExpedienteState";
import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";
import { isPromotableEvidenceField } from "../domain/expediente/EvidenceField";
import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";
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
  if (state.fields.procedure.value && isPromotableEvidenceField(state.fields.procedure)) {
    context.procedimiento = state.fields.procedure.value as TipoProcedimiento;
  }
  return context;
}

function toMainCpvDecision(decision: ReturnType<CPVEngine["ejecutar"]>): DecisionJuridica<string> {
  const mapped = new DecisionJuridica<string>();
  mapped.resultado = decision.resultado?.[0]?.codigo;
  mapped.explicacion = decision.explicacion;
  mapped.articulos = [...decision.articulos];
  mapped.normativa = [...decision.normativa];
  mapped.informes = [...decision.informes];
  mapped.jurisprudencia = [...decision.jurisprudencia];
  mapped.reglasAplicadas = [...decision.reglasAplicadas];
  mapped.confianza = decision.confianza;
  mapped.observaciones = [...decision.observaciones];
  return mapped;
}

function toSolvencyListDecision(decision: DecisionJuridica<string>): DecisionJuridica<readonly string[]> {
  const mapped = new DecisionJuridica<readonly string[]>();
  mapped.resultado = decision.resultado ? [decision.resultado] : [];
  mapped.explicacion = decision.explicacion;
  mapped.articulos = [...decision.articulos];
  mapped.normativa = [...decision.normativa];
  mapped.informes = [...decision.informes];
  mapped.jurisprudencia = [...decision.jurisprudencia];
  mapped.reglasAplicadas = [...decision.reglasAplicadas];
  mapped.confianza = decision.confianza;
  mapped.observaciones = [...decision.observaciones];
  return mapped;
}

export class CanonicalExpedienteEngine {
  constructor(
    private readonly cpvEngine: CPVEngine,
    private readonly procedimientoEngine: ProcedimientoEngine,
    private readonly solvenciaEngine = new SolvenciaEngine(),
    private readonly publicidadEngine = new PublicidadEngine(),
  ) {}

  public ejecutarIdentificacion(state: CanonicalExpedienteState): CanonicalEngineRunResult {
    const context = toLegacyContext(state);
    const executed: string[] = [];
    let fields = state.fields;

    if (context.objeto.trim().length > 0) {
      const cpvDecision = this.cpvEngine.ejecutar(context);
      fields = {
        ...fields,
        cpvMain: promoteEngineProposal(toMainCpvDecision(cpvDecision), {
          key: "cpvMain",
          motor: "CPVEngine",
          sourceId: "CPVEngine:CPV-001",
          requiresHumanValidation: true,
          diagnostics: ["El CPV es una propuesta automática y no se promueve sin validación humana."],
        }),
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
      state: { ...state, fields },
      context,
      executed,
    };
  }

  public ejecutarRegimen(state: CanonicalExpedienteState): CanonicalEngineRunResult {
    const context = toLegacyContext(state);
    const executed: string[] = [];
    let fields = state.fields;

    if (!context.procedimiento || !isPromotableEvidenceField(state.fields.procedure)) {
      return { state, context, executed };
    }

    const solvenciaDecision = this.solvenciaEngine.ejecutar(context);
    fields = {
      ...fields,
      solvency: promoteNormativeEngineDecision(toSolvencyListDecision(solvenciaDecision), {
        key: "solvency",
        motor: "SolvenciaEngine",
        sourceId: solvenciaDecision.reglasAplicadas[0] ?? "solvencia.rules.json",
        requiresHumanValidation: true,
      }),
    };
    executed.push("SolvenciaEngine");

    const publicidadDecision = this.publicidadEngine.ejecutar(context);
    fields = {
      ...fields,
      publicity: promoteNormativeEngineDecision(publicidadDecision, {
        key: "publicity",
        motor: "PublicidadEngine",
        sourceId: publicidadDecision.reglasAplicadas[0] ?? "publicidad.rules.json",
        requiresHumanValidation: true,
      }),
    };
    executed.push("PublicidadEngine");

    return {
      state: { ...state, fields },
      context,
      executed,
    };
  }
}
