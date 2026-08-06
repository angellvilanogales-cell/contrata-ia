/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * GENERATION STEP FACTORY
 *
 * Construye automáticamente el pipeline de generación.
 *
 ******************************************************************************/

import {

    GenerationPipeline,
    GenerationStep

} from "./GenerationPipeline";

export class GenerationStepFactory {

    private readonly steps: GenerationStep[] = [];

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public register(

        step: GenerationStep

    ): GenerationStepFactory {

        this.steps.push(

            step

        );

        return this;

    }

    /**************************************************************************
     *
     * Registro múltiple
     *
     **************************************************************************/

    public registerMany(

        steps: readonly GenerationStep[]

    ): GenerationStepFactory {

        this.steps.push(

            ...steps

        );

        return this;

    }

    /**************************************************************************
     *
     * Construcción
     *
     **************************************************************************/

    public build()

        : GenerationPipeline {

        const pipeline =

            new GenerationPipeline();

        for (

            const step

            of this.steps

        ) {

            pipeline.register(

                step

            );

        }

        return pipeline;

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public count()

        : number {

        return this.steps.length;

    }

    public names()

        : string[] {

        return this.steps.map(

            step =>

                step.name

        );

    }

    /**************************************************************************
     *
     * Reinicio
     *
     **************************************************************************/

    public clear()

        : void {

        this.steps.length = 0;

    }

    /**************************************************************************
     *
     * Pipeline por defecto
     *
     **************************************************************************/

    public static createDefault(

        steps: readonly GenerationStep[]

    ): GenerationPipeline {

        return new GenerationStepFactory()

            .registerMany(

                steps

            )

            .build();

    }

}
