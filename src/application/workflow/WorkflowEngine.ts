/**
 * ============================================================
 * CONTRATA-IA
 * WorkflowEngine
 * ------------------------------------------------------------
 * Orquestador principal del expediente.
 * ============================================================
 */

import { WorkflowContext } from "./WorkflowContext";
import { WorkflowExecutor } from "./WorkflowExecutor";
import { WorkflowStep } from "./WorkflowStep";
import { WorkflowResult } from "./WorkflowResult";
import { WorkflowHistory } from "./WorkflowHistory";

export class WorkflowEngine {

    constructor(

        private readonly executor = new WorkflowExecutor()

    ) {}

    public async run(

        context: WorkflowContext,

        steps: WorkflowStep[]

    ): Promise<WorkflowResult> {

        const started = Date.now();

        const history: WorkflowHistory = {

            expedienteId: context.expediente.id,

            entries: []

        };

        const finalContext = await this.executor.execute(

            context,

            steps

        );

        return {

            success: true,

            context: finalContext,

            history,

            executionTimeMs:

                Date.now() - started,

            executedSteps: steps.length,

            skippedSteps: 0,

            warnings: [],

            errors: []

        };

    }

}
