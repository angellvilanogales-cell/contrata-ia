/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT CONFIGURATION
 *
 * Configuración general del sistema de exportación.
 *
 ******************************************************************************/

import { ExportFormat } from "./DocumentExporter";

export interface ExportConfiguration {

    outputDirectory: string;

    overwriteExistingFiles: boolean;

    includeMetadata: boolean;

    compressExports: boolean;

    createSubfolders: boolean;

    defaultFormats: ExportFormat[];

    fileNamePattern: string;

}

export const DefaultExportConfiguration:

    ExportConfiguration = {

    outputDirectory:

        "./exports",

    overwriteExistingFiles:

        true,

    includeMetadata:

        true,

    compressExports:

        false,

    createSubfolders:

        true,

    defaultFormats: [

        ExportFormat.DOCX,

        ExportFormat.PDF

    ],

    fileNamePattern:

        "{expediente}_{fecha}_{formato}"

};

export class ExportConfigurationManager {

    private configuration:

        ExportConfiguration;

    constructor(

        configuration:

            Partial<ExportConfiguration> = {}

    ) {

        this.configuration = {

            ...DefaultExportConfiguration,

            ...configuration

        };

    }

    public get()

        : ExportConfiguration {

        return {

            ...this.configuration

        };

    }

    public update(

        values:

            Partial<ExportConfiguration>

    ): void {

        this.configuration = {

            ...this.configuration,

            ...values

        };

    }

    public reset()

        : void {

        this.configuration = {

            ...DefaultExportConfiguration

        };

    }

    public enableFormat(

        format: ExportFormat

    ): void {

        if (

            !this.configuration.defaultFormats.includes(

                format

            )

        ) {

            this.configuration.defaultFormats.push(

                format

            );

        }

    }

    public disableFormat(

        format: ExportFormat

    ): void {

        this.configuration.defaultFormats =

            this.configuration.defaultFormats.filter(

                item =>

                    item !== format

            );

    }

}
