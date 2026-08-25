import { BaseEngine } from "./BaseEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";
import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";

/**
 * Motor heredado de solvencia saneado.
 *
 * La LCSP atribuye al órgano de contratación la concreción de medios,
 * magnitudes y umbrales de solvencia, vinculados y proporcionales al objeto.
 * Por ello el motor no fabrica una configuración genérica por el mero tipo
 * contractual. Solo emite un resultado normativo cerrado cuando la propia Ley
 * establece una exención de acreditación en la modalidad 159.6.
 */
export class SolvenciaEngine extends BaseEngine {
  public ejecutar(contexto: ExpedienteContext): DecisionJuridica<string> {
    const decision = new DecisionJuridica<string>();
    decision.normativa.push("Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público");

    if (!contexto.procedimiento) {
      decision.confianza = 0;
      decision.explicacion = "No puede analizarse la solvencia sin un procedimiento previamente determinado y validable.";
      return decision;
    }

    if (contexto.procedimiento === TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO) {
      const result = "EXENCION_ACREDITACION_SOLVENCIA_ART_159_6_B";
      contexto.solvencia = result;
      decision.resultado = result;
      decision.confianza = 100;
      decision.explicacion = "En la tramitación del artículo 159.6 se exime a los licitadores de acreditar la solvencia económica y financiera y técnica o profesional.";
      decision.articulos.push("art. 159.6.b LCSP");
      decision.reglasAplicadas.push("SOL-2026-ASA-EXENCION-ACREDITACION");
      decision.observaciones.push(
        "La exención se refiere a la acreditación en esta modalidad y no autoriza a inventar requisitos alternativos de solvencia."
      );
      return decision;
    }

    decision.confianza = 0;
    decision.explicacion = "Los requisitos concretos de solvencia deben ser determinados por el órgano de contratación, vinculados al objeto y proporcionales; el motor no los completa automáticamente.";
    decision.articulos.push("arts. 74.2, 86, 87 y 92 LCSP");
    decision.reglasAplicadas.push("SOL-2026-HUMAN-CONCRETION");
    decision.observaciones.push(
      "Para obras, suministros y servicios deben aplicarse además los medios técnicos de los artículos 88, 89 o 90, según corresponda.",
      "La ausencia de una configuración concreta se mantiene como pendiente y no se sustituye por la etiqueta histórica SOLVENCIA_GENERAL."
    );
    return decision;
  }
}
