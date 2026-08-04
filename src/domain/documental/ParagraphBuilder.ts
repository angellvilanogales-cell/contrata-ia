/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ParagraphBuilder
 * ------------------------------------------------------------
 * Constructor reutilizable de párrafos administrativos.
 *
 * Objetivos:
 *
 * • Texto administrativo homogéneo.
 * • Justificaciones.
 * • Enumeraciones.
 * • Listados.
 * • Saltos de línea.
 *
 * ============================================================
 */

export class ParagraphBuilder {

    private readonly paragraphs: string[] = [];

    /**
     * =====================================================
     * Añadir párrafo normal.
     * =====================================================
     */

    public text(

        value: string

    ): ParagraphBuilder {

        if (

            value.trim().length > 0

        ) {

            this.paragraphs.push(

                value.trim()

            );

        }

        return this;

    }

    /**
     * =====================================================
     * Añadir párrafo en negrita.
     * =====================================================
     */

    public bold(

        value: string

    ): ParagraphBuilder {

        return this.text(

            `**${value.trim()}**`

        );

    }

    /**
     * =====================================================
     * Añadir subtítulo.
     * =====================================================
     */

    public subtitle(

        value: string

    ): ParagraphBuilder {

        return this.text(

            `## ${value.trim()}`

        );

    }

    /**
     * =====================================================
     * Añadir línea vacía.
     * =====================================================
     */

    public blank(): ParagraphBuilder {

        this.paragraphs.push("");

        return this;

    }

    /**
     * =====================================================
     * Añadir lista simple.
     * =====================================================
     */

    public list(

        values: string[]

    ): ParagraphBuilder {

        for (

            const value of values

        ) {

            this.paragraphs.push(

                `• ${value}`

            );

        }

        return this;

    }

    /**
     * =====================================================
     * Añadir lista numerada.
     * =====================================================
     */

    public numbered(

        values: string[]

    ): ParagraphBuilder {

        values.forEach(

            (value,index)=>{

                this.paragraphs.push(

                    `${index+1}. ${value}`

                );

            }

        );

        return this;

    }

    /**
     * =====================================================
     * Párrafo de justificación administrativa.
     * =====================================================
     */

    public justification(

        text: string

    ): ParagraphBuilder {

        return this.text(

            `Se justifica que ${text.trim()}.`

        );

    }

    /**
     * =====================================================
     * Referencia normativa.
     * =====================================================
     */

    public legalReference(

        article: string,

        rule: string

    ): ParagraphBuilder {

        return this.text(

            `De conformidad con ${article} de ${rule}.`

        );

    }

    /**
     * =====================================================
     * Observación.
     * =====================================================
     */

    public observation(

        text: string

    ): ParagraphBuilder {

        return this.text(

            `Observación: ${text.trim()}.`

        );

    }

    /**
     * =====================================================
     * Advertencia.
     * =====================================================
     */

    public warning(

        text: string

    ): ParagraphBuilder {

        return this.text(

            `ADVERTENCIA: ${text.trim()}.`

        );

    }

    /**
     * =====================================================
     * Nota.
     * =====================================================
     */

    public note(

        text: string

    ): ParagraphBuilder {

        return this.text(

            `Nota: ${text.trim()}.`

        );

    }

    /**
     * =====================================================
     * Insertar bloque completo.
     * =====================================================
     */

    public append(

        value: string

    ): ParagraphBuilder {

        return this.text(

            value

        );

    }

    /**
     * =====================================================
     * Construcción final.
     * =====================================================
     */

    public build(): string {

        return this.paragraphs.join(

            "\n\n"

        );

    }

    /**
     * =====================================================
     * Reiniciar builder.
     * =====================================================
     */

    public clear(): ParagraphBuilder {

        this.paragraphs.length = 0;

        return this;

    }

}
