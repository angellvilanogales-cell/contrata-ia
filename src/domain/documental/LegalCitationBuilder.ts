/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalCitationBuilder
 * ------------------------------------------------------------
 * Constructor reutilizable de referencias jurídicas.
 *
 * Todos los documentos del expediente utilizarán este builder
 * para insertar referencias normativas homogéneas.
 *
 * ============================================================
 */

export interface LegalCitation {

    id: string;

    norm: string;

    article?: string;

    section?: string;

    paragraph?: string;

    text: string;

}

export class LegalCitationBuilder {

    private readonly citations: LegalCitation[] = [];

    /**
     * =====================================================
     * Añadir cita jurídica.
     * =====================================================
     */

    public citation(

        norm: string,

        article: string,

        text: string

    ): LegalCitationBuilder {

        this.citations.push({

            id:

                `${norm}-${article}`,

            norm,

            article,

            text

        });

        return this;

    }

    /**
     * =====================================================
     * Artículo LCSP.
     * =====================================================
     */

    public lcsp(

        article: string,

        text: string

    ): LegalCitationBuilder {

        return this.citation(

            "LCSP",

            article,

            text

        );

    }

    /**
     * =====================================================
     * Directiva Europea.
     * =====================================================
     */

    public directive(

        directive: string,

        article: string,

        text: string

    ): LegalCitationBuilder {

        return this.citation(

            directive,

            article,

            text

        );

    }

    /**
     * =====================================================
     * Reglamento.
     * =====================================================
     */

    public regulation(

        regulation: string,

        article: string,

        text: string

    ): LegalCitationBuilder {

        return this.citation(

            regulation,

            article,

            text

        );

    }

    /**
     * =====================================================
     * Real Decreto.
     * =====================================================
     */

    public royalDecree(

        decree: string,

        article: string,

        text: string

    ): LegalCitationBuilder {

        return this.citation(

            decree,

            article,

            text

        );

    }

    /**
     * =====================================================
     * Obtener cita.
     * =====================================================
     */

    public get(

        id: string

    ): LegalCitation | undefined {

        return this.citations.find(

            c => c.id === id

        );

    }

    /**
     * =====================================================
     * Formateo oficial de una cita.
     * =====================================================
     */

    public format(

        citation: LegalCitation

    ): string {

        let result = "";

        if (citation.article) {

            result += `Artículo ${citation.article}`;

        }

        if (citation.section) {

            result += `, apartado ${citation.section}`;

        }

        if (citation.paragraph) {

            result += `, párrafo ${citation.paragraph}`;

        }

        if (citation.norm) {

            result += ` de ${citation.norm}`;

        }

        if (citation.text.trim().length > 0) {

            result += `. ${citation.text}`;

        }

        return result.trim();

    }

    /**
     * =====================================================
     * Eliminar citas duplicadas.
     * =====================================================
     */

    public unique(): LegalCitationBuilder {

        const ids = new Set<string>();

        const unique: LegalCitation[] = [];

        for (const citation of this.citations) {

            if (!ids.has(citation.id)) {

                ids.add(citation.id);

                unique.push(citation);

            }

        }

        this.citations.length = 0;

        this.citations.push(...unique);

        return this;

    }

    /**
     * =====================================================
     * Ordenar citas.
     * =====================================================
     */

    public sort(): LegalCitationBuilder {

        this.citations.sort(

            (a, b) => {

                if (a.norm !== b.norm) {

                    return a.norm.localeCompare(b.norm);

                }

                return (a.article ?? "").localeCompare(

                    b.article ?? ""

                );

            }

        );

        return this;

    }

    /**
     * =====================================================
     * Generar apartado "Normativa aplicable".
     * =====================================================
     */

    public buildSection(): string {

        return this.citations

            .map(

                citation =>

                    `• ${this.format(citation)}`

            )

            .join("\n");

    }

    /**
     * =====================================================
     * Exportación.
     * =====================================================
     */

    public build(): LegalCitation[] {

        return [...this.citations];

    }

    /**
     * =====================================================
     * Reiniciar builder.
     * =====================================================
     */

    public clear(): LegalCitationBuilder {

        this.citations.length = 0;

        return this;

    }

}
