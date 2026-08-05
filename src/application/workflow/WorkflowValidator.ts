/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowValidator
 * ------------------------------------------------------------
 * Comprueba que el Workflow pueda ejecutar un paso.
 * ============================================================
 */

import { WorkflowContext } from "./WorkflowContext";
import { WorkflowStep } from "./WorkflowStep";

export interface WorkflowValidationResult {

    valid: boolean;

    errors: string[];

    warnings: string[];

}

export class WorkflowValidator {

    validateStep(

        context: WorkflowContext,

        step: WorkflowStep

    ): WorkflowValidationResult {

        const errors: string[] = [];
        const warnings: string[] = [];

        if (!step.canExecute(context)) {

            errors.push(

                `El paso '${step.name}' no puede ejecutarse en el estado actual.`

            );

        }

        if (!context.expediente) {

            errors.push(

                "No existe expediente cargado."

            );

        }

        if (!context.currentState) {

            errors.push(

                "No existe estado del Workflow."

            );

        }

        return {

            valid: errors.length === 0,

            errors,

            warnings

        };

    }

}
