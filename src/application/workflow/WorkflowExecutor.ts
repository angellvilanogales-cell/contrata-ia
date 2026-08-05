/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowExecutor
 * ------------------------------------------------------------
 * Ejecuta secuencialmente los pasos del Workflow.
 * ============================================================
 */

import { WorkflowContext } from "./WorkflowContext";
import { WorkflowStep } from "./WorkflowStep";
import { WorkflowValidator } from "./WorkflowValidator";

export class WorkflowExecutor {

    constructor(

        private readonly validator = new WorkflowValidator()

    ) {}

    async execute(

        context: WorkflowContext,

        steps: WorkflowStep[]

    ): Promise<WorkflowContext> {

        const ordered = [...steps].sort(

            (a, b) => a.order - b.order

        );

        let current = context;

        for (const step of ordered) {

            const validation =

                this.validator.validateStep(

                    current,

                    step

                );

            if (!validation.valid) {

                throw new Error(

                    validation.errors.join("\n")

                );

            }

            current = await step.execute(current);

        }

        return current;

    }

}
