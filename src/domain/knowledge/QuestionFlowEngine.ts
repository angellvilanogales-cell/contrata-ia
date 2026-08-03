/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * QuestionFlowEngine
 * ------------------------------------------------------------
 * Motor inteligente de flujo de preguntas.
 *
 * RESPONSABILIDAD
 *
 * Determinar cuál es la siguiente pregunta necesaria para
 * completar correctamente el expediente.
 *
 * NO conoce normativa.
 *
 * NO ejecuta reglas.
 *
 * NO toma decisiones jurídicas.
 *
 * Simplemente organiza el flujo de conversación.
 *
 * ============================================================
 */

import { DecisionContext } from "./DecisionContext";
import {
    ExpedienteAnalyzer,
    PendingConcept
} from "./ExpedienteAnalyzer";

export interface Question {

    /**
     * Concepto.
     */
    concept: string;

    /**
     * Texto.
     */
    text: string;

    /**
     * Prioridad.
     */
    priority: number;

}

export class QuestionFlowEngine {

    constructor(

        private readonly analyzer: ExpedienteAnalyzer

    ) {}

    /**
     * Obtiene la siguiente pregunta.
     */
    public next(

        context: DecisionContext

    ): Question | undefined {

        const pending = this.analyzer.nextQuestion(

            context

        );

        if (!pending) {

            return undefined;

        }

        return this.buildQuestion(

            pending

        );

    }

    /**
     * Construye la pregunta.
     */
    private buildQuestion(

        concept: PendingConcept

    ): Question {

        switch (concept.id) {

            case "need":

                return {

                    concept: concept.id,

                    priority: concept.priority,

                    text:
                        "¿Qué necesidad pública pretende satisfacer el contrato?"

                };

            case "object":

                return {

                    concept: concept.id,

                    priority: concept.priority,

                    text:
                        "¿Cuál es el objeto exacto del contrato?"

                };

            case "cpv":

                return {

                    concept: concept.id,

                    priority: concept.priority,

                    text:
                        "¿Qué Código CPV corresponde al objeto?"

                };

            case "estimatedValue":

                return {

                    concept: concept.id,

                    priority: concept.priority,

                    text:
                        "¿Cuál es el Valor Estimado del contrato?"

                };

            case "procedure":

                return {

                    concept: concept.id,

                    priority: concept.priority,

                    text:
                        "¿Qué procedimiento de adjudicación corresponde?"

                };

            case "solvency":

                return {

                    concept: concept.id,

                    priority: concept.priority,

                    text:
                        "¿Debe exigirse solvencia al licitador?"

                };

            default:

                return {

                    concept: concept.id,

                    priority: concept.priority,

                    text:
                        "Debe completarse el concepto: " + concept.name

                };

        }

    }

    /**
     * ¿Ha terminado la entrevista?
     */
    public completed(

        context: DecisionContext

    ): boolean {

        return this.next(

            context

        ) === undefined;

    }

}
