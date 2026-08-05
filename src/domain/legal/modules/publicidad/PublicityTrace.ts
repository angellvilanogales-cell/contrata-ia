/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityTrace
 * ------------------------------------------------------------
 * Registro completo de ejecución del Motor de Publicidad.
 *
 * Permite reconstruir completamente el proceso seguido
 * para determinar las obligaciones de publicidad.
 *
 * ============================================================
 */

import { PublicityDecision } from "./PublicityDecision";

export interface PublicityTrace {

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
    finalDecision?: PublicityDecision;

    /**
     * Historial completo.
     */
    steps: PublicityTraceStep[];

}

/* ========================================================= */

export interface PublicityTraceStep {

    /**
     * Regla ejecutada.
     */
    ruleId: string;

    /**
     * Nombre de la regla.
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
     * ¿Produjo resultado?
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
