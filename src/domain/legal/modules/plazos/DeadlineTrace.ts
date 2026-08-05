/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadlineTrace
 * ------------------------------------------------------------
 * Registro completo de ejecución del Motor de Plazos.
 *
 * ============================================================
 */

import { DeadlineDecision } from "./DeadlineDecision";

export interface DeadlineTrace {

    /**
     * Fecha de ejecución.
     */
    timestamp: Date;

    /**
     * Versión del motor.
     */
    engineVersion: string;

    /**
     * Tiempo total.
     */
    executionTimeMs: number;

    /**
     * Número total de reglas.
     */
    totalRules: number;

    /**
     * Reglas ejecutadas.
     */
    executedRules: number;

    /**
     * Reglas aplicadas.
     */
    appliedRules: number;

    /**
     * Decisión final.
     */
    finalDecision?: DeadlineDecision;

    /**
     * Historial.
     */
    steps: DeadlineTraceStep[];

}

export interface DeadlineTraceStep {

    ruleId: string;

    ruleName: string;

    priority: number;

    executed: boolean;

    applied: boolean;

    executionTimeMs: number;

    message?: string;

}
