/**
 * ============================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * ============================================================
 *
 * Motor encargado de determinar el procedimiento de
 * adjudicación.
 *
 * Hereda de BaseEngine para reutilizar el acceso al
 * conocimiento y al motor de inferencia.
 *
 * ============================================================
 */

import { BaseEngine } from "./BaseEngine";
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

export class ProcedimientoEngine extends BaseEngine {

    /**
     * Determina el procedimiento aplicable.
     */
    public async determinarProcedimiento(

        datos: DatosProcedimiento

    ): Promise<string> {

        const reglas =
            await this.obtenerReglas(
                "PROCEDIMIENTO"
            );

        const regla =
            this.inference.evaluarPrimera(

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

        const r: any = regla;

        if (

            r.tipoContrato &&
            r.tipoContrato !== datos.tipoContrato

        ) {

            return false;

        }

        if (

            r.valorMinimo !== undefined &&
            datos.valorEstimado < r.valorMinimo

        ) {

            return false;

        }

        if (

            r.valorMaximo !== undefined &&
            datos.valorEstimado > r.valorMaximo

        ) {

            return false;

        }

        return true;

    }

}
