/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowTrace
 * ------------------------------------------------------------
 * Trazabilidad completa del Workflow.
 * Permite reconstruir toda la ejecución del expediente.
 * ============================================================
 */

export interface WorkflowTrace {

    /**
     * Fecha.
     */
    timestamp: Date;

    /**
     * Versión.
     */
    engineVersion: string;

    /**
     * Tiempo total.
     */
    executionTimeMs: number;

    /**
     * Número total de pasos.
     */
    totalSteps: number;

    /**
     * Número de pasos ejecutados.
     */
    executedSteps: number;

    /**
     * Número de pasos omitidos.
     */
    skippedSteps: number;

    /**
     * Historial.
     */
    steps: WorkflowTraceStep[];

}

export interface WorkflowTraceStep {

    /**
     * Id.
     */
    stepId: string;

    /**
     * Nombre.
     */
    stepName: string;

    /**
     * Orden.
     */
    order: number;

    /**
     * ¿Se ejecutó?
     */
    executed: boolean;

    /**
     * Correcto.
     */
    success: boolean;

    /**
     * Tiempo.
     */
    executionTimeMs: number;

    /**
     * Mensaje.
     */
    message?: string;

}
