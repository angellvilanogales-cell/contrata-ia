/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * HTML EXPORTER
 *
 * Exportador HTML.
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

export class HTMLExporter

    extends AbstractDocumentExporter {

    public readonly format =

        ExportFormat.HTML;

    public readonly extension =

        ".html";

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

        const html =

`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Contrata-IA</title>

<style>

body{

    font-family:Arial,Helvetica,sans-serif;

    margin:40px;

    background:#ffffff;

}

h1{

    border-bottom:2px solid #333;

}

pre{

    white-space:pre-wrap;

    word-break:break-word;

    background:#f4f4f4;

    padding:20px;

    border-radius:8px;

}

</style>

</head>

<body>

<h1>Asistente de Contratación Pública</h1>

<pre>${JSON.stringify(document,null,4)}</pre>

</body>

</html>`;

        await fs.writeFile(

            filePath,

            html,

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
