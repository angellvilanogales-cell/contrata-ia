/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT PIPELINE
 *
 * Orquestador completo del proceso de exportación.
 *
 ******************************************************************************/

import {

    ExportService

} from "./ExportService";

import {

    ExportValidator

} from "./ExportValidator";

import {

    ExportHistory

} from "./ExportHistory";

import {

    ExportPackageGenerator

} from "./ExportPackageGenerator";

import {

    ExportManifestGenerator

} from "./ExportManifestGenerator";

import {

    ExportFormat

} from "./DocumentExporter";

export class ExportPipeline {

    private readonly validator =
        new ExportValidator();

    private readonly exporter =
        new ExportService();

    private readonly history =
        new ExportHistory();

    private readonly packageGenerator =
        new ExportPackageGenerator();

    private readonly manifestGenerator =
        new ExportManifestGenerator();

    /**************************************************************************
     *
     * Ejecución completa
     *
     **************************************************************************/

    public async execute(

        expedienteId: string,

        expediente: unknown,

        formats: ExportFormat[],

        destinationFolder: string,

        user: string = "SYSTEM"

    ) {

        const validation =

            this.validator.validate(

                expediente

            );

        if (

            !validation.valid

        ) {

            throw new Error(

                validation.errors.join(

                    "\n"

                )

            );

        }

        const started =

            Date.now();

        const exportResults =

            await this.exporter.exportMultiple(

                formats,

                expediente

            );

        for (

            const result

            of exportResults

        ) {

            const record =

                this.history.createRecord(

                    expedienteId,

                    user,

                    result,

                    Date.now() -

                    started

                );

            this.history.add(

                record

            );

        }

        const exportedDocuments =

            exportResults

                .filter(

                    result =>

                        result.success

                )

                .map(

                    result => ({

                        name:

                            result.fileName,

                        filePath:

                            result.filePath,

                        format:

                            result.format

                    })

                );

        const packageResult =

            await this.packageGenerator.create(

                expedienteId,

                destinationFolder,

                exportedDocuments

            );

        const manifest =

            await this.manifestGenerator.generate(

                expedienteId,

                packageResult.packageDirectory

            );

        return {

            validation,

            exportResults,

            packageResult,

            manifest,

            history:

                this.history.all()

        };

    }

}
