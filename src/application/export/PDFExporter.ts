/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PDF EXPORTER
 *
 * Exportador PDF.
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

export class PDFExporter

    extends AbstractDocumentExporter {

    public readonly format =

        ExportFormat.PDF;

    public readonly extension =

        ".pdf";

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
         * En la versión definitiva se sustituirá
         * por pdf-lib o PDFKit.
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
