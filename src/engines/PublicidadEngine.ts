import { BaseEngine } from "./BaseEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";
import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";
import { TipoPublicidad } from "../domain/publicidad/TipoPublicidad";

function proposed(
  contexto: ExpedienteContext,
  result: TipoPublicidad,
  rule: string,
  explanation: string,
  articles: readonly string[],
  observations: readonly string[] = [],
): DecisionJuridica<TipoPublicidad> {
  const decision = new DecisionJuridica<TipoPublicidad>();
  decision.resultado = result;
  decision.confianza = 100;
  decision.explicacion = explanation;
  decision.articulos.push(...articles);
  decision.normativa.push("Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público");
  decision.reglasAplicadas.push(rule);
  decision.observaciones.push(...observations);
  contexto.publicidad = result;
  return decision;
}

/**
 * Motor heredado de publicidad saneado.
 *
 * Se expresa en canales jurídicos (perfil/DOUE), no en una plataforma concreta
 * salvo que otra capa institucional la haya determinado. La sujeción SARA,
 * cuando es necesaria para decidir DOUE, debe venir acreditada.
 */
export class PublicidadEngine extends BaseEngine {
  public ejecutar(contexto: ExpedienteContext): DecisionJuridica<TipoPublicidad> {
    const procedure = contexto.procedimiento;
    if (!procedure) {
      const decision = new DecisionJuridica<TipoPublicidad>();
      decision.confianza = 0;
      decision.explicacion = "No puede proponerse régimen de publicidad sin procedimiento determinado.";
      return decision;
    }

    if (procedure === TipoProcedimiento.CONTRATO_MENOR) {
      return proposed(
        contexto,
        TipoPublicidad.PERFIL_CONTRATANTE,
        "PUB-2026-MINOR-PROFILE",
        "Los contratos menores se someten a la publicación periódica prevista para el perfil de contratante.",
        ["art. 63.4 LCSP"],
        [
          "No se aplica automáticamente la excepción para contratos de valor estimado inferior a 5.000 euros: exige además que el pago se realice mediante anticipo de caja fija u otro sistema similar, dato que este motor no presume."
        ],
      );
    }

    if (
      procedure === TipoProcedimiento.ABIERTO_SIMPLIFICADO
      || procedure === TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO
    ) {
      return proposed(
        contexto,
        TipoPublicidad.PERFIL_CONTRATANTE,
        procedure === TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO ? "PUB-2026-ASA-PROFILE" : "PUB-2026-OSA-PROFILE",
        "La licitación simplificada se publica mediante el perfil de contratante en los términos legalmente previstos.",
        ["arts. 135 y 159 LCSP"],
        ["La plataforma tecnológica concreta del perfil depende de la configuración institucional y no se inventa en este motor."],
      );
    }

    if (contexto.regulacionArmonizada === undefined) {
      const decision = new DecisionJuridica<TipoPublicidad>();
      decision.confianza = 0;
      decision.explicacion = "Para el procedimiento seleccionado falta determinar si el contrato está sujeto a regulación armonizada; sin ese dato no puede cerrarse la necesidad de publicación en DOUE.";
      decision.articulos.push("art. 135 LCSP");
      decision.normativa.push("Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público");
      decision.reglasAplicadas.push("PUB-2026-HARMONIZED-PENDING");
      return decision;
    }

    if (contexto.regulacionArmonizada) {
      return proposed(
        contexto,
        TipoPublicidad.PERFIL_CONTRATANTE_DOUE,
        "PUB-2026-HARMONIZED",
        "Al constar la sujeción a regulación armonizada, se propone publicidad en el perfil de contratante y en el Diario Oficial de la Unión Europea.",
        ["arts. 135 y 347 LCSP"],
      );
    }

    return proposed(
      contexto,
      TipoPublicidad.PERFIL_CONTRATANTE,
      "PUB-2026-NON-HARMONIZED",
      "Al constar que el contrato no está sujeto a regulación armonizada, se propone la publicidad nacional exigible mediante el perfil de contratante.",
      ["arts. 63 y 135 LCSP"],
      ["La plataforma tecnológica concreta se determina en la capa institucional."],
    );
  }
}
