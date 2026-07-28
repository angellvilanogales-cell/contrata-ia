/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * ============================================================
 *
 * Motor encargado de determinar el procedimiento
 * de adjudicación utilizando el motor de inferencia.
 *
 * ============================================================
 */

import { KnowledgeEngine } from "./KnowledgeEngine";
import { InferenceEngine } from "../domain/conocimiento/InferenceEngine";
import { ReglaJuridica } from "../domain/conocimiento/ReglaJuridica";

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

        private readonly knowledge: KnowledgeEngine,

        private readonly inference: InferenceEngine

    ) {}

    /**
     * Determina el procedimiento aplicable.
     */
    public async determinarProcedimiento(

        datos: DatosProcedimiento

    ): Promise<string> {

        const reglas =
            await this.knowledge.obtenerReglasProcedimiento();

        const regla = this.inference.evaluarPrimera(

            reglas,

            datos,

            (r, d) => this.cumple(r, d)

        );

        if (!regla) {

            return "PROCEDIMIENTO_NO_DETERMINADO";

        }

        return regla.consecuencia;

    }

    /**
     * Comprueba si una regla es aplicable.
     */
    private cumple(

        regla: ReglaJuridica,

        datos: DatosProcedimiento

    ): boolean {

        const condicion: any = regla as any;

        if (

            condicion.tipoContrato &&
            condicion.tipoContrato !== datos.tipoContrato

        ) {

            return false;

        }

        if (

            condicion.valorMinimo !== undefined &&
            datos.valorEstimado < condicion.valorMinimo

        ) {

            return false;

        }

        if (

            condicion.valorMaximo !== undefined &&
            datos.valorEstimado > condicion.valorMaximo

        ) {

            return false;

        }

        return true;

    }

}
