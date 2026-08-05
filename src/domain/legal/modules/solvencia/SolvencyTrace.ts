/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyTrace
 * ------------------------------------------------------------
 * Registro completo de ejecución del Motor de Solvencia.
 *
 * Permite reconstruir completamente el razonamiento
 * seguido para determinar las exigencias de solvencia.
 *
 * ============================================================
 */

import { SolvencyDecision } from "./SolvencyDecision";

export interface SolvencyTrace {

    /**
     * Fecha de ejecución.
     */
    timestamp: Date;

    /**
     * Versión del motor.
     */
    engineVersion: string;

    /**
     * Tiempo total de ejecución.
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
     * Decisión definitiva.
     */
    finalDecision?: SolvencyDecision;

    /**
     * Historial completo.
     */
    steps: SolvencyTraceStep[];

}

/* ========================================================= */

export interface SolvencyTraceStep {

    /**
     * Identificador de regla.
     */
    ruleId: string;

    /**
     * Nombre.
     */
    ruleName: string;

    /**
     * Prioridad.
     */
    priority: number;

    /**
     * ¿Se ejecutó?
     */
    executed: boolean;

    /**
     * ¿Se aplicó?
     */
    applied: boolean;

    /**
     * Tiempo empleado.
     */
    executionTimeMs: number;

    /**
     * Información adicional.
     */
    message?: string;

}
