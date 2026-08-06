/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DOCUMENT GENERATION PIPELINE
 *
 * Orquesta la generación automática de todos los documentos
 * que forman un expediente administrativo.
 *
 ******************************************************************************/

import { RepositoryContext } from "../../infrastructure/persistence/RepositoryContext";

export interface DocumentGenerator {

    readonly name: string;

    generate(

        expediente: unknown

    ): Promise<void>;

}

export class DocumentGenerationPipeline {

    private readonly generators:

        DocumentGenerator[] = [];

    constructor(

        private readonly repositories:

            RepositoryContext

    ) {}

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public register(

        generator: DocumentGenerator

    ): void {

        this.generators.push(

            generator

        );

    }

    /**************************************************************************
     *
     * Ejecución
     *
     **************************************************************************/

    public async execute(

        expedienteId: string

    ): Promise<string[]> {

        const expediente =

            await this.repositories

                .expedientes

                .findById(

                    expedienteId

                );

        if (

            !expediente

        ) {

            throw new Error(

                `Expediente '${expedienteId}' no encontrado.`

            );

        }

        const generated: string[] = [];

        for (

            const generator

            of this.generators

        ) {

            await generator.generate(

                expediente

            );

            generated.push(

                generator.name

            );

        }

        return generated;

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public count()

        : number {

        return this.generators.length;

    }

    public names()

        : string[] {

        return this.generators.map(

            generator =>

                generator.name

        );

    }

    public clear()

        : void {

        this.generators.length = 0;

    }

}
