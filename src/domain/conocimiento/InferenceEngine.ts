/**
 * ============================================================
 * CONTRATA IA
 * InferenceEngine
 * ============================================================
 *
 * Motor de inferencia del sistema experto.
 *
 * Evalúa las reglas cargadas por RuleEngine utilizando
 * ExpressionEvaluator.
 *
 * ============================================================
 */

import { RuleDefinition } from "./RuleLoader";
import { RuleEngine } from "./RuleEngine";
import { ExpressionEvaluator } from "./ExpressionEvaluator";

export interface RuleEvaluation {

    regla: RuleDefinition;

    cumplida: boolean;

    mensaje: string;

}

export class InferenceEngine {

    /**
     * Evaluador de expresiones.
     */
    private readonly evaluator = new ExpressionEvaluator();

    constructor(

        private readonly ruleEngine: RuleEngine

    ) {}

    /**
     * Ejecuta todas las reglas.
     */
    public evaluar(

        contexto: Record<string, unknown>

    ): RuleEvaluation[] {

        const resultado: RuleEvaluation[] = [];

        const reglas = this.ruleEngine.obtenerReglasOrdenadas();

        for (const regla of reglas) {

            const cumplida = this.evaluator.evaluar(

                regla.condicion,

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
     * Indica si todas las reglas se cumplen.
     */
    public esValido(

        contexto: Record<string, unknown>

    ): boolean {

        return this.obtenerIncumplimientos(

            contexto

        ).length === 0;

    }

    /**
     * Devuelve la primera regla incumplida.
     */
    public primerError(

        contexto: Record<string, unknown>

    ): RuleEvaluation | undefined {

        return this.obtenerIncumplimientos(

            contexto

        )[0];

    }

}
