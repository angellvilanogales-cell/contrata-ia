/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeTrace
 * ------------------------------------------------------------
 * Registro completo de ejecución del Motor de Garantías.
 *
 * Permite reconstruir todo el razonamiento seguido por el
 * motor para determinar las garantías exigibles.
 *
 * ============================================================
 */

import { GuaranteeDecision } from "./GuaranteeDecision";

export interface GuaranteeTrace {

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
    finalDecision?: GuaranteeDecision;

    /**
     * Historial completo.
     */
    steps: GuaranteeTraceStep[];

}

/* ========================================================= */

export interface GuaranteeTraceStep {

    /**
     * Identificador de la regla.
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
