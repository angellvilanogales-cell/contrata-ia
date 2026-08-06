/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * JSON EXPORTER
 *
 * Exportador JSON.
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

export class JSONExporter

    extends AbstractDocumentExporter {

    public readonly format =

        ExportFormat.JSON;

    public readonly extension =

        ".json";

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

        const json =

            JSON.stringify(

                document,

                null,

                4

            );

        await fs.writeFile(

            filePath,

            json,

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
