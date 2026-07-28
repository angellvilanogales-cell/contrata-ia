/**
 * ============================================================
 * CONTRATA IA
 * PublicidadEngine
 * ============================================================
 *
 * Determina la publicidad obligatoria utilizando
 * el motor de inferencia.
 *
 * Toda la lógica jurídica se obtiene desde
 * KnowledgeEngine + RuleEngine.
 *
 * ============================================================
 */

import { KnowledgeEngine } from "./KnowledgeEngine";
import { InferenceEngine } from "../domain/conocimiento/InferenceEngine";
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

export class PublicidadEngine {

    constructor(

        private readonly knowledge: KnowledgeEngine,

        private readonly inference: InferenceEngine

    ) {}

    /**
     * Determina la publicidad obligatoria.
     */
    public async determinarPublicidad(

        datos: DatosPublicidad

    ): Promise<ResultadoPublicidad> {

        const reglas =
            await this.knowledge.obtenerReglasPublicidad();

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
     * Evalúa una regla.
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
