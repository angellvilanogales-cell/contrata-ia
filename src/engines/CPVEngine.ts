import { BaseEngine } from "./BaseEngine";
import { KnowledgeManager } from "../domain/conocimiento/KnowledgeManager";
import { CPVMatcher } from "../domain/cpv/CPVMatcher";
import { CPVEntry } from "../domain/cpv/CPVEntry";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

/**
 * Motor CPV reutilizado y saneado. Produce candidatos trazables, nunca una
 * clasificación definitiva: la selección principal sigue requiriendo
 * validación humana en la capa canónica.
 */
export class CPVEngine extends BaseEngine {
  private readonly matcher = new CPVMatcher();

  constructor(private readonly knowledge: KnowledgeManager) { super(); }

  public ejecutar(contexto: ExpedienteContext): DecisionJuridica<CPVEntry[]> {
    const decision = new DecisionJuridica<CPVEntry[]>();
    const objeto = contexto.objeto.trim();
    const catalogo = this.knowledge.obtenerTodosCPV() as CPVEntry[];

    if (!objeto) {
      decision.resultado = [];
      decision.confianza = 0;
      decision.explicacion = "No puede proponerse CPV sin una descripción del objeto contractual.";
      decision.observaciones.push("El motor CPV no inventa el objeto ni un código por defecto.");
      return decision;
    }

    if (catalogo.length === 0) {
      decision.resultado = [];
      decision.confianza = 0;
      decision.explicacion = "No hay catálogo CPV cargado para efectuar una propuesta.";
      decision.observaciones.push("Debe cargarse una fuente CPV antes de proponer códigos.");
      return decision;
    }

    const candidatos = this.matcher.buscar(objeto, catalogo, 10);
    decision.resultado = candidatos.map(c => c.cpv);
    decision.reglasAplicadas.push("CPV-LEXICAL-LOCAL-001");
    decision.normativa.push("Reglamento (CE) n.º 2195/2002, modificado por el Reglamento (CE) n.º 213/2008");

    const primero = candidatos[0];
    const segundo = candidatos[1];
    if (!primero) {
      contexto.cpvPrincipal = undefined;
      contexto.cpvSecundarios = [];
      decision.confianza = 0;
      decision.explicacion = "El catálogo cargado no contiene coincidencias léxicas suficientes para proponer un CPV.";
      return decision;
    }

    contexto.cpvPrincipal = primero.cpv;
    contexto.cpvSecundarios = candidatos.slice(1).map(c => c.cpv);
    decision.confianza = Math.min(100, Math.max(0, primero.puntuacion));
    decision.explicacion = "Propuesta de códigos CPV obtenida mediante coincidencia léxica determinista sobre el catálogo local.";
    decision.observaciones.push("La puntuación mide coincidencia textual y no equivale a certeza jurídica.");
    decision.observaciones.push("El CPV principal debe validarse humanamente antes de incorporarse a los documentos del expediente.");

    if (segundo && segundo.puntuacion === primero.puntuacion) {
      decision.observaciones.push("Existe empate entre los primeros candidatos; no debe interpretarse el orden como preferencia jurídica.");
    }

    return decision;
  }
}
