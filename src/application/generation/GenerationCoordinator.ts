/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * GENERATION COORDINATOR
 *
 * Coordinador principal de generación del expediente.
 *
 ******************************************************************************/

import { GenerationContext } from "./GenerationContext";
import { GenerationPipeline } from "./GenerationPipeline";
import { WorkflowOrchestrator } from "../integration/WorkflowOrchestrator";

export class GenerationCoordinator {

    constructor(

        private readonly orchestrator: WorkflowOrchestrator,

        private readonly pipeline: GenerationPipeline

    ) {}

    /**************************************************************************
     *
     * Generación completa
     *
     **************************************************************************/

    public async generate(

        expediente: unknown

    ): Promise<GenerationContext> {

        const context =

            new GenerationContext(

                expediente

            );

        await this.initialize(

            context

        );

        await this.pipeline.execute(

            context

        );

        return context;

    }

    /**************************************************************************
     *
     * Inicialización
     *
     **************************************************************************/

    private async initialize(

        context: GenerationContext

    ): Promise<void> {

        const expediente =

            context.expediente as any;

        if (

            expediente?.id

        ) {

            await this.orchestrator.execute(

                expediente.id

            );

        }

    }

    /**************************************************************************
     *
     * Diagnóstico
     *
     **************************************************************************/

    public diagnostics() {

        return {

            pipelineSteps:

                this.pipeline.count(),

            registeredSteps:

                this.pipeline.names()

        };

    }

}
