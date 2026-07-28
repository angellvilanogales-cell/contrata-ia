/**
 * ============================================================
 * CONTRATA IA
 * CPVEngine
 * ============================================================
 *
 * Motor encargado de proponer automáticamente
 * los códigos CPV de un expediente.
 *
 * Trabaja directamente sobre ExpedienteContext.
 *
 * ============================================================
 */

import { BaseEngine } from "./BaseEngine";

import { KnowledgeManager } from "../domain/conocimiento/KnowledgeManager";

import { CPVMatcher } from "../domain/cpv/CPVMatcher";
import { CPVEntry } from "../domain/cpv/CPVEntry";

import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

export class CPVEngine extends BaseEngine {

    private readonly matcher = new CPVMatcher();

    constructor(

        private readonly knowledge: KnowledgeManager

    ) {

        super();

    }

    /**
     * Ejecuta el motor CPV.
     */
    public ejecutar(

        contexto: ExpedienteContext

    ): DecisionJuridica<CPVEntry[]> {

        const catalogo =

            this.knowledge.obtenerTodosCPV() as CPVEntry[];

        const candidatos =

            this.matcher.buscar(

                contexto.objeto,

                catalogo,

                10

            );

        const decision =

            new DecisionJuridica<CPVEntry[]>();

        decision.resultado =

            candidatos.map(

                c => c.cpv

            );

        if (decision.resultado.length > 0) {

            contexto.cpvPrincipal =

                decision.resultado[0];

            contexto.cpvSecundarios =

                decision.resultado.slice(1);

            decision.confianza =

                candidatos[0].puntuacion;

        }
        else {

            contexto.cpvSecundarios = [];

            decision.confianza = 0;

        }

        decision.explicacion =

            "Selección automática de códigos CPV basada en coincidencia semántica.";

        decision.reglasAplicadas.push(

            "CPV-001"

        );

        return decision;

    }

}
