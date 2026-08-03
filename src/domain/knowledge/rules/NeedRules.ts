/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * NeedRules
 * ------------------------------------------------------------
 * Reglas relativas a la necesidad de contratar.
 *
 * IMPORTANTE
 *
 * Este módulo constituye la base de la fase de inicio del
 * expediente.
 *
 * Las reglas jurídicas definitivas serán incorporadas desde
 * las memorias justificativas y el banco documental.
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
 * RULE-NEED-001
 * Existe necesidad.
 * ------------------------------------------------------------
 */

const needExists: RuleDefinition = {

    id: "RULE-NEED-001",

    name: "Necesidad informada",

    priority: RulePriority.CRITICAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return (
            facts?.need !== undefined &&
            facts?.need !== null &&
            facts?.need !== ""
        );

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "Existe una necesidad identificada."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-NEED-002
 * Falta justificar la necesidad.
 * ------------------------------------------------------------
 */

const needMissing: RuleDefinition = {

    id: "RULE-NEED-002",

    name: "Necesidad no informada",

    priority: RulePriority.CRITICAL,

    stopProcessing: true,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return (
            facts?.need === undefined ||
            facts?.need === null ||
            facts?.need === ""
        );

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.errors.push(
            "Debe justificarse la necesidad que motiva el expediente."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-NEED-003
 * La necesidad origina el objeto.
 * ------------------------------------------------------------
 */

const needGeneratesObject: RuleDefinition = {

    id: "RULE-NEED-003",

    name: "La necesidad determina el objeto",

    priority: RulePriority.HIGH,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return (
            facts?.need !== undefined &&
            facts?.object !== undefined
        );

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "La necesidad debe ser coherente con el objeto contractual."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-NEED-004
 * La necesidad condiciona la insuficiencia de medios.
 * ------------------------------------------------------------
 */

const needGeneratesInsufficientMeans: RuleDefinition = {

    id: "RULE-NEED-004",

    name: "La necesidad exige justificar insuficiencia de medios",

    priority: RulePriority.NORMAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return facts?.need !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "La necesidad deberá justificarse junto con la insuficiencia de medios propios."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-NEED-005
 * La necesidad inicia el expediente.
 * ------------------------------------------------------------
 */

const needStartsProcedure: RuleDefinition = {

    id: "RULE-NEED-005",

    name: "La necesidad inicia el expediente",

    priority: RulePriority.NORMAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return facts?.need !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "La necesidad constituye el punto de partida del expediente de contratación."
        );

    }

};

/**
 * ============================================================
 * Exportación
 * ============================================================
 */

export const NeedRules: RuleDefinition[] = [

    needExists,

    needMissing,

    needGeneratesObject,

    needGeneratesInsufficientMeans,

    needStartsProcedure

];

/**
 * Registro automático.
 */

export function registerNeedRules(

    engine: {

        register(
            rule: RuleDefinition
        ): void;

    }

): void {

    for (const rule of NeedRules) {

        engine.register(rule);

    }

}
