/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DOCUMENT EXPORTER
 *
 * Contrato base para todos los exportadores del sistema.
 *
 ******************************************************************************/

export enum ExportFormat {

    DOCX = "DOCX",

    PDF = "PDF",

    HTML = "HTML",

    MARKDOWN = "MARKDOWN",

    JSON = "JSON",

    XML = "XML"

}

export interface ExportOptions {

    outputDirectory: string;

    fileName?: string;

    overwrite?: boolean;

    includeMetadata?: boolean;

}

export interface ExportMetadata {

    expedienteId: string;

    generatedAt: string;

    generatedBy: string;

    format: ExportFormat;

}

export interface ExportResult {

    success: boolean;

    filePath: string;

    fileName: string;

    format: ExportFormat;

    generatedAt: string;

    size?: number;

    metadata?: ExportMetadata;

    errors?: string[];

}

export interface DocumentExporter {

    readonly format: ExportFormat;

    readonly extension: string;

    export(

        document: unknown,

        options: ExportOptions

    ): Promise<ExportResult>;

}

export abstract class AbstractDocumentExporter

    implements DocumentExporter {

    public abstract readonly format: ExportFormat;

    public abstract readonly extension: string;

    public abstract export(

        document: unknown,

        options: ExportOptions

    ): Promise<ExportResult>;

    protected createMetadata(

        expedienteId: string,

        generatedBy: string

    ): ExportMetadata {

        return {

            expedienteId,

            generatedAt:

                new Date().toISOString(),

            generatedBy,

            format:

                this.format

        };

    }

    protected buildResult(

        filePath: string,

        fileName: string,

        metadata: ExportMetadata

    ): ExportResult {

        return {

            success: true,

            filePath,

            fileName,

            format:

                this.format,

            generatedAt:

                metadata.generatedAt,

            metadata

        };

    }

}
