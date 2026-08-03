/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionEngine
 * ------------------------------------------------------------
 *
 * Núcleo de razonamiento jurídico.
 *
 * RESPONSABILIDADES
 *
 * • Coordinar consultas al conocimiento.
 * • Coordinar ejecución de reglas.
 * • Construir decisiones justificadas.
 *
 * IMPORTANTE
 *
 * NO contiene reglas.
 *
 * NO conoce la LCSP.
 *
 * Solo coordina motores.
 *
 * ============================================================
 */

import { KnowledgeQueryEngine } from "../knowledge/KnowledgeQueryEngine";
import { RuleEngine } from "../rules/RuleEngine";

export interface DecisionContext {

    contractType?: string;

    cpv?: string;

    estimatedValue?: number;

    procedure?: string;

    answers?: Record<string, unknown>;

}

export interface DecisionEvidence {

    source: string;

    description: string;

}

export interface DecisionResult {

    success: boolean;

    decision: string;

    confidence: number;

    evidences: DecisionEvidence[];

    recommendations: string[];

}

export class DecisionEngine {

    constructor(

        private readonly knowledge: KnowledgeQueryEngine,

        private readonly rules: RuleEngine

    ) {}

    /**
     * =====================================================
     * DECISIÓN PRINCIPAL
     * =====================================================
     */

    public evaluate(

        context: DecisionContext

    ): DecisionResult {

        const evidences: DecisionEvidence[] = [];

        const recommendations: string[] = [];

        /**
         * -------------------------------------------------
         * Consulta conocimiento
         * -------------------------------------------------
         */

        if (context.contractType) {

            const knowledge =

                this.knowledge.hybridSearch(

                    context.contractType

                );

            if (knowledge.length > 0) {

                evidences.push({

                    source: "Knowledge",

                    description:

                        `${knowledge.length} elementos relacionados.`

                });

            }

        }

        /**
         * -------------------------------------------------
         * Ejecutar reglas
         * -------------------------------------------------
         */

        const ruleResult =

            this.rules.evaluate(

                context

            );

        if (ruleResult.success) {

            recommendations.push(

                ...ruleResult.recommendations

            );

        }

        /**
         * -------------------------------------------------
         * Resultado
         * -------------------------------------------------
         */

        return {

            success: true,

            decision:

                "Evaluación completada.",

            confidence: this.calculateConfidence(

                evidences,

                recommendations

            ),

            evidences,

            recommendations

        };

    }

    /**
     * =====================================================
     * CONFIANZA
     * =====================================================
     */

    private calculateConfidence(

        evidences: DecisionEvidence[],

        recommendations: string[]

    ): number {

        let confidence = 50;

        confidence += evidences.length * 10;

        confidence += recommendations.length * 5;

        if (confidence > 100) {

            confidence = 100;

        }

        return confidence;

    }

}
