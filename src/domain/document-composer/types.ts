/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * types.ts
 *
 * Descripción:
 * Tipos e interfaces comunes para todos los generadores documentales.
 *
 ******************************************************************************************/

export enum DocumentType {
    PCAP = "PCAP",
    PPT = "PPT",
    MEMORIA = "MEMORIA",
    INFORME_NECESIDAD = "INFORME_NECESIDAD",
    INSUFICIENCIA_MEDIOS = "INSUFICIENCIA_MEDIOS",
    INFORME_SOLVENCIA = "INFORME_SOLVENCIA",
    PROPUESTA_ADJUDICACION = "PROPUESTA_ADJUDICACION",
    RESOLUCION_ADJUDICACION = "RESOLUCION_ADJUDICACION",
    FORMALIZACION = "FORMALIZACION",
    EJECUCION = "EJECUCION",
    MODIFICACION = "MODIFICACION",
    PRORROGA = "PRORROGA",
    LIQUIDACION = "LIQUIDACION",
    OTRO = "OTRO"
}

export enum OutputFormat {
    WORD = "WORD",
    PDF = "PDF",
    HTML = "HTML",
    JSON = "JSON"
}

export enum SectionType {
    TITLE,
    SUBTITLE,
    PARAGRAPH,
    TABLE,
    LIST,
    ANNEX,
    FOOTNOTE,
    IMAGE
}

export interface DocumentMetadata {
    id: string;
    title: string;
    subtitle?: string;
    version: string;
    createdAt: Date;
    updatedAt?: Date;
    author: string;
    organisation: string;
    expediente: string;
}

export interface DocumentSection {
    id: string;
    order: number;
    title: string;
    type: SectionType;
    content: unknown;
    visible: boolean;
}

export interface DocumentAnnex {
    id: string;
    title: string;
    description?: string;
    content: unknown;
}

export interface DocumentResult {
    metadata: DocumentMetadata;
    sections: DocumentSection[];
    annexes: DocumentAnnex[];
    warnings: string[];
    errors: string[];
}

export interface GenerationOptions {
    validateBeforeGenerate?: boolean;
    includeIndex?: boolean;
    includeCover?: boolean;
    includeAnnexes?: boolean;
    includeFooter?: boolean;
    includeHeader?: boolean;
    numbering?: boolean;
    output: OutputFormat;
}

export interface GeneratorContext<TExpediente = unknown> {
    expediente: TExpediente;
    options: GenerationOptions;
}

export interface IDocumentGenerator {
    readonly type: DocumentType;
    generate(context: GeneratorContext): Promise<DocumentResult>;
}

export interface IComposer {
    compose(document: DocumentResult): Promise<DocumentResult>;
}

export interface IExporter {
    export(document: DocumentResult, format: OutputFormat): Promise<Buffer | string>;
}

export interface IValidator {
    validate(document: DocumentResult): Promise<string[]>;
}
