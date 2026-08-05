/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureTrace
 * ------------------------------------------------------------
 * Registro completo de ejecución del Motor de
 * Procedimientos.
 *
 * Permite auditar completamente cómo se llegó
 * al procedimiento seleccionado.
 *
 * ============================================================
 */

import { ProcedureDecision } from "./ProcedureDecision";

export interface ProcedureTrace {

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
     * Decisión final.
     */
    finalDecision?: ProcedureDecision;

    /**
     * Historial completo.
     */
    steps: ProcedureTraceStep[];

}

/* ========================================================= */

export interface ProcedureTraceStep {

    /**
     * Regla ejecutada.
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
     * Resultado obtenido.
     */
    message?: string;

}
