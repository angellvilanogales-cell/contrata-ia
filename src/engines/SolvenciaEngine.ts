import * as path from "path";
import { BaseEngine } from "./BaseEngine";
import { RuleEngine } from "../domain/conocimiento/RuleEngine";
import { InferenceEngine } from "../domain/conocimiento/InferenceEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

export class SolvenciaEngine extends BaseEngine {
  private readonly ruleEngine = new RuleEngine();
  private readonly inference: InferenceEngine;

  constructor() {
    super();
    this.ruleEngine.cargarReglas(path.join(process.cwd(), "knowledge", "rules", "solvencia.rules.json"));
    this.inference = new InferenceEngine(this.ruleEngine);
  }

  public ejecutar(contexto: ExpedienteContext): DecisionJuridica<string> {
    const decision = new DecisionJuridica<string>();
    const evaluaciones = this.inference.evaluar(contexto as unknown as Record<string, unknown>);
    const regla = evaluaciones.find(r => r.cumplida);
    if (!regla) {
      decision.confianza = 0;
      decision.explicacion = "No existe ninguna regla de solvencia aplicable.";
      return decision;
    }
    if (regla.regla.resultado === undefined) {
      decision.confianza = 0;
      decision.explicacion = `La regla ${regla.regla.id} no declara resultado de solvencia.`;
      return decision;
    }
    const resultado = String(regla.regla.resultado);
    contexto.solvencia = resultado;
    decision.resultado = resultado;
    decision.confianza = 100;
    if (regla.regla.articulo) decision.articulos.push(regla.regla.articulo);
    decision.reglasAplicadas.push(regla.regla.id);
    decision.explicacion = regla.regla.nombre;
    return decision;
  }
}
