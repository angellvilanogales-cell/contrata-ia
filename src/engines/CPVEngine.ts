/**
 * ============================================================
 * CONTRATA IA
 * CPVEngine
 * ============================================================
 *
 * Motor encargado de proponer los códigos CPV más
 * adecuados para el objeto del contrato.
 *
 * Combina:
 *
 *  • KnowledgeManager
 *  • CPVMatcher
 *  • DecisionJuridica
 *
 * ============================================================
 */

import { BaseEngine } from "./BaseEngine";

import { KnowledgeManager } from "../domain/conocimiento/KnowledgeManager";

import { CPVMatcher, CPVMatch } from "../domain/cpv/CPVMatcher";

import { CPVEntry } from "../domain/cpv/CPVEntry";

import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";

export class CPVEngine extends BaseEngine {

    private readonly matcher = new CPVMatcher();

    constructor(

        private readonly knowledge: KnowledgeManager

    ) {

        super();

    }

    /**
     * Propone los CPV más adecuados.
     */
    public proponer(

        descripcion: string

    ): DecisionJuridica<CPVEntry[]> {

        const cpv =

            this.knowledge.obtenerTodosCPV() as CPVEntry[];

        const candidatos =

            this.matcher.buscar(

                descripcion,

                cpv,

                10

            );

        return this.crearDecision(

            candidatos

        );

    }

    /**
     * Devuelve únicamente el mejor CPV.
     */
    public mejorCPV(

        descripcion: string

    ): CPVEntry | undefined {

        const resultado =

            this.proponer(descripcion);

        return resultado.resultado[0];

    }

    /**
     * Construye la decisión jurídica.
     */
    private crearDecision(

        candidatos: CPVMatch[]

    ): DecisionJuridica<CPVEntry[]> {

        const decision =

            new DecisionJuridica<CPVEntry[]>();

        decision.resultado =

            candidatos.map(

                c => c.cpv

            );

        decision.confianza =

            candidatos.length === 0

                ? 0

                : candidatos[0].puntuacion;

        decision.explicacion =

            candidatos.length === 0

                ? "No se ha encontrado ningún CPV compatible con la descripción indicada."

                : "Se propone el CPV con mayor coincidencia semántica y sus alternativas ordenadas por relevancia.";

        decision.articulos.push(

            "Artículo 99 LCSP"

        );

        decision.reglasAplicadas.push(

            "CPV-001"

        );

        return decision;

    }

}
