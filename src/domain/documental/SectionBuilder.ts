/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SectionBuilder
 * ------------------------------------------------------------
 * Constructor reutilizable de capítulos y apartados.
 *
 * Todos los documentos utilizan este builder.
 *
 * ============================================================
 */

import {

    DocumentSection

} from "./DocumentResult";

export class SectionBuilder{

    private readonly sections:

        DocumentSection[]=[];

    /**
     * =====================================================
     * Añadir sección.
     * =====================================================
     */

    public section(

        id:string,

        title:string,

        content:string,

        editable:boolean=true

    ):SectionBuilder{

        this.sections.push({

            id,

            title,

            content,

            editable,

            order:

                this.sections.length+1

        });

        return this;

    }

    /**
     * =====================================================
     * Añadir sección vacía.
     * =====================================================
     */

    public empty(

        id:string,

        title:string

    ):SectionBuilder{

        return this.section(

            id,

            title,

            ""

        );

    }

    /**
     * =====================================================
     * Insertar salto documental.
     * =====================================================
     */

    public separator():SectionBuilder{

        this.sections.push({

            id:

                `SEP-${this.sections.length}`,

            title:"",

            content:"",

            editable:false,

            order:

                this.sections.length+1

        });

        return this;

    }

    /**
     * =====================================================
     * Número de secciones.
     * =====================================================
     */

    public count():number{

        return this.sections.length;

    }

    /**
     * =====================================================
     * Obtener sección.
     * =====================================================
     */

    public get(

        index:number

    ):DocumentSection|undefined{

        return this.sections[index];

    }

    /**
     * =====================================================
     * Sustituir contenido.
     * =====================================================
     */

    public replace(

        id: string,

        content: string

    ): SectionBuilder {

        const section = this.sections.find(

            s => s.id === id

        );

        if (section) {

            section.content = content;

        }

        return this;

    }

    /**
     * =====================================================
     * Buscar sección por ID.
     * =====================================================
     */

    public find(

        id: string

    ): DocumentSection | undefined {

        return this.sections.find(

            s => s.id === id

        );

    }

    /**
     * =====================================================
     * Eliminar sección.
     * =====================================================
     */

    public remove(

        id: string

    ): SectionBuilder {

        const index = this.sections.findIndex(

            s => s.id === id

        );

        if (index >= 0) {

            this.sections.splice(index, 1);

            this.renumber();

        }

        return this;

    }

    /**
     * =====================================================
     * Renumerar automáticamente.
     * =====================================================
     */

    private renumber(): void {

        this.sections.forEach(

            (section, index) => {

                section.order = index + 1;

            }

        );

    }

    /**
     * =====================================================
     * Clonar estructura.
     * =====================================================
     */

    public clone(): SectionBuilder {

        const builder = new SectionBuilder();

        for (const section of this.sections) {

            builder.section(

                section.id,

                section.title,

                section.content,

                section.editable

            );

        }

        return builder;

    }

    /**
     * =====================================================
     * Exportar secciones ordenadas.
     * =====================================================
     */

    public build(): DocumentSection[] {

        return [...this.sections].sort(

            (a, b) => a.order - b.order

        );

    }

    /**
     * =====================================================
     * Reiniciar builder.
     * =====================================================
     */

    public clear(): SectionBuilder {

        this.sections.length = 0;

        return this;

    }

}
