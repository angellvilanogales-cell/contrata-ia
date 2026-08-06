/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * GENERATION CONTEXT
 *
 * Contexto compartido durante toda la generación del expediente.
 *
 ******************************************************************************/

export interface GeneratedDocument {

    name: string;

    generatedAt: string;

    success: boolean;

}

export interface GenerationWarning {

    source: string;

    message: string;

}

export interface GenerationError {

    source: string;

    message: string;

}

export class GenerationContext {

    public expediente: unknown;

    public aiResult: unknown;

    public workflowResult: unknown;

    public ruleResult: unknown;

    public costEstimation: unknown;

    public readonly generatedDocuments:

        GeneratedDocument[] = [];

    public readonly warnings:

        GenerationWarning[] = [];

    public readonly errors:

        GenerationError[] = [];

    public readonly metrics = {

        startedAt:

            new Date()

                .toISOString(),

        finishedAt:

            "",

        duration: 0

    };

    constructor(

        expediente: unknown

    ) {

        this.expediente =

            expediente;

    }

    /**************************************************************************
     *
     * Documentos
     *
     **************************************************************************/

    public addDocument(

        name: string,

        success = true

    ): void {

        this.generatedDocuments.push(

            {

                name,

                generatedAt:

                    new Date()

                        .toISOString(),

                success

            }

        );

    }

    /**************************************************************************
     *
     * Advertencias
     *
     **************************************************************************/

    public addWarning(

        source: string,

        message: string

    ): void {

        this.warnings.push(

            {

                source,

                message

            }

        );

    }

    /**************************************************************************
     *
     * Errores
     *
     **************************************************************************/

    public addError(

        source: string,

        message: string

    ): void {

        this.errors.push(

            {

                source,

                message

            }

        );

    }

    /**************************************************************************
     *
     * Finalización
     *
     **************************************************************************/

    public finish()

        : void {

        this.metrics.finishedAt =

            new Date()

                .toISOString();

        this.metrics.duration =

            new Date(

                this.metrics.finishedAt

            ).getTime()

            -

            new Date(

                this.metrics.startedAt

            ).getTime();

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public successful()

        : boolean {

        return this.errors.length === 0;

    }

    public summary() {

        return {

            success:

                this.successful(),

            generatedDocuments:

                this.generatedDocuments.length,

            warnings:

                this.warnings.length,

            errors:

                this.errors.length,

            metrics:

                this.metrics

        };

    }

}
