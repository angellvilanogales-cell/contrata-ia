/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeCondition
 * ============================================================
 *
 * Condición que debe cumplirse para que una regla jurídica
 * pueda aplicarse.
 * ============================================================
 */

export enum ComparisonOperator {

    EQUAL,

    NOT_EQUAL,

    GREATER,

    GREATER_OR_EQUAL,

    LESS,

    LESS_OR_EQUAL,

    CONTAINS

}

export interface KnowledgeCondition {

    /**
     * Nombre del hecho.
     */
    fact: string;

    /**
     * Operador.
     */
    operator: ComparisonOperator;

    /**
     * Valor esperado.
     */
    value: unknown;

}
