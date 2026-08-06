/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DOCX EXPORTER
 *
 * Exportador Microsoft Word.
 *
 ******************************************************************************/

import * as fs from "fs/promises";
import * as path from "path";

import {

    AbstractDocumentExporter,
    ExportFormat,
    ExportOptions,
    ExportResult

} from "./DocumentExporter";

export class DOCXExporter

    extends AbstractDocumentExporter {

    public readonly format =

        ExportFormat.DOCX;

    public readonly extension =

        ".docx";

    /**************************************************************************
     *
     * Exportación
     *
     **************************************************************************/

    public async export(

        document: unknown,

        options: ExportOptions

    ): Promise<ExportResult> {

        await fs.mkdir(

            options.outputDirectory,

            {

                recursive: true

            }

        );

        const fileName =

            options.fileName ??

            `expediente${this.extension}`;

        const filePath =

            path.join(

                options.outputDirectory,

                fileName

            );

        /*
         * IMPLEMENTACIÓN TEMPORAL
         *
         * En la versión 1.0 este bloque será sustituido por:
         *
         * docx
         * (https://www.npmjs.com/package/docx)
         *
         */

        const content =

            JSON.stringify(

                document,

                null,

                4

            );

        await fs.writeFile(

            filePath,

            content,

            "utf8"

        );

        const metadata =

            this.createMetadata(

                (document as any)?.id ??

                "UNKNOWN",

                "Contrata-IA"

            );

        return this.buildResult(

            filePath,

            fileName,

            metadata

        );

    }

}
