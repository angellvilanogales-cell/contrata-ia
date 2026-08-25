import { BaseEngine } from "./BaseEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";
import { TipoProcedimiento } from "../domain/procedimiento/TipoProcedimiento";

const MINOR_WORKS_LIMIT = 40_000;
const MINOR_SUPPLY_SERVICE_LIMIT = 15_000;
const ASA_WORKS_LIMIT = 80_000;
const ASA_SUPPLY_SERVICE_LIMIT = 60_000;
const OSA_WORKS_LIMIT = 2_000_000;

function normalizedContractType(value: string): "WORKS" | "SUPPLY" | "SERVICE" | "OTHER" {
  const type = value.trim().toUpperCase();
  if (["WORKS", "OBRAS", "OBRA"].includes(type)) return "WORKS";
  if (["SUPPLY", "SUPPLIES", "SUMINISTRO", "SUMINISTROS"].includes(type)) return "SUPPLY";
  if (["SERVICE", "SERVICES", "SERVICIO", "SERVICIOS"].includes(type)) return "SERVICE";
  return "OTHER";
}

function proposed(
  context: ExpedienteContext,
  procedure: TipoProcedimiento,
  ruleId: string,
  explanation: string,
  articles: readonly string[],
  observations: readonly string[] = [],
): DecisionJuridica<TipoProcedimiento> {
  const decision = new DecisionJuridica<TipoProcedimiento>();
  decision.resultado = procedure;
  decision.confianza = 100;
  decision.explicacion = explanation;
  decision.articulos.push(...articles);
  decision.normativa.push("Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público");
  decision.reglasAplicadas.push(ruleId);
  decision.observaciones.push(...observations);
  context.procedimiento = procedure;
  return decision;
}

function pending(explanation: string, observations: readonly string[] = []): DecisionJuridica<TipoProcedimiento> {
  const decision = new DecisionJuridica<TipoProcedimiento>();
  decision.confianza = 0;
  decision.explicacion = explanation;
  decision.normativa.push("Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público");
  decision.observaciones.push(...observations);
  return decision;
}

/**
 * Motor histórico saneado: conserva su papel de propuesta jurídica, pero ya
 * no selecciona procedimiento por una escala única de cuantías.
 *
 * Regla de seguridad: cuando falta un dato jurídico necesario, devuelve una
 * decisión pendiente en vez de completar o presumir el dato.
 */
export class ProcedimientoEngine extends BaseEngine {
  public ejecutar(contexto: ExpedienteContext): DecisionJuridica<TipoProcedimiento> {
    const type = normalizedContractType(contexto.tipoContrato);
    const value = contexto.valorEstimado;

    if (type === "OTHER") {
      return pending(
        "El tipo contractual no permite aplicar con seguridad las reglas ordinarias de obras, suministros o servicios.",
        ["Se requiere clasificación contractual previa y validada."],
      );
    }

    if (!Number.isFinite(value) || value <= 0) {
      return pending(
        "No puede proponerse procedimiento sin un valor estimado válido.",
        ["El valor estimado debe estar validado conforme al artículo 101 LCSP."],
      );
    }

    const minorLimit = type === "WORKS" ? MINOR_WORKS_LIMIT : MINOR_SUPPLY_SERVICE_LIMIT;
    if (value < minorLimit) {
      if (contexto.contratoMenorJustificado !== true) {
        return pending(
          "La cuantía entra en el ámbito del contrato menor, pero la cuantía por sí sola no autoriza su selección.",
          [
            "Debe constar la justificación motivada de la necesidad.",
            "Debe constar que no se altera el objeto para evitar los umbrales del artículo 118 LCSP.",
          ],
        );
      }
      return proposed(
        contexto,
        TipoProcedimiento.CONTRATO_MENOR,
        type === "WORKS" ? "PROC-2026-MINOR-WORKS" : "PROC-2026-MINOR-SUPPLY-SERVICE",
        "Procede proponer contrato menor por cuantía y por constar la justificación exigida.",
        ["art. 118 LCSP"],
      );
    }

    const asaLimit = type === "WORKS" ? ASA_WORKS_LIMIT : ASA_SUPPLY_SERVICE_LIMIT;
    if (value < asaLimit) {
      if (contexto.prestacionesIntelectuales === undefined || contexto.porcentajeJuicioValor === undefined) {
        return pending(
          "La cuantía permitiría estudiar la tramitación del artículo 159.6, pero faltan datos imprescindibles.",
          [
            "Debe declararse si existen prestaciones de carácter intelectual.",
            "Debe declararse el porcentaje de criterios evaluables mediante juicio de valor.",
          ],
        );
      }
      if (!contexto.prestacionesIntelectuales && contexto.porcentajeJuicioValor === 0) {
        return proposed(
          contexto,
          TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO,
          type === "WORKS" ? "PROC-2026-ASA-WORKS" : "PROC-2026-ASA-SUPPLY-SERVICE",
          "Se cumplen las condiciones cuantitativas y materiales para proponer la tramitación abreviada del artículo 159.6 LCSP.",
          ["art. 159.6 LCSP"],
          ["La propuesta sigue sometida a validación humana y a la comprobación del resto de requisitos del expediente."],
        );
      }
    }

    if (contexto.porcentajeJuicioValor === undefined || contexto.prestacionesIntelectuales === undefined) {
      return pending(
        "No puede cerrarse la procedencia del procedimiento abierto simplificado sin conocer los criterios sometidos a juicio de valor y el carácter intelectual de la prestación.",
        ["Condición exigida por el artículo 159.1.b LCSP."],
      );
    }

    const maxJudgment = contexto.prestacionesIntelectuales ? 45 : 25;
    const judgmentCompatible = contexto.porcentajeJuicioValor <= maxJudgment;

    let valueCompatible = false;
    if (type === "WORKS") {
      valueCompatible = value <= OSA_WORKS_LIMIT;
    } else if (contexto.umbralSara !== undefined && Number.isFinite(contexto.umbralSara) && contexto.umbralSara > 0) {
      valueCompatible = value < contexto.umbralSara;
    } else {
      return pending(
        "Para suministros y servicios falta el umbral SARA aplicable al órgano de contratación y al ejercicio normativo.",
        [
          "El artículo 159.1.a remite a los umbrales de los artículos 21.1.a y 22.1.a o a sus actualizaciones.",
          "El motor no fija un umbral universal porque depende del tipo de poder adjudicador y de su actualización temporal.",
        ],
      );
    }

    if (valueCompatible && judgmentCompatible) {
      return proposed(
        contexto,
        TipoProcedimiento.ABIERTO_SIMPLIFICADO,
        type === "WORKS" ? "PROC-2026-OSA-WORKS" : "PROC-2026-OSA-SUPPLY-SERVICE",
        "Se cumplen las condiciones de cuantía y de ponderación de criterios para proponer procedimiento abierto simplificado.",
        ["art. 159.1 LCSP"],
        ["La propuesta requiere validación humana antes de incorporarse a los pliegos."],
      );
    }

    return proposed(
      contexto,
      TipoProcedimiento.ABIERTO,
      "PROC-2026-OPEN-FALLBACK",
      "No concurren las condiciones verificadas para promover una modalidad simplificada; se propone procedimiento abierto ordinario como alternativa general.",
      ["arts. 131 y 156 LCSP"],
      [
        "Esta propuesta no descarta procedimientos especiales cuando concurra su supuesto legal.",
        "Debe validarse el régimen armonizado, la urgencia y cualquier circunstancia especial antes del cierre del expediente.",
      ],
    );
  }
}
