/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * InferenceTrace
 * ------------------------------------------------------------
 * Registro completo de la ejecución del Motor
 * de Inferencia.
 *
 * Su finalidad es proporcionar trazabilidad
 * completa de todas las decisiones jurídicas.
 *
 * ============================================================
 */

export interface InferenceTrace {

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
     * Reglas ejecutadas.
     */
    executedRules: ExecutedRule[];

}

/* ========================================================= */

export interface ExecutedRule {

    /**
     * Identificador de la regla.
     */
    ruleId: string;

    /**
     * Módulo.
     */
    module: string;

    /**
     * ¿Se ejecutó?
     */
    executed: boolean;

    /**
     * ¿Produjo resultado?
     */
    applied: boolean;

    /**
     * Prioridad utilizada.
     */
    priority: number;

    /**
     * Tiempo de ejecución.
     */
    executionTimeMs: number;

    /**
     * Resultado textual.
     */
    message?: string;

}
