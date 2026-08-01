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

    generate(

        context: GeneratorContext

    ): Promise<DocumentResult>;

}

export interface IComposer {

    compose(

        document: DocumentResult

    ): Promise<DocumentResult>;

}

export interface IExporter {

    export(

        document: DocumentResult,

        format: OutputFormat

    ): Promise<Buffer | string>;

}

export interface IValidator {

    validate(

        document: DocumentResult

    ): Promise<string[]>;

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * DocumentContext.ts
 *
 * Descripción:
 * Contexto común utilizado por todos los generadores documentales.
 *
 ******************************************************************************************/

import {

    DocumentMetadata,

    GenerationOptions,

    GeneratorContext

} from "./types";

export class DocumentContext<TExpediente = unknown> {

    private readonly expediente: TExpediente;

    private readonly metadata: DocumentMetadata;

    private readonly options: GenerationOptions;

    private readonly sharedData: Map<string, unknown>;

    constructor(

        expediente: TExpediente,

        metadata: DocumentMetadata,

        options: GenerationOptions

    ) {

        this.expediente = expediente;

        this.metadata = metadata;

        this.options = options;

        this.sharedData = new Map();

    }

    public getExpediente(): TExpediente {

        return this.expediente;

    }

    public getMetadata(): DocumentMetadata {

        return this.metadata;

    }

    public getOptions(): GenerationOptions {

        return this.options;

    }

    public has(key: string): boolean {

        return this.sharedData.has(key);

    }

    public get<T>(key: string): T | undefined {

        return this.sharedData.get(key) as T | undefined;

    }

    public set<T>(

        key: string,

        value: T

    ): void {

        this.sharedData.set(key, value);

    }

    public remove(

        key: string

    ): void {

        this.sharedData.delete(key);

    }

    public clear(): void {

        this.sharedData.clear();

    }

    public keys(): string[] {

        return [...this.sharedData.keys()];

    }

    public values(): unknown[] {

        return [...this.sharedData.values()];

    }

    public entries(): [string, unknown][] {

        return [...this.sharedData.entries()];

    }

    public toGeneratorContext(): GeneratorContext<TExpediente> {

        return {

            expediente: this.expediente,

            options: this.options

        };

    }

    public clone(): DocumentContext<TExpediente> {

        const context = new DocumentContext(

            this.expediente,

            { ...this.metadata },

            { ...this.options }

        );

        for (const [key, value] of this.sharedData.entries()) {

            context.set(key, value);

        }

        return context;

    }

