/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureRules
 * ------------------------------------------------------------
 * Reglas del Procedimiento de Adjudicación.
 *
 * IMPORTANTE
 *
 * Estas reglas NO contienen todavía los umbrales
 * económicos definitivos de la LCSP.
 *
 * Únicamente representan la estructura de decisión.
 *
 * Posteriormente el conocimiento extraído desde las fuentes
 * sustituirá las condiciones provisionales.
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
 * RULE-PR-001
 * Existe procedimiento seleccionado.
 * ------------------------------------------------------------
 */
const procedureExists: RuleDefinition = {

    id: "RULE-PR-001",

    name: "Procedimiento informado",

    priority: RulePriority.CRITICAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return facts?.procedure !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El expediente dispone de procedimiento de adjudicación."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-PR-002
 * Procedimiento no informado.
 * ------------------------------------------------------------
 */
const procedureMissing: RuleDefinition = {

    id: "RULE-PR-002",

    name: "Procedimiento no informado",

    priority: RulePriority.CRITICAL,

    stopProcessing: true,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return facts?.procedure === undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.errors.push(
            "Debe determinarse el procedimiento de adjudicación."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-PR-003
 * Relación con Valor Estimado.
 * ------------------------------------------------------------
 */
const procedureDependsEstimatedValue: RuleDefinition = {

    id: "RULE-PR-003",

    name: "El procedimiento depende del Valor Estimado",

    priority: RulePriority.HIGH,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return (
            facts?.estimatedValue !== undefined &&
            facts?.procedure !== undefined
        );

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El procedimiento debe ser coherente con el Valor Estimado."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-PR-004
 * Relación con publicidad.
 * ------------------------------------------------------------
 */
const procedureGeneratesPublication: RuleDefinition = {

    id: "RULE-PR-004",

    name: "El procedimiento condiciona la publicidad",

    priority: RulePriority.NORMAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return facts?.procedure !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El procedimiento determinará las obligaciones de publicidad."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-PR-005
 * Relación con plazos.
 * ------------------------------------------------------------
 */
const procedureGeneratesDeadlines: RuleDefinition = {

    id: "RULE-PR-005",

    name: "El procedimiento condiciona los plazos",

    priority: RulePriority.NORMAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context as any;

        return facts?.procedure !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El procedimiento determinará los plazos mínimos de licitación."
        );

    }

};

/**
 * ============================================================
 * Exportación.
 * ============================================================
 */

export const ProcedureRules: RuleDefinition[] = [

    procedureExists,

    procedureMissing,

    procedureDependsEstimatedValue,

    procedureGeneratesPublication,

    procedureGeneratesDeadlines

];

/**
 * Registro automático.
 */

export function registerProcedureRules(
    engine: {
        register(
            rule: RuleDefinition
        ): void;
    }
): void {

    for (const rule of ProcedureRules) {

        engine.register(rule);

    }

}
