/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowResult
 * ------------------------------------------------------------
 * Resultado completo de la ejecución del Workflow.
 * ============================================================
 */

import { WorkflowContext } from "./WorkflowContext";
import { WorkflowHistory } from "./WorkflowHistory";

export interface WorkflowResult {

    /**
     * ¿La ejecución terminó correctamente?
     */
    success: boolean;

    /**
     * Contexto final.
     */
    context: WorkflowContext;

    /**
     * Historial completo.
     */
    history: WorkflowHistory;

    /**
     * Tiempo total.
     */
    executionTimeMs: number;

    /**
     * Número de pasos ejecutados.
     */
    executedSteps: number;

    /**
     * Número de pasos omitidos.
     */
    skippedSteps: number;

    /**
     * Advertencias.
     */
    warnings: string[];

    /**
     * Errores.
     */
    errors: string[];

}
