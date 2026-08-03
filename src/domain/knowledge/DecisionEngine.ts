/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionEngine
 * ------------------------------------------------------------
 * Motor inteligente de decisiones.
 *
 * Coordina:
 *
 *  • KnowledgeRepository
 *  • KnowledgeGraph
 *  • RuleEngine
 *  • DecisionTrace
 *
 * Este componente NO contiene conocimiento jurídico.
 *
 * Su única responsabilidad consiste en coordinar todo el
 * ecosistema de conocimiento.
 * ============================================================
 */

import { RuleEngine } from "./RuleEngine";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { DecisionTrace } from "./DecisionTrace";
import { DecisionContext } from "./DecisionContext";
import { KnowledgeDecision } from "./models/KnowledgeDecision";

export class DecisionEngine {

    /**
     * Rule Engine.
     */
    constructor(

        private readonly ruleEngine: RuleEngine,

        private readonly graph: KnowledgeGraph,

        private readonly trace: DecisionTrace

    ) {}

    /**
     * Ejecuta una decisión completa.
     */
    public evaluate(

        context: DecisionContext

    ): KnowledgeDecision {

        const decision = this.ruleEngine.execute(context);

        this.registerTrace(

            context,

            decision

        );

        return decision;

    }

    /**
     * Devuelve los conceptos afectados
     * por un concepto determinado.
     */
    public affectedConcepts(

        concept: string

    ): string[] {

        return this.graph
            .outgoing(concept)
            .map(

                relation => relation.to

            );

    }

    /**
     * Devuelve los conceptos de los que depende.
     */
    public dependencies(

        concept: string

    ): string[] {

        return this.graph
            .incoming(concept)
            .map(

                relation => relation.from

            );

    }

    /**
     * Registra la trazabilidad.
     */
    private registerTrace(

        context: DecisionContext,

        decision: KnowledgeDecision

    ): void {

        this.trace.add({

            timestamp: new Date(),

            concept: "GLOBAL",

            ruleId: "RULE-ENGINE",

            ruleName: "Evaluación completa",

            result: decision.errors.length === 0
                ? "OK"
                : "ERROR",

            explanation:
                "Evaluación completa del expediente.",

            evidences: []

        });

    }

}
