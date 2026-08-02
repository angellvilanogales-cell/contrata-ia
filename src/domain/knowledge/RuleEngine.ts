/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * RuleEngine
 * ------------------------------------------------------------
 * Motor genérico de reglas del sistema.
 *
 * IMPORTANTE
 *
 * Este motor NO contiene normativa.
 *
 * NO contiene artículos de la LCSP.
 *
 * NO contiene reglas jurídicas.
 *
 * Su única responsabilidad es:
 *
 *  - Registrar reglas.
 *  - Ejecutarlas.
 *  - Resolver conflictos.
 *  - Devolver decisiones.
 *
 * Todas las reglas se incorporarán posteriormente desde los
 * distintos bancos de conocimiento.
 * ============================================================
 */

import { DecisionContext } from "./DecisionContext";
import {
    KnowledgeDecision,
    createKnowledgeDecision
} from "./models/KnowledgeDecision";

/**
 * Prioridad de una regla.
 */
export enum RulePriority {

    LOW = 10,

    NORMAL = 50,

    HIGH = 100,

    CRITICAL = 1000

}

/**
 * Resultado de evaluar una condición.
 */
export interface RuleCondition {

    (
        context: DecisionContext
    ): boolean;

}

/**
 * Acción ejecutada cuando la condición se cumple.
 */
export interface RuleAction {

    (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void;

}

/**
 * Modelo de una regla.
 */
export interface RuleDefinition {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Prioridad.
     */
    priority: RulePriority;

    /**
     * Condición.
     */
    when: RuleCondition;

    /**
     * Acción.
     */
    then: RuleAction;

    /**
     * Permite detener la ejecución del resto de reglas.
     */
    stopProcessing?: boolean;

}

/**
 * Motor principal.
 */
export class RuleEngine {

    /**
     * Reglas registradas.
     */
    private readonly rules: RuleDefinition[] = [];

    /**
     * Registra una regla.
     */
    public register(
        rule: RuleDefinition
    ): void {

        this.rules.push(rule);

        this.rules.sort(
            (a, b) => b.priority - a.priority
        );

    }

    /**
     * Elimina todas las reglas.
     */
    public clear(): void {

        this.rules.length = 0;

    }

    /**
     * Número de reglas.
     */
    public count(): number {

        return this.rules.length;

    }

    /**
     * Ejecuta todas las reglas.
     */
    public execute(
        context: DecisionContext
    ): KnowledgeDecision {

        const decision = createKnowledgeDecision();

        for (const rule of this.rules) {

            if (!rule.when(context)) {

                continue;

            }

            rule.then(
                context,
                decision
            );

            if (rule.stopProcessing) {

                break;

            }

        }

        return decision;

    }

}
