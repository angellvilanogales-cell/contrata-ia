/**
 * ============================================================
 * CONTRATA IA
 * ObjetoEngine
 * ============================================================
 *
 * Analiza el objeto del contrato conforme a los
 * artículos 99 a 102 de la LCSP.
 *
 * Este motor será el primero del sistema experto
 * que utilice:
 *
 * - Validator
 * - KnowledgeRepository
 * - InferenceEngine
 * - DecisionJuridica
 *
 * ============================================================
 */

import { BaseEngine } from "./BaseEngine";
import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { ObjetoContrato } from "../domain/objeto/ObjetoContrato";
import { ObjetoResultado } from "../domain/objeto/ObjetoResultado";
import { ObjetoValidator } from "../domain/objeto/ObjetoValidator";

export class ObjetoEngine extends BaseEngine {

    private readonly validator = new ObjetoValidator();

    /**
     * Analiza el objeto del contrato.
     */
    public async analizar(
        objeto: ObjetoContrato
    ): Promise<ObjetoResultado> {

        const resultado = new ObjetoResultado();

        const errores = this.validator.validar(objeto);

        resultado.errores.push(...errores);

        resultado.valido = errores.length === 0;

        resultado.descripcionNormalizada =
            this.normalizar(objeto.descripcion);

        resultado.tipoContrato =
            objeto.tipoContrato;

        resultado.requiereAnalisisLotes =
            objeto.valorEstimado > 0;

        resultado.decision =
            this.crearDecision(resultado);

        return resultado;

    }

    /**
     * Normaliza el texto recibido.
     */
    private normalizar(
        texto: string
    ): string {

        return texto
            .trim()
            .replace(/\s+/g, " ");

    }

    /**
     * Genera la decisión jurídica.
     */
    private crearDecision(
        resultado: ObjetoResultado
    ): DecisionJuridica<string> {

        const decision =
            new DecisionJuridica<string>();

        decision.resultado =
            resultado.descripcionNormalizada;

        decision.explicacion =
            resultado.valido
                ? "El objeto del contrato supera las validaciones iniciales."
                : "El objeto presenta incidencias que deben corregirse antes de continuar.";

        decision.articulos.push(
            "Artículo 99 LCSP",
            "Artículo 100 LCSP",
            "Artículo 101 LCSP",
            "Artículo 102 LCSP"
        );

        decision.reglasAplicadas.push(
            "OBJ-001",
            "OBJ-002",
            "OBJ-003"
        );

        decision.confianza =
            resultado.valido ? 100 : 50;

        return decision;

    }

}
