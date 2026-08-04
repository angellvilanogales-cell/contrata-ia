/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseDocumentGenerator
 * ------------------------------------------------------------
 * Clase base de todos los generadores documentales.
 *
 * Todos los documentos (Memoria, PCAP, PPT,
 * Resoluciones, Informes...)
 * heredarán de esta clase.
 *
 * ============================================================
 */

import { DocumentContext } from "./DocumentContext";

import {

    DocumentResult,
    DocumentSection,
    DocumentMetadata,
    DocumentReference,
    DocumentWarning

} from "./DocumentResult";

export abstract class BaseDocumentGenerator {

    protected readonly context: DocumentContext;

    protected readonly sections: DocumentSection[] = [];

    protected readonly references: DocumentReference[] = [];

    protected readonly warnings: DocumentWarning[] = [];

    constructor(

        context: DocumentContext

    ) {

        this.context = context;

    }

    /**
     * =====================================================
     * Método principal.
     * =====================================================
     */

    public generate(): DocumentResult {

        this.beforeGenerate();

        this.build();

        this.afterGenerate();

        return this.buildResult();

    }

    /**
     * =====================================================
     * Implementación específica.
     * =====================================================
     */

    protected abstract build(): void;

    /**
     * =====================================================
     * Hooks.
     * =====================================================
     */

    protected beforeGenerate(): void {}

    protected afterGenerate(): void {}

    /**
     * =====================================================
     * Añadir sección.
     * =====================================================
     */

    protected addSection(

        id: string,

        title: string,

        content: string,

        editable = true

    ): void {

        this.sections.push({

            id,

            title,

            order: this.sections.length + 1,

            content,

            editable

        });

    }

    /**
     * =====================================================
     * Añadir referencia normativa.
     * =====================================================
     */

    protected addReference(

        source: string,

        citation: string,

        article?: string

    ): void {

        this.references.push({

            source,

            citation,

            article

        });

    }

    /**
     * =====================================================
     * Añadir advertencia.
     * =====================================================
     */

    protected addWarning(

        severity:

            "INFO"

            | "WARNING"

            | "ERROR",

        message: string

    ): void {

        this.warnings.push({

            severity,

            message

        });

    }

    /**
     * =====================================================
     * Construcción resultado.
     * =====================================================
     */

    protected buildResult(): DocumentResult {

        const metadata: DocumentMetadata = {

            id:

                this.generateId(),

            documentType:

                this.constructor.name,

            title:

                this.getDocumentTitle(),

            version:

                this.context.version,

            language:

                this.context.language,

            generatedAt:

                this.context.generatedAt,

            generatedBy:

                "CONTRATA-IA"

        };

        return {

            metadata,

            sections:

                [...this.sections],

            fullText:

                this.buildFullText(),

            references:

                [...this.references],

            warnings:

                [...this.warnings],

            valid:

                this.isValid()

        };

    }

    /**
     * =====================================================
     * Ensamblado del documento.
     * =====================================================
     */

    protected buildFullText(): string {

        return this.sections

            .sort(

                (a,b)=>a.order-b.order

            )

            .map(

                section=>

`# ${section.title}

${section.content}

`

            )

            .join("\n");

    }

    /**
     * =====================================================
     * Validez documental.
     * =====================================================
     */

    protected isValid(): boolean {

        return !this.warnings.some(

            w=>w.severity==="ERROR"

        );

    }

    /**
     * =====================================================
     * Generación identificador.
     * =====================================================
     */

    protected generateId(): string {

        return [

            this.constructor.name,

            Date.now(),

            Math.floor(

                Math.random()*100000

            )

        ].join("-");

    }

    /**
     * =====================================================
     * Título documento.
     * =====================================================
     */

    protected getDocumentTitle(): string {

        return this.constructor.name

            .replace(

                "Generator",

                ""

            );

    }

    /**
     * =====================================================
     * Utilidades comunes
     * =====================================================
     */

    protected paragraph(

        text:string

    ):string{

        return `${text}

`;

    }

    protected heading(

        title:string

    ):string{

        return `${title}

`;

    }

    protected bulletList(

        values:string[]

    ):string{

        return values

            .map(

                x=>`• ${x}`

            )

            .join("\n");

    }

    protected table(

        rows:string[][]

    ):string{

        return rows

            .map(

                r=>r.join(" | ")

            )

            .join("\n");

    }

}
