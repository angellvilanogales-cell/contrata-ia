/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * GENERATION PIPELINE
 *
 * Pipeline principal de generación del expediente.
 *
 ******************************************************************************/

import { GenerationContext } from "./GenerationContext";

export interface GenerationStep {

    readonly name: string;

    execute(

        context: GenerationContext

    ): Promise<void>;

}

export class GenerationPipeline {

    private readonly steps: GenerationStep[] = [];

    /**************************************************************************
     *
     * Registro de pasos
     *
     **************************************************************************/

    public register(

        step: GenerationStep

    ): void {

        this.steps.push(

            step

        );

    }

    /**************************************************************************
     *
     * Ejecución
     *
     **************************************************************************/

    public async execute(

        context: GenerationContext

    ): Promise<GenerationContext> {

        for (

            const step

            of this.steps

        ) {

            try {

                await step.execute(

                    context

                );

            }

            catch (

                error

            ) {

                context.addError(

                    step.name,

                    error instanceof Error

                        ? error.message

                        : "Unknown error"

                );

            }

        }

        context.finish();

        return context;

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

    public clear()

        : void {

        this.steps.length = 0;

    }

    /**************************************************************************
     *
     * Comprobación
     *
     **************************************************************************/

    public hasStep(

        name: string

    ): boolean {

        return this.steps.some(

            step =>

                step.name === name

        );

    }

}
