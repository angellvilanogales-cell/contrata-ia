/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * XML EXPORTER
 *
 * Exportador XML.
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

export class XMLExporter

    extends AbstractDocumentExporter {

    public readonly format =

        ExportFormat.XML;

    public readonly extension =

        ".xml";

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

        const xml =

            this.objectToXML(

                "expediente",

                document

            );

        await fs.writeFile(

            filePath,

            xml,

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

    /**************************************************************************
     *
     * Conversión simple Objeto → XML
     *
     **************************************************************************/

    private objectToXML(

        root: string,

        value: unknown

    ): string {

        return `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>${this.serialize(value)}</${root}>`;

    }

    private serialize(

        value: unknown,

        nodeName = "item"

    ): string {

        if (

            value === null ||

            value === undefined

        ) {

            return "";

        }

        if (

            Array.isArray(value)

        ) {

            return value

                .map(

                    item =>

                        `<${nodeName}>${this.serialize(item)}</${nodeName}>`

                )

                .join("");

        }

        if (

            typeof value === "object"

        ) {

            return Object.entries(

                value as Record<string, unknown>

            )

            .map(

                ([key, val]) =>

                    `<${key}>${this.serialize(val, key)}</${key}>`

            )

            .join("");

        }

        return String(value)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&apos;");

    }

}
