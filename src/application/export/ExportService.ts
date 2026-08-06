/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT SERVICE
 *
 * Servicio de coordinación de exportaciones.
 *
 ******************************************************************************/

import {

    ExportManager,
    ExportResult

} from "./ExportManager";

import {

    ExportFactory

} from "./ExportFactory";

import {

    ExportFormat

} from "./DocumentExporter";

export class ExportService {

    private readonly manager: ExportManager;

    constructor() {

        this.manager =

            ExportFactory.create();

    }

    /**************************************************************************
     *
     * Exportar todos los formatos
     *
     **************************************************************************/

    public async exportAll(

        expediente: unknown

    ): Promise<ExportResult[]> {

        return this.manager.exportAll(

            expediente

        );

    }

    /**************************************************************************
     *
     * Exportar un formato
     *
     **************************************************************************/

    public async export(

        format: ExportFormat,

        expediente: unknown

    ): Promise<ExportResult> {

        return this.manager.export(

            format,

            expediente

        );

    }

    /**************************************************************************
     *
     * Exportar varios formatos
     *
     **************************************************************************/

    public async exportMultiple(

        formats: ExportFormat[],

        expediente: unknown

    ): Promise<ExportResult[]> {

        const results: ExportResult[] = [];

        for (

            const format

            of formats

        ) {

            results.push(

                await this.export(

                    format,

                    expediente

                )

            );

        }

        return results;

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public availableFormats()

        : string[] {

        return this.manager.availableFormats();

    }

}
