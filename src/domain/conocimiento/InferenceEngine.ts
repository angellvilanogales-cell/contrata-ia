import { RuleDefinition } from "./RuleLoader";
import { RuleEngine } from "./RuleEngine";
import { ExpressionEvaluator } from "./ExpressionEvaluator";

export interface RuleEvaluation {
  regla: RuleDefinition;
  cumplida: boolean;
  mensaje: string;
}

/** Motor determinista de evaluación de reglas locales validadas. */
export class InferenceEngine {
  private readonly evaluator = new ExpressionEvaluator();

  constructor(private readonly ruleEngine: RuleEngine) {}

  public evaluar(contexto: Record<string, unknown>): RuleEvaluation[] {
    return this.ruleEngine.obtenerReglasOrdenadas().map(regla => ({
      regla,
      cumplida: this.evaluator.evaluar(regla.condicion, contexto),
      mensaje: regla.mensaje,
    }));
  }

  /**
   * Selecciona de forma explícita la primera regla cumplida por prioridad.
   * Es la operación segura para motores de DECISION: una condición falsa no
   * constituye por sí misma un incumplimiento jurídico.
   */
  public primeraReglaCumplida(contexto: Record<string, unknown>, tipo?: string): RuleEvaluation | undefined {
    return this.evaluar(contexto).find(evaluacion => evaluacion.cumplida && (!tipo || evaluacion.regla.tipo === tipo));
  }

  /**
   * Compatibilidad con validadores históricos. No debe usarse para conjuntos
   * de reglas DECISION, donde las alternativas no seleccionadas no son errores.
   */
  public obtenerIncumplimientos(contexto: Record<string, unknown>): RuleEvaluation[] {
    return this.evaluar(contexto).filter(regla => !regla.cumplida);
  }

  public esValido(contexto: Record<string, unknown>): boolean {
    return this.obtenerIncumplimientos(contexto).length === 0;
  }

  public primerError(contexto: Record<string, unknown>): RuleEvaluation | undefined {
    return this.obtenerIncumplimientos(contexto)[0];
  }
}
