/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT MANAGER
 *
 * Gestor principal de exportación documental.
 *
 ******************************************************************************/

export interface ExportResult {

    format: string;

    success: boolean;

    fileName: string;

    generatedAt: string;

}

export interface DocumentExporter {

    readonly format: string;

    export(

        expediente: unknown

    ): Promise<ExportResult>;

}

export class ExportManager {

    private readonly exporters:

        DocumentExporter[] = [];

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public register(

        exporter: DocumentExporter

    ): void {

        this.exporters.push(

            exporter

        );

    }

    /**************************************************************************
     *
     * Exportación completa
     *
     **************************************************************************/

    public async exportAll(

        expediente: unknown

    ): Promise<ExportResult[]> {

        const results: ExportResult[] = [];

        for (

            const exporter

            of this.exporters

        ) {

            results.push(

                await exporter.export(

                    expediente

                )

            );

        }

        return results;

    }

    /**************************************************************************
     *
     * Exportación individual
     *
     **************************************************************************/

    public async export(

        format: string,

        expediente: unknown

    ): Promise<ExportResult> {

        const exporter =

            this.exporters.find(

                exporter =>

                    exporter.format === format

            );

        if (

            !exporter

        ) {

            throw new Error(

                `Exporter '${format}' not registered.`

            );

        }

        return exporter.export(

            expediente

        );

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public availableFormats()

        : string[] {

        return this.exporters.map(

            exporter =>

                exporter.format

        );

    }

    public count()

        : number {

        return this.exporters.length;

    }

}
