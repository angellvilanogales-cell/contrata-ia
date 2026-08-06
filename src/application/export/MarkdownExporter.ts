/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * MARKDOWN EXPORTER
 *
 * Exportador Markdown.
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

export class MarkdownExporter

    extends AbstractDocumentExporter {

    public readonly format =

        ExportFormat.MARKDOWN;

    public readonly extension =

        ".md";

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

        const markdown =

`# Asistente de Contratación Pública

## Documento exportado

Generado automáticamente por Contrata-IA.

---

\`\`\`json
${JSON.stringify(document, null, 4)}
\`\`\`
`;

        await fs.writeFile(

            filePath,

            markdown,

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
