/**
 * ============================================================
 * CONTRATA IA
 * InferenceEngine
 * ============================================================
 *
 * Motor de inferencia.
 *
 * Responsable de evaluar las reglas jurídicas
 * previamente cargadas por RuleEngine.
 *
 * En esta primera versión implementa la estructura
 * necesaria para evolucionar hacia un sistema
 * experto completo basado en reglas.
 *
 * ============================================================
 */

import { RuleDefinition } from "./RuleLoader";
import { RuleEngine } from "./RuleEngine";

export interface RuleEvaluation {

    regla: RuleDefinition;

    cumplida: boolean;

    mensaje: string;

}

export class InferenceEngine {

    constructor(

        private readonly ruleEngine: RuleEngine

    ) { }

    /**
     * Evalúa todas las reglas.
     */
    public evaluar(

        contexto: Record<string, unknown>

    ): RuleEvaluation[] {

        const resultado: RuleEvaluation[] = [];

        const reglas =
            this.ruleEngine.obtenerReglasOrdenadas();

        for (const regla of reglas) {

            const cumplida =
                this.evaluarCondicion(

                    regla,

                    contexto

                );

            resultado.push({

                regla,

                cumplida,

                mensaje: regla.mensaje

            });

        }

        return resultado;

    }

    /**
     * Devuelve únicamente las reglas incumplidas.
     */
    public obtenerIncumplimientos(

        contexto: Record<string, unknown>

    ): RuleEvaluation[] {

        return this.evaluar(contexto)

            .filter(

                r => !r.cumplida

            );

    }

    /**
     * Comprueba si todas las reglas se cumplen.
     */
    public esValido(

        contexto: Record<string, unknown>

    ): boolean {

        return this.obtenerIncumplimientos(

            contexto

        ).length === 0;

    }

    /**
     * =====================================================
     * Evaluación de condiciones.
     *
     * En esta primera versión únicamente implementamos
     * la infraestructura.
     *
     * En el siguiente sprint se sustituirá por un
     * evaluador completo de expresiones.
     * =====================================================
     */
    private evaluarCondicion(

        regla: RuleDefinition,

        contexto: Record<string, unknown>

    ): boolean {

        switch (regla.condicion.trim()) {

            case "true":

                return true;

            case "false":

                return false;

            default:

                /**
                 * TODO
                 *
                 * Aquí irá el evaluador de expresiones:
                 *
                 * titulo != ''
                 * descripcion.length >= 20
                 * valorEstimado > 0
                 * etc.
                 */

                return true;

        }

    }

}
