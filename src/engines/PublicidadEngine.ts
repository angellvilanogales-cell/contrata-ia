/**
 * ============================================================
 * CONTRATA IA
 * PublicidadEngine
 * ============================================================
 *
 * Motor encargado de determinar la publicidad mínima
 * exigible conforme a la normativa aplicable.
 *
 * En esta primera versión se prepara la estructura
 * del motor. La lógica jurídica se incorporará desde
 * RuleEngine y KnowledgeEngine.
 *
 * ============================================================
 */

import { KnowledgeEngine } from "./KnowledgeEngine";

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

        private readonly knowledge: KnowledgeEngine

    ) {}

    /**
     * Determina la publicidad obligatoria.
     */
    public async determinarPublicidad(

        datos: DatosPublicidad

    ): Promise<ResultadoPublicidad> {

        const reglas =
            await this.knowledge.obtenerReglasPublicidad();

        const resultado: ResultadoPublicidad = {

            publicarPLCSP: false,

            publicarDOUE: false,

            publicarPerfilContratante: false,

            justificacion: []

        };

        for (const regla of reglas) {

            if (!this.cumple(regla, datos)) {

                continue;

            }

            if (regla.publicarPLCSP) {

                resultado.publicarPLCSP = true;

            }

            if (regla.publicarDOUE) {

                resultado.publicarDOUE = true;

            }

            if (regla.publicarPerfilContratante) {

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
     *
     * Será sustituido por el motor de inferencia.
     */
    private cumple(

        regla: any,

        datos: DatosPublicidad

    ): boolean {

        if (

            regla.procedimiento &&
            regla.procedimiento !== datos.procedimiento

        ) {

            return false;

        }

        if (

            regla.tipoContrato &&
            regla.tipoContrato !== datos.tipoContrato

        ) {

            return false;

        }

        return true;

    }

}
