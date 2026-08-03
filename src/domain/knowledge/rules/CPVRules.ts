/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVRules
 * ------------------------------------------------------------
 * Reglas relativas a la clasificación CPV.
 *
 * IMPORTANTE
 *
 * Este módulo NO contiene todavía el catálogo oficial de CPV.
 *
 * El catálogo será construido posteriormente desde:
 *
 *  - listado-cpv.ods
 *  - expedientes reales
 *  - LCSP
 *  - documentación del proyecto
 *
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
 * RULE-CPV-001
 * Existe código CPV.
 * ------------------------------------------------------------
 */

const cpvExists: RuleDefinition = {

    id: "RULE-CPV-001",

    name: "Código CPV informado",

    priority: RulePriority.CRITICAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return facts?.cpv !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "Existe un código CPV asociado al expediente."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-CPV-002
 * Falta el código CPV.
 * ------------------------------------------------------------
 */

const cpvMissing: RuleDefinition = {

    id: "RULE-CPV-002",

    name: "Código CPV no informado",

    priority: RulePriority.CRITICAL,

    stopProcessing: true,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return facts?.cpv === undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.errors.push(
            "Debe indicarse un Código CPV."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-CPV-003
 * El CPV debe ser coherente con el objeto.
 * ------------------------------------------------------------
 */

const cpvMatchesObject: RuleDefinition = {

    id: "RULE-CPV-003",

    name: "Coherencia CPV-Objeto",

    priority: RulePriority.HIGH,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return (
            facts?.cpv !== undefined &&
            facts?.object !== undefined
        );

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El CPV debe corresponder con el objeto contractual."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-CPV-004
 * El CPV condiciona la clasificación.
 * ------------------------------------------------------------
 */

const cpvGeneratesClassification: RuleDefinition = {

    id: "RULE-CPV-004",

    name: "Clasificación derivada del CPV",

    priority: RulePriority.NORMAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return facts?.cpv !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El Código CPV condicionará clasificación, solvencia y pliegos."
        );

    }

};

/**
 * ------------------------------------------------------------
 * RULE-CPV-005
 * El CPV afecta a publicidad.
 * ------------------------------------------------------------
 */

const cpvPublication: RuleDefinition = {

    id: "RULE-CPV-005",

    name: "Publicidad derivada del CPV",

    priority: RulePriority.NORMAL,

    when: (
        context: DecisionContext
    ): boolean => {

        const facts: any = context;

        return facts?.cpv !== undefined;

    },

    then: (
        context: DecisionContext,
        decision: KnowledgeDecision
    ): void => {

        decision.messages.push(
            "El CPV influye en la identificación del contrato y en los anuncios."
        );

    }

};

/**
 * ============================================================
 * Exportación
 * ============================================================
 */

export const CPVRules: RuleDefinition[] = [

    cpvExists,

    cpvMissing,

    cpvMatchesObject,

    cpvGeneratesClassification,

    cpvPublication

];

/**
 * Registro automático.
 */

export function registerCPVRules(

    engine: {

        register(

            rule: RuleDefinition

        ): void;

    }

): void {

    for (const rule of CPVRules) {

        engine.register(rule);

    }

}
