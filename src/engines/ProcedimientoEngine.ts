/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * ============================================================
 *
 * Motor encargado de determinar el procedimiento
 * de adjudicación.
 *
 * IMPORTANTE
 *
 * Este motor NO contiene normativa.
 *
 * Toda la normativa deberá consultarse a través
 * del KnowledgeEngine y del RuleEngine.
 *
 * ============================================================
 */

import { KnowledgeEngine } from "./KnowledgeEngine";

export enum TipoContrato {

    OBRAS = "OBRAS",

    SERVICIOS = "SERVICIOS",

    SUMINISTROS = "SUMINISTROS"

}

export interface DatosProcedimiento {

    tipoContrato: TipoContrato;

    valorEstimado: number;

}

export class ProcedimientoEngine {

    constructor(

        private readonly knowledge: KnowledgeEngine

    ) {}

    /**
     * Determina el procedimiento.
     *
     * En esta versión el motor consulta
     * el conocimiento disponible.
     */
    public async determinarProcedimiento(

        datos: DatosProcedimiento

    ): Promise<string> {

        const reglas =
            await this.knowledge.obtenerReglasProcedimiento();

        for (const regla of reglas) {

            if (this.cumple(regla, datos)) {

                return regla.consecuencia;

            }

        }

        return "PROCEDIMIENTO_NO_DETERMINADO";

    }

    /**
     * Evalúa una regla.
     *
     * En siguientes versiones será sustituido
     * por el verdadero motor de inferencia.
     */
    private cumple(

        regla: any,

        datos: DatosProcedimiento

    ): boolean {

        if (

            regla.tipoContrato &&
            regla.tipoContrato !== datos.tipoContrato

        ) {

            return false;

        }

        if (

            regla.valorMinimo !== undefined &&
            datos.valorEstimado < regla.valorMinimo

        ) {

            return false;

        }

        if (

            regla.valorMaximo !== undefined &&
            datos.valorEstimado > regla.valorMaximo

        ) {

            return false;

        }

        return true;

    }

}
