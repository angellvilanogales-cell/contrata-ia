/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * EstimatedValueRules
 * ------------------------------------------------------------
 * Reglas relativas al Valor Estimado.
 *
 * IMPORTANTE
 *
 * Este archivo constituye el primer conjunto de reglas
 * jurídicas del sistema.
 *
 * Las reglas implementadas son todavía estructurales.
 *
 * El conocimiento definitivo será completado mediante la
 * extracción sistemática desde las fuentes documentales y la
 * normativa.
 * ============================================================
 */

import {
    RuleDefinition,
    RulePriority
} from "../RuleEngine";

import {
    DecisionContext
} from "../DecisionContext";

import {
    KnowledgeDecision
} from "../models/KnowledgeDecision";

/**
 * ------------------------------------------------------------
 * RULE-VE-001
 * ------------------------------------------------------------
 * Verifica que exista un valor estimado.
 * ------------------------------------------------------------
 */
const estimatedValueExists: RuleDefinition = {

    id: "RULE-VE-001",

    name: "Valor estimado informado",

    priority: RulePriority.CRITICAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return facts?.estimatedValue !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "Existe un valor estimado informado."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-VE-002
 * ------------------------------------------------------------
 * Detecta ausencia del valor estimado.
 * ------------------------------------------------------------
 */
const estimatedValueMissing: RuleDefinition = {

    id: "RULE-VE-002",

    name: "Valor estimado no informado",

    priority: RulePriority.CRITICAL,

    stopProcessing: true,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return facts?.estimatedValue === undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.errors.push(
            "Debe informarse el Valor Estimado del contrato."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-VE-003
 * ------------------------------------------------------------
 * Marca el Valor Estimado como concepto crítico.
 * ------------------------------------------------------------
 */
const estimatedValueCritical: RuleDefinition = {

    id: "RULE-VE-003",

    name: "Valor estimado condiciona el expediente",

    priority: RulePriority.HIGH,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return facts?.estimatedValue !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El Valor Estimado condicionará el procedimiento, publicidad, solvencia, garantías y plazos."
        );

    }

};

/**
 * ------------------------------------------------------------
 * Exportación del módulo.
 * ------------------------------------------------------------
 */
export const EstimatedValueRules: RuleDefinition[] = [

    estimatedValueExists,

    estimatedValueMissing,

    estimatedValueCritical

];

/**
 * ------------------------------------------------------------
 * Registro automático.
 * ------------------------------------------------------------
 */
export function registerEstimatedValueRules(
    engine: {
        register(
            rule: RuleDefinition
        ): void;
    }
): void {

    for (const rule of EstimatedValueRules) {

        engine.register(rule);

    }

}
