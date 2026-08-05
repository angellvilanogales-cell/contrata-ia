/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ConflictType
 * ------------------------------------------------------------
 * Tipología de conflictos jurídicos detectables
 * por el Motor Jurídico.
 *
 * Estos tipos permitirán posteriormente aplicar
 * estrategias automáticas de resolución.
 *
 * ============================================================
 */

export enum ConflictType {

    /**
     * Dos reglas producen decisiones incompatibles.
     */
    RULE_CONFLICT = "RULE_CONFLICT",

    /**
     * Existen varios procedimientos posibles.
     */
    PROCEDURE_CONFLICT = "PROCEDURE_CONFLICT",

    /**
     * Existen varios CPV incompatibles.
     */
    CPV_CONFLICT = "CPV_CONFLICT",

    /**
     * Varias reglas establecen plazos distintos.
     */
    DEADLINE_CONFLICT = "DEADLINE_CONFLICT",

    /**
     * Varias reglas determinan publicidad distinta.
     */
    PUBLICITY_CONFLICT = "PUBLICITY_CONFLICT",

    /**
     * Varias reglas producen distinta solvencia.
     */
    SOLVENCY_CONFLICT = "SOLVENCY_CONFLICT",

    /**
     * Incompatibilidad normativa.
     */
    LEGAL_CONFLICT = "LEGAL_CONFLICT",

    /**
     * Falta información necesaria.
     */
    MISSING_INFORMATION = "MISSING_INFORMATION",

    /**
     * Error interno del motor.
     */
    ENGINE_ERROR = "ENGINE_ERROR"

}
