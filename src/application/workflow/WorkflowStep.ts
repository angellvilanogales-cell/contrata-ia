/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowStep
 * ------------------------------------------------------------
 * Define un paso ejecutable del Workflow.
 *
 * Cada paso representa una operación concreta del expediente.
 * Puede corresponder a un motor jurídico, un generador
 * documental o un proceso de validación.
 * ============================================================
 */

import { WorkflowContext } from "./WorkflowContext";

export interface WorkflowStep {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Descripción.
     */
    description: string;

    /**
     * Orden de ejecución.
     */
    order: number;

    /**
     * ¿Puede ejecutarse?
     */
    canExecute(

        context: WorkflowContext

    ): boolean;

    /**
     * Ejecuta el paso.
     */
    execute(

        context: WorkflowContext

    ): Promise<WorkflowContext>;

}