    public freeze(): Readonly<DocumentContext<TExpediente>> {

        return Object.freeze(this);

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * BaseDocumentGenerator.ts
 *
 * Clase base para todos los generadores documentales.
 *
 ******************************************************************************************/

import {

    DocumentType,

    DocumentResult,

    DocumentSection,

    DocumentAnnex,

    DocumentMetadata,

    GeneratorContext,

    IDocumentGenerator

} from "./types";

import { DocumentContext } from "./DocumentContext";

export abstract class BaseDocumentGenerator
implements IDocumentGenerator {

    public abstract readonly type: DocumentType;

    protected context!: DocumentContext;

    protected metadata!: DocumentMetadata;

    protected sections: DocumentSection[] = [];

    protected annexes: DocumentAnnex[] = [];

    protected warnings: string[] = [];

    protected errors: string[] = [];

    public async generate(

        context: GeneratorContext

    ): Promise<DocumentResult> {

        this.initialize(context);

        await this.beforeGenerate();

        await this.buildDocument();

        await this.afterGenerate();

        return this.createResult();

    }

    protected initialize(

        context: GeneratorContext

    ): void {

        this.context = new DocumentContext(

            context.expediente,

            this.createMetadata(),

            context.options

        );

        this.metadata = this.context.getMetadata();

        this.sections = [];

        this.annexes = [];

        this.warnings = [];

        this.errors = [];

    }

    protected createMetadata(): DocumentMetadata {

        return {

            id: crypto.randomUUID(),

            title: "",

            version: "1.0",

            createdAt: new Date(),

            author: "Contrata-IA",

            organisation: "Junta de Andalucía",

            expediente: ""

        };

    }

    protected async beforeGenerate(): Promise<void> {

        // extensión

    }

    protected async afterGenerate(): Promise<void> {

        // extensión

    }

    protected abstract buildDocument(): Promise<void>;

    protected addSection(

        section: DocumentSection

    ): void {

        this.sections.push(section);

    }

    protected addAnnex(

        annex: DocumentAnnex

    ): void {

        this.annexes.push(annex);

    }

    protected addWarning(

        warning: string

    ): void {

        this.warnings.push(warning);

    }

    protected addError(

        error: string

    ): void {

        this.errors.push(error);

    }

    protected setTitle(

        title: string

    ): void {

        this.metadata.title = title;

    }

    protected setSubtitle(

        subtitle: string

    ): void {

        this.metadata.subtitle = subtitle;

    }

    protected updateVersion(

        version: string

    ): void {

        this.metadata.version = version;

    }

    protected updateExpediente(

        expediente: string

    ): void {

        this.metadata.expediente = expediente;

    }

    protected createResult(): DocumentResult {

        return {

            metadata: this.metadata,

            sections: this.sections,

            annexes: this.annexes,

            warnings: this.warnings,

            errors: this.errors

        };

    }

    protected getContext(): DocumentContext {

        return this.context;

    }

    protected getExpediente<T>(): T {

        return this.context.getExpediente() as T;

    }

    protected getShared<T>(

        key: string

    ): T | undefined {

        return this.context.get<T>(key);

    }

    protected setShared<T>(

        key: string,

        value: T

    ): void {

        this.context.set(key, value);

    }

    protected clearShared(

        key: string

    ): void {

        this.context.remove(key);

    }

    protected hasShared(

        key: string

    ): boolean {

        return this.context.has(key);

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * DocumentFactory.ts
 *
 * Responsable de crear el generador adecuado
 * para cada tipo documental.
 *
 ******************************************************************************************/

import {

    DocumentType,

    IDocumentGenerator

} from "./types";

import { BaseDocumentGenerator } from "./BaseDocumentGenerator";

/*
 * IMPORTACIONES DE GENERADORES
 *
 * Se irán incorporando conforme se desarrollen.
 */

import { PCAPGeneratorEngine } from "../pcap/PCAPGeneratorEngine";

// Futuros motores

// import { PPTGeneratorEngine } from "../ppt/PPTGeneratorEngine";
// import { MemoryGeneratorEngine } from "../memoria/MemoryGeneratorEngine";
// import { NeedReportGenerator } from "../informes/NeedReportGenerator";
// import { AwardGenerator } from "../adjudicacion/AwardGenerator";

export class DocumentFactory {

    private readonly registry =
        new Map<DocumentType, new () => IDocumentGenerator>();

    constructor() {

        this.registerDefaults();

    }

    /**
     * Registro inicial de motores.
     */

    private registerDefaults(): void {

        this.register(

            DocumentType.PCAP,

            PCAPGeneratorEngine

        );

    }

    /**
     * Permite registrar nuevos motores
     * sin modificar el Framework.
     */

    public register(

        type: DocumentType,

        generator: new () => IDocumentGenerator

    ): void {

        this.registry.set(

            type,

            generator

        );

    }

    /**
     * Comprueba si existe un generador.
     */

    public has(

        type: DocumentType

    ): boolean {

        return this.registry.has(type);

    }

    /**
     * Devuelve la lista de documentos soportados.
     */

    public supportedDocuments(): DocumentType[] {

        return [...this.registry.keys()];

    }

    /**
     * Obtiene una instancia del generador.
     */

    public create(

        type: DocumentType

    ): IDocumentGenerator {

        const Generator = this.registry.get(type);

        if (!Generator) {

            throw new Error(

                `No existe generador para ${type}`

            );

        }

        return new Generator();

    }

    /**
     * Elimina un registro.
     */

    public unregister(

        type: DocumentType

    ): boolean {

        return this.registry.delete(type);

    }

    /**
     * Reinicia completamente la factoría.
     */

    public clear(): void {

        this.registry.clear();

    }

    /**
     * Número de motores registrados.
     */

    public count(): number {

        return this.registry.size;

    }

    /**
     * Información resumida.
     */

    public summary(): string {

        const docs = this.supportedDocuments()

            .map(d => ` - ${d}`)

            .join("\n");

        return [

            "Document Factory",

            "================",

            "",

            `Generadores registrados: ${this.count()}`,

            "",

            docs

        ].join("\n");

    }

    /**
     * Verifica que todos los generadores
     * hereden correctamente.
     */

    public validate(): string[] {

        const errors: string[] = [];

        this.registry.forEach(

            (Generator, type) => {

                const instance = new Generator();

                if (!(instance instanceof BaseDocumentGenerator)) {

                    errors.push(

                        `${type} no hereda de BaseDocumentGenerator`

                    );

                }

            }

        );

        return errors;

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * DocumentComposer.ts
 *
 * Orquestador principal del Framework Documental.
 *
 ******************************************************************************************/

import {

    DocumentType,

    GeneratorContext,

    DocumentResult,

    IDocumentGenerator

} from "./types";

import { DocumentFactory } from "./DocumentFactory";

export class DocumentComposer {

    private readonly factory: DocumentFactory;

    constructor(

        factory?: DocumentFactory

    ) {

        this.factory = factory ?? new DocumentFactory();

    }

    /**
     * Genera un documento.
     */

    public async generate(

        type: DocumentType,

        context: GeneratorContext

    ): Promise<DocumentResult> {

        const generator = this.factory.create(type);

        return generator.generate(context);

    }

    /**
     * Obtiene un generador.
     */

    public getGenerator(

        type: DocumentType

    ): IDocumentGenerator {

        return this.factory.create(type);

    }

    /**
     * Comprueba si un documento está soportado.
     */

    public supports(

        type: DocumentType

    ): boolean {

        return this.factory.has(type);

    }

    /**
     * Lista de documentos disponibles.
     */

    public supportedDocuments(): DocumentType[] {

        return this.factory.supportedDocuments();

    }

    /**
     * Registra un nuevo generador.
     */

    public register(

        type: DocumentType,

        generator: new () => IDocumentGenerator

    ): void {

        this.factory.register(

            type,

            generator

        );

    }

    /**
     * Elimina un generador.
     */

    public unregister(

        type: DocumentType

    ): boolean {

        return this.factory.unregister(type);

    }

    /**
     * Número de documentos disponibles.
     */

    public count(): number {

        return this.factory.count();

    }

    /**
     * Verificación general del Framework.
     */

    public validateFramework(): string[] {

        return this.factory.validate();

    }

    /**
     * Información resumida.
     */

    public info(): string {

        return [

            "================================",

            "CONTRATA IA",

            "DOCUMENT COMPOSER",

            "================================",

            "",

            `Generadores: ${this.count()}`,

            "",

            ...this.supportedDocuments()

                .map(

                    d => `• ${d}`

                ),

            "",

            "================================"

        ].join("\n");

    }

    /**
     * Permite generar múltiples documentos.
     */

    public async generateMany(

        requests: {

            type: DocumentType;

            context: GeneratorContext;

        }[]

    ): Promise<DocumentResult[]> {

        const results: DocumentResult[] = [];

        for (const request of requests) {

            results.push(

                await this.generate(

                    request.type,

                    request.context

                )

            );

        }

        return results;

    }

    /**
     * Generación paralela.
     */

    public async generateParallel(

        requests: {

            type: DocumentType;

            context: GeneratorContext;

        }[]

    ): Promise<DocumentResult[]> {

        return Promise.all(

            requests.map(

                request =>

                    this.generate(

                        request.type,

                        request.context

                    )

            )

        );

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * SectionComposer.ts
 *
 * Responsable de construir las distintas secciones
 * de cualquier documento administrativo.
 *
 ******************************************************************************************/

import {

    DocumentSection,

    SectionType

} from "./types";

export class SectionComposer {

    private sections: DocumentSection[] = [];

    /**
     * Reinicia la colección.
     */

    public clear(): void {

        this.sections = [];

    }

    /**
     * Añade una sección completa.
     */

    public add(

        section: DocumentSection

    ): this {

        this.sections.push(section);

        return this;

    }

    /**
     * Crea un título.
     */

    public title(

        order: number,

        text: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            order,

            title: text,

            type: SectionType.TITLE,

            content: text,

            visible: true

        });

    }

    /**
     * Crea un subtítulo.
     */

    public subtitle(

        order: number,

        text: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            order,

            title: text,

            type: SectionType.SUBTITLE,

            content: text,

            visible: true

        });

    }

    /**
     * Añade un párrafo.
     */

    public paragraph(

        order: number,

        title: string,

        text: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            order,

            title,

            type: SectionType.PARAGRAPH,

            content: text,

            visible: true

        });

    }

    /**
     * Añade una lista.
     */

    public list(

        order: number,

        title: string,

        items: string[]

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            order,

            title,

            type: SectionType.LIST,

            content: items,

            visible: true

        });

    }

