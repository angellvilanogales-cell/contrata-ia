/**
 * ============================================================
 * CONTRATA IA
 * PublicidadEngine
 * ============================================================
 *
 * Motor encargado de determinar la publicidad
 * obligatoria del expediente.
 *
 * Implementado sobre BaseEngine para reutilizar
 * KnowledgeEngine e InferenceEngine.
 *
 * ============================================================
 */

import { BaseEngine } from "./BaseEngine";
import { ReglaJuridica } from "../domain/conocimiento/ReglaJuridica";

export interface DatosPublicidad {

    procedimiento: string;

    tipoContrato: string;

    valorEstimado: number;

}

export interface ResultadoPublicidad {

    publicarPLCSP: boolean;

    publicarDOUE: boolean;

    publicarPerfilContratante: boolean;

    justificacion: string[];

}

export class PublicidadEngine extends BaseEngine {

    /**
     * Determina la publicidad exigible.
     */
    public async determinarPublicidad(

        datos: DatosPublicidad

    ): Promise<ResultadoPublicidad> {

        const reglas =
            await this.obtenerReglas(
                "PUBLICIDAD"
            );

        const reglasAplicables =
            this.inference.evaluarTodas(

                reglas,

                datos,

                (r, d) => this.cumple(r, d)

            );

        const resultado: ResultadoPublicidad = {

            publicarPLCSP: false,

            publicarDOUE: false,

            publicarPerfilContratante: false,

            justificacion: []

        };

        for (const regla of reglasAplicables) {

            const r: any = regla;

            if (r.publicarPLCSP) {

                resultado.publicarPLCSP = true;

            }

            if (r.publicarDOUE) {

                resultado.publicarDOUE = true;

            }

            if (r.publicarPerfilContratante) {

                resultado.publicarPerfilContratante = true;

            }

            resultado.justificacion.push(

                regla.descripcion

            );

        }

        return resultado;

    }

    /**
     * Comprueba si una regla resulta aplicable.
     */
    private cumple(

        regla: ReglaJuridica,

        datos: DatosPublicidad

    ): boolean {

        const r: any = regla;

        if (

            r.procedimiento &&
            r.procedimiento !== datos.procedimiento

        ) {

            return false;

        }

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
