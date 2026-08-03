/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ExpedienteAnalyzer
 * ------------------------------------------------------------
 * Analiza el expediente y determina:
 *
 *  • Información existente.
 *  • Información pendiente.
 *  • Conceptos incompletos.
 *  • Orden lógico de trabajo.
 *
 * IMPORTANTE
 *
 * No interpreta normativa.
 *
 * No aplica reglas.
 *
 * No decide.
 *
 * ============================================================
 */

import { DecisionContext } from "./DecisionContext";

export interface PendingConcept {

    id: string;

    name: string;

    priority: number;

}

export interface AnalysisResult {

    completed: string[];

    pending: PendingConcept[];

}

export class ExpedienteAnalyzer {

    /**
     * Conceptos mínimos del expediente.
     */
    private readonly concepts: PendingConcept[] = [

        {
            id: "need",
            name: "Necesidad",
            priority: 1
        },

        {
            id: "object",
            name: "Objeto",
            priority: 2
        },

        {
            id: "cpv",
            name: "Código CPV",
            priority: 3
        },

        {
            id: "estimatedValue",
            name: "Valor Estimado",
            priority: 4
        },

        {
            id: "procedure",
            name: "Procedimiento",
            priority: 5
        },

        {
            id: "solvency",
            name: "Solvencia",
            priority: 6
        }

    ];

    /**
     * Analiza el expediente.
     */
    public analyze(

        context: DecisionContext

    ): AnalysisResult {

        const facts = context as any;

        const completed: string[] = [];

        const pending: PendingConcept[] = [];

        for (const concept of this.concepts) {

            if (

                facts[concept.id] !== undefined &&
                facts[concept.id] !== null &&
                facts[concept.id] !== ""

            ) {

                completed.push(

                    concept.id

                );

            }

            else {

                pending.push(

                    concept

                );

            }

        }

        pending.sort(

            (a, b) => a.priority - b.priority

        );

        return {

            completed,

            pending

        };

    }

    /**
     * Devuelve el siguiente concepto
     * que debe preguntarse.
     */
    public nextQuestion(

        context: DecisionContext

    ): PendingConcept | undefined {

        return this.analyze(

            context

        ).pending[0];

    }

}