    /**
     * Añade una tabla.
     */

    public table(

        order: number,

        title: string,

        rows: unknown[]

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            order,

            title,

            type: SectionType.TABLE,

            content: rows,

            visible: true

        });

    }

    /**
     * Añade una imagen.
     */

    public image(

        order: number,

        title: string,

        image: unknown

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            order,

            title,

            type: SectionType.IMAGE,

            content: image,

            visible: true

        });

    }

    /**
     * Añade una nota.
     */

    public footnote(

        order: number,

        text: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            order,

            title: "Nota",

            type: SectionType.FOOTNOTE,

            content: text,

            visible: true

        });

    }

    /**
     * Inserta una sección al principio.
     */

    public prepend(

        section: DocumentSection

    ): this {

        this.sections.unshift(section);

        return this;

    }

    /**
     * Elimina una sección.
     */

    public remove(

        id: string

    ): this {

        this.sections = this.sections.filter(

            s => s.id !== id

        );

        return this;

    }

    /**
     * Busca una sección.
     */

    public find(

        id: string

    ): DocumentSection | undefined {

        return this.sections.find(

            s => s.id === id

        );

    }

    /**
     * Devuelve todas las secciones ordenadas.
     */

    public build(): DocumentSection[] {

        return this.sections.sort(

            (a, b) => a.order - b.order

        );

    }

    /**
     * Número de secciones.
     */

    public count(): number {

        return this.sections.length;

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * AnnexComposer.ts
 *
 * Responsable de construir los anexos de cualquier documento.
 *
 ******************************************************************************************/

import {

    DocumentAnnex

} from "./types";

export class AnnexComposer {

    private annexes: DocumentAnnex[] = [];

    /**
     * Reinicia la colección.
     */

    public clear(): void {

        this.annexes = [];

    }

    /**
     * Añade un anexo completo.
     */

    public add(

        annex: DocumentAnnex

    ): this {

        this.annexes.push(annex);

        return this;

    }

    /**
     * Crea un anexo de texto.
     */

    public text(

        title: string,

        content: string,

        description?: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            title,

            description,

            content

        });

    }

    /**
     * Crea un anexo tipo tabla.
     */

    public table(

        title: string,

        rows: unknown[],

        description?: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            title,

            description,

            content: rows

        });

    }

    /**
     * Crea un anexo documental.
     */

    public document(

        title: string,

        document: unknown,

        description?: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            title,

            description,

            content: document

        });

    }

    /**
     * Crea un anexo de imágenes.
     */

    public images(

        title: string,

        images: unknown[],

        description?: string

    ): this {

        return this.add({

            id: crypto.randomUUID(),

            title,

            description,

            content: images

        });

    }

    /**
     * Inserta un anexo al principio.
     */

    public prepend(

        annex: DocumentAnnex

    ): this {

        this.annexes.unshift(annex);

        return this;

    }

    /**
     * Elimina un anexo.
     */

    public remove(

        id: string

    ): this {

        this.annexes = this.annexes.filter(

            annex => annex.id !== id

        );

        return this;

    }

    /**
     * Busca un anexo.
     */

    public find(

        id: string

    ): DocumentAnnex | undefined {

        return this.annexes.find(

            annex => annex.id === id

        );

    }

    /**
     * Comprueba si existe un anexo.
     */

    public contains(

        id: string

    ): boolean {

        return this.find(id) !== undefined;

    }

    /**
     * Devuelve todos los anexos.
     */

    public build(): DocumentAnnex[] {

        return [...this.annexes];

    }

    /**
     * Número de anexos.
     */

    public count(): number {

        return this.annexes.length;

    }

    /**
     * Devuelve todos los títulos.
     */

    public titles(): string[] {

        return this.annexes.map(

            annex => annex.title

        );

    }

    /**
     * Ordena los anexos alfabéticamente.
     */

    public sortByTitle(): this {

        this.annexes.sort(

            (a, b) => a.title.localeCompare(b.title)

        );

        return this;

    }

    /**
     * Fusiona otra colección de anexos.
     */

    public merge(

        annexes: DocumentAnnex[]

    ): this {

        annexes.forEach(

            annex => this.annexes.push(annex)

        );

        return this;

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * NumberingEngine.ts
 *
 * Motor de numeración documental.
 *
 ******************************************************************************************/

export interface NumberingNode {

    id: string;

    title: string;

    level: number;

    number?: string;

}

export class NumberingEngine {

    private counters: number[] = [];

    constructor() {

        this.reset();

    }

    /**
     * Reinicia la numeración.
     */

    public reset(): void {

        this.counters = [0, 0, 0, 0, 0, 0];

    }

    /**
     * Obtiene la numeración correspondiente
     * al nivel indicado.
     */

    public next(level: number): string {

        if (level < 1) {

            level = 1;

        }

        if (level > this.counters.length) {

            level = this.counters.length;

        }

        this.counters[level - 1]++;

        for (

            let i = level;

            i < this.counters.length;

            i++

        ) {

            this.counters[i] = 0;

        }

        return this.build(level);

    }

    /**
     * Construye la cadena de numeración.
     */

    private build(level: number): string {

        return this.counters

            .slice(0, level)

            .filter(value => value > 0)

            .join(".");

    }

    /**
     * Numera automáticamente
     * una colección de nodos.
     */

    public numberSections(

        nodes: NumberingNode[]

    ): NumberingNode[] {

        this.reset();

        return nodes.map(node => {

            return {

                ...node,

                number: this.next(node.level)

            };

        });

    }

    /**
     * Devuelve el estado interno.
     */

    public state(): number[] {

        return [...this.counters];

    }

    /**
     * Permite establecer una numeración
     * existente.
     */

    public restore(

        values: number[]

    ): void {

        this.reset();

        values.forEach(

            (value, index) => {

                if (

                    index < this.counters.length

                ) {

                    this.counters[index] = value;

                }

            }

        );

    }

    /**
     * Calcula el siguiente número
     * sin modificar el estado.
     */

    public preview(level: number): string {

        const backup = this.state();

        const value = this.next(level);

        this.restore(backup);

        return value;

    }

    /**
     * Devuelve el nivel máximo soportado.
     */

    public maxDepth(): number {

        return this.counters.length;

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * FormattingEngine.ts
 *
 * Motor encargado del formato común
 * de todos los documentos administrativos.
 *
 ******************************************************************************************/

import {

    DocumentResult,

    DocumentSection,

    SectionType

} from "./types";

export interface FormattingOptions {

    uppercaseTitles?: boolean;

    trimParagraphs?: boolean;

    normalizeSpaces?: boolean;

    removeEmptySections?: boolean;

}

export class FormattingEngine {

    private readonly options: FormattingOptions;

    constructor(

        options: FormattingOptions = {}

    ) {

        this.options = {

            uppercaseTitles: true,

            trimParagraphs: true,

            normalizeSpaces: true,

            removeEmptySections: true,

            ...options

        };

    }

    /**
     * Formatea un documento completo.
     */

    public format(

        document: DocumentResult

    ): DocumentResult {

        return {

            ...document,

            sections: this.formatSections(

                document.sections

            )

        };

    }

    /**
     * Formatea todas las secciones.
     */

    private formatSections(

        sections: DocumentSection[]

    ): DocumentSection[] {

        let result = sections.map(

            section => this.formatSection(section)

        );

        if (

            this.options.removeEmptySections

        ) {

            result = result.filter(

                section => !this.isEmpty(section)

            );

        }

        return result;

    }

    /**
     * Formatea una sección.
     */

    private formatSection(

        section: DocumentSection

    ): DocumentSection {

        return {

            ...section,

            title: this.formatTitle(

                section.title

            ),

            content: this.formatContent(

                section

            )

        };

    }

    /**
     * Formatea títulos.
     */

    private formatTitle(

        value: string

    ): string {

        let result = value;

        if (

            this.options.normalizeSpaces

        ) {

            result = result.replace(

                /\s+/g,

                " "

            );

        }

        result = result.trim();

        if (

            this.options.uppercaseTitles

        ) {

            result = result.toUpperCase();

        }

        return result;

    }

    /**
     * Formatea contenido.
     */

    private formatContent(

        section: DocumentSection

    ): unknown {

        if (

            typeof section.content !== "string"

        ) {

            return section.content;

        }

        let text = section.content;

        if (

            this.options.normalizeSpaces

        ) {

            text = text.replace(

                /\s+/g,

                " "

            );

        }

        if (

            this.options.trimParagraphs

        ) {

            text = text.trim();

        }

        return text;

    }

    /**
     * Comprueba si una sección está vacía.
     */

    private isEmpty(

        section: DocumentSection

    ): boolean {

        if (

            section.content === null ||

            section.content === undefined

        ) {

            return true;

        }

        if (

            typeof section.content === "string"

        ) {

            return section.content.trim().length === 0;

        }

        if (

            Array.isArray(section.content)

        ) {

            return section.content.length === 0;

        }

        return false;

    }

    /**
     * Capitaliza únicamente la primera letra.
     */

    public sentenceCase(

        value: string

    ): string {

        if (!value.length) {

            return value;

        }

        return (

            value.charAt(0).toUpperCase() +

            value.slice(1).toLowerCase()

        );

    }

    /**
     * Convierte un texto a mayúsculas.
     */

    public upper(

        value: string

    ): string {

        return value.toUpperCase();

    }

    /**
     * Convierte un texto a minúsculas.
     */

    public lower(

        value: string

    ): string {

        return value.toLowerCase();

    }

    /**
     * Elimina espacios duplicados.
     */

    public normalize(

        value: string

    ): string {

        return value

            .replace(/\s+/g, " ")

            .trim();

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * DocumentMetadata.ts
 *
 * Gestión de los metadatos documentales comunes.
 *
 ******************************************************************************************/

import { DocumentMetadata } from "./types";

export class DocumentMetadataManager {

    private metadata: DocumentMetadata;

    constructor() {

        this.metadata = {

            id: crypto.randomUUID(),

            title: "",

            subtitle: "",

            version: "1.0.0",

            createdAt: new Date(),

            updatedAt: undefined,

            author: "Contrata-IA",

            organisation: "Junta de Andalucía",

            expediente: ""

        };

    }

    /**
     * Devuelve todos los metadatos.
     */

    public get(): DocumentMetadata {

        return {

            ...this.metadata

        };

    }

    /**
     * Sustituye completamente los metadatos.
     */

    public set(

        metadata: DocumentMetadata

    ): void {

        this.metadata = {

            ...metadata

        };

    }

    /**
     * Actualiza únicamente los campos indicados.
     */

    public update(

        values: Partial<DocumentMetadata>

    ): void {

        this.metadata = {

            ...this.metadata,

            ...values,

            updatedAt: new Date()

        };

    }

    /**
     * Identificador del documento.
     */

    public id(): string {

        return this.metadata.id;

    }

    /**
     * Título.
     */

    public title(): string {

        return this.metadata.title;

    }

    public setTitle(

        value: string

    ): void {

        this.metadata.title = value;

    }

    /**
     * Subtítulo.
     */

    public subtitle(): string {

        return this.metadata.subtitle ?? "";

    }

    public setSubtitle(

        value: string

    ): void {

        this.metadata.subtitle = value;

    }

    /**
     * Expediente.
     */

    public expediente(): string {

        return this.metadata.expediente;

    }

    public setExpediente(

        value: string

    ): void {

        this.metadata.expediente = value;

    }

    /**
     * Autor.
     */

    public author(): string {

        return this.metadata.author;

    }

    public setAuthor(

        value: string

    ): void {

        this.metadata.author = value;

    }

    /**
     * Organización.
     */

    public organisation(): string {

        return this.metadata.organisation;

    }

    public setOrganisation(

        value: string

    ): void {

        this.metadata.organisation = value;

    }

    /**
     * Versión.
     */

    public version(): string {

        return this.metadata.version;

    }

    public setVersion(

        value: string

    ): void {

        this.metadata.version = value;

    }

    /**
     * Fecha de creación.
     */

    public createdAt(): Date {

        return this.metadata.createdAt;

    }

    /**
     * Marca modificación.
     */

    public touch(): void {

        this.metadata.updatedAt = new Date();

    }

    /**
     * Reinicia completamente.
     */

    public reset(): void {

        this.metadata = {

            id: crypto.randomUUID(),

            title: "",

            subtitle: "",

            version: "1.0.0",

            createdAt: new Date(),

            updatedAt: undefined,

            author: "Contrata-IA",

            organisation: "Junta de Andalucía",

            expediente: ""

        };

    }

    /**
     * Información resumida.
     */

    public summary(): string {

        return [

            "================================",

            "DOCUMENT METADATA",

            "================================",

            `Título      : ${this.metadata.title}`,

            `Versión     : ${this.metadata.version}`,

            `Expediente  : ${this.metadata.expediente}`,

            `Autor       : ${this.metadata.author}`,

            `Organización: ${this.metadata.organisation}`,

            `Creado      : ${this.metadata.createdAt.toISOString()}`,

            this.metadata.updatedAt

                ? `Actualizado : ${this.metadata.updatedAt.toISOString()}`

                : "",

            "================================"

        ]

        .filter(Boolean)

        .join("\n");

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * DocumentValidator.ts
 *
 * Responsable de validar la estructura y consistencia
 * de cualquier documento generado.
 *
 ******************************************************************************************/

import {

    DocumentResult,

    DocumentSection,

    DocumentAnnex,

    IValidator

} from "./types";

export interface ValidationMessage {

    code: string;

    level: "INFO" | "WARNING" | "ERROR";

    message: string;

}

export class DocumentValidator implements IValidator {

    public async validate(

        document: DocumentResult

    ): Promise<string[]> {

        return this.validateDetailed(document)

            .filter(v => v.level === "ERROR")

            .map(v => v.message);

    }

    /**
     * Validación completa.
     */

    public validateDetailed(

        document: DocumentResult

    ): ValidationMessage[] {

        const messages: ValidationMessage[] = [];

        this.validateMetadata(document, messages);

        this.validateSections(document.sections, messages);

        this.validateAnnexes(document.annexes, messages);

        this.validateDuplicates(document.sections, messages);

        this.validateOrdering(document.sections, messages);

        return messages;

    }

    /**
     * -------------------------
     * METADATOS
     * -------------------------
     */

    private validateMetadata(

        document: DocumentResult,

        messages: ValidationMessage[]

    ): void {

        if (!document.metadata.title?.trim()) {

            messages.push({

                code: "META001",

                level: "ERROR",

                message: "El documento no tiene título."

            });

        }

        if (!document.metadata.version) {

            messages.push({

                code: "META002",

                level: "WARNING",

                message: "No se ha indicado versión."

            });

        }

        if (!document.metadata.organisation) {

            messages.push({

                code: "META003",

                level: "WARNING",

                message: "No se ha indicado la organización."

            });

        }

    }

    /**
     * -------------------------
     * SECCIONES
     * -------------------------
     */

    private validateSections(

        sections: DocumentSection[],

        messages: ValidationMessage[]

    ): void {

        if (sections.length === 0) {

            messages.push({

                code: "SEC001",

                level: "ERROR",

                message: "El documento no contiene secciones."

            });

        }

        sections.forEach(section => {

            if (!section.title?.trim()) {

                messages.push({

                    code: "SEC002",

                    level: "WARNING",

                    message: `Sección ${section.id} sin título.`

                });

            }

            if (

                section.content === null ||

                section.content === undefined

            ) {

                messages.push({

                    code: "SEC003",

                    level: "WARNING",

                    message: `Sección ${section.title} vacía.`

                });

            }

        });

    }

    /**
     * -------------------------
     * ANEXOS
     * -------------------------
     */

    private validateAnnexes(

        annexes: DocumentAnnex[],

        messages: ValidationMessage[]

    ): void {

        annexes.forEach(annex => {

            if (!annex.title?.trim()) {

                messages.push({

                    code: "ANN001",

                    level: "WARNING",

                    message: "Existe un anexo sin título."

                });

            }

        });

    }

    /**
     * -------------------------
     * DUPLICADOS
     * -------------------------
     */

    private validateDuplicates(

        sections: DocumentSection[],

        messages: ValidationMessage[]

    ): void {

        const ids = new Set<string>();

        sections.forEach(section => {

            if (ids.has(section.id)) {

                messages.push({

                    code: "DUP001",

                    level: "ERROR",

                    message: `ID duplicado: ${section.id}`

                });

            }

            ids.add(section.id);

        });

    }

    /**
     * -------------------------
     * ORDEN
     * -------------------------
     */

    private validateOrdering(

        sections: DocumentSection[],

        messages: ValidationMessage[]

    ): void {

        let previous = -1;

        sections.forEach(section => {

            if (section.order < previous) {

                messages.push({

                    code: "ORD001",

                    level: "WARNING",

                    message: "Las secciones no están ordenadas."

                });

            }

            previous = section.order;

        });

    }

    /**
     * Devuelve TRUE si el documento
     * no contiene errores.
     */

    public isValid(

        document: DocumentResult

    ): boolean {

        return this.validateDetailed(document)

            .every(v => v.level !== "ERROR");

    }

    /**
     * Devuelve únicamente advertencias.
     */

    public warnings(

        document: DocumentResult

    ): ValidationMessage[] {

        return this.validateDetailed(document)

            .filter(v => v.level === "WARNING");

    }

    /**
     * Devuelve únicamente errores.
     */

    public errors(

        document: DocumentResult

    ): ValidationMessage[] {

        return this.validateDetailed(document)

            .filter(v => v.level === "ERROR");

    }

}

/******************************************************************************************
 *
 * CONTRATA-IA
 *
 * DOCUMENT COMPOSER FRAMEWORK
 *
 * Archivo:
 * DocumentExporter.ts
 *
 * Responsable de exportar documentos.
 *
 ******************************************************************************************/

import {

    DocumentResult,

    OutputFormat,

    IExporter

} from "./types";

export class DocumentExporter implements IExporter {

    public async export(

        document: DocumentResult,

        format: OutputFormat

    ): Promise<Buffer | string> {

        switch (format) {

            case OutputFormat.JSON:

                return this.exportJson(document);

            case OutputFormat.HTML:

                return this.exportHtml(document);

            case OutputFormat.WORD:

                return this.exportWord(document);

            case OutputFormat.PDF:

                return this.exportPdf(document);

            default:

                throw new Error(

                    `Formato no soportado: ${format}`

                );

        }

    }

    /**
     * Exportación JSON.
     */

    private exportJson(

        document: DocumentResult

    ): string {

        return JSON.stringify(

            document,

            null,

            2

        );

    }

    /**
     * Exportación HTML.
     */

    private exportHtml(

        document: DocumentResult

    ): string {

        const html: string[] = [];

        html.push("<html>");

        html.push("<head>");

        html.push(

            `<title>${document.metadata.title}</title>`

        );

        html.push("</head>");

        html.push("<body>");

        html.push(

            `<h1>${document.metadata.title}</h1>`

        );

        if (document.metadata.subtitle) {

            html.push(

                `<h2>${document.metadata.subtitle}</h2>`

            );

        }

        document.sections.forEach(section => {

            html.push(

                `<h3>${section.title}</h3>`

            );

            if (

                typeof section.content === "string"

            ) {

                html.push(

                    `<p>${section.content}</p>`

                );

            } else {

                html.push(

                    `<pre>${JSON.stringify(section.content, null, 2)}</pre>`

                );

            }

        });

        if (document.annexes.length) {

            html.push("<hr>");

            html.push("<h2>ANEXOS</h2>");

            document.annexes.forEach(annex => {

                html.push(

                    `<h3>${annex.title}</h3>`

                );

                html.push(

                    `<pre>${JSON.stringify(annex.content, null, 2)}</pre>`

                );

            });

        }

        html.push("</body>");

        html.push("</html>");

        return html.join("\n");

    }

    /**
     * Exportación Word.
     *
     * Actualmente devuelve HTML compatible
     * para futuras conversiones DOCX.
     */

    private exportWord(

        document: DocumentResult

    ): Buffer {

        return Buffer.from(

            this.exportHtml(document),

            "utf-8"

        );

    }

    /**
     * Exportación PDF.
     *
     * Punto de integración futuro con
     * pdf-lib o similar.
     */

    private exportPdf(

        document: DocumentResult

    ): Buffer {

        return Buffer.from(

            this.exportHtml(document),

            "utf-8"

        );

    }

    /**
     * Exportación de texto plano.
     */

    public exportText(

        document: DocumentResult

    ): string {

        const out: string[] = [];

        out.push(document.metadata.title);

        out.push("");

        document.sections.forEach(section => {

            out.push(section.title);

            out.push("-------------------------");

            out.push(String(section.content));

            out.push("");

        });

        if (document.annexes.length) {

            out.push("ANEXOS");

            out.push("===================");

            document.annexes.forEach(a => {

                out.push(a.title);

            });

        }

        return out.join("\n");

    }

    /**
     * Exporta únicamente los metadatos.
     */

    public exportMetadata(

        document: DocumentResult

    ): string {

        return JSON.stringify(

            document.metadata,

            null,

            2

        );

    }

}
