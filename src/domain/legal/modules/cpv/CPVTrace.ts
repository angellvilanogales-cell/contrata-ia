/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVTrace
 * ------------------------------------------------------------
 * Registro completo de ejecución del Motor CPV.
 *
 * Permite reconstruir completamente el razonamiento que
 * condujo a la selección del código CPV.
 *
 * ============================================================
 */

import { CPVDecision } from "./CPVDecision";

export interface CPVTrace {

    /**
     * Fecha de ejecución.
     */
    timestamp: Date;

    /**
     * Versión del motor.
     */
    engineVersion: string;

    /**
     * Tiempo de ejecución.
     */
    executionTimeMs: number;

    /**
     * Número total de reglas.
     */
    totalRules: number;

    /**
     * Número de reglas ejecutadas.
     */
    executedRules: number;

    /**
     * Número de reglas aplicadas.
     */
    appliedRules: number;

    /**
     * Decisión final.
     */
    finalDecision?: CPVDecision;

    /**
     * Historial completo.
     */
    steps: CPVTraceStep[];

}

export interface CPVTraceStep {

    ruleId: string;

    ruleName: string;

    priority: number;

    executed: boolean;

    applied: boolean;

    executionTimeMs: number;

    message?: string;

}
