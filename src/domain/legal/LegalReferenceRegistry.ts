/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReferenceRegistry
 * ------------------------------------------------------------
 * Registro centralizado de referencias jurídicas.
 *
 * Existe una única instancia de cada artículo.
 *
 * Todos los documentos consultan este registro.
 *
 * ============================================================
 */

import { LegalReference } from "./LegalReference";

export class LegalReferenceRegistry {

    private readonly references =

        new Map<string, LegalReference>();

    /**
     * =====================================================
     * Registrar referencia.
     * =====================================================
     */

    public register(

        reference: LegalReference

    ): void {

        this.references.set(

            reference.id,

            reference

        );

    }

    /**
     * =====================================================
     * Obtener por id.
     * =====================================================
     */

    public get(

        id: string

    ): LegalReference {

        const ref =

            this.references.get(id);

        if (!ref) {

            throw new Error(

                `Referencia jurídica inexistente: ${id}`

            );

        }

        return ref;

    }

    /**
     * =====================================================
     * ¿Existe?
     * =====================================================
     */

    public exists(

        id: string

    ): boolean {

        return this.references.has(id);

    }

    /**
     * =====================================================
     * Todas las referencias.
     * =====================================================
     */

    public all(): LegalReference[] {

        return [

            ...this.references.values()

        ];

    }

    /**
     * =====================================================
     * Buscar por norma.
     * =====================================================
     */

    public byLaw(

        law: string

    ): LegalReference[] {

        return this.all().filter(

            r =>

                r.law === law

        );

    }

    /**
     * =====================================================
     * Buscar artículo.
     * =====================================================
     */

    public byArticle(

        law: string,

        article: string

    ): LegalReference | undefined {

        return this.all().find(

            r =>

                r.law === law &&

                r.article === article

        );

    }

    /**
     * =====================================================
     * Buscar palabra clave.
     * =====================================================
     */

    public byKeyword(

        keyword: string

    ): LegalReference[] {

        const search =

            keyword.toLowerCase();

        return this.all().filter(

            ref =>

                ref.keywords.some(

                    k =>

                        k.toLowerCase()

                        .includes(search)

                )

        );

    }

    /**
     * =====================================================
     * Buscar documentos relacionados.
     * =====================================================
     */

    public relatedToDocument(

        documentId: string

    ): LegalReference[] {

        return this.all().filter(

            ref =>

                ref.relatedDocuments

                .includes(documentId)

        );

    }

    /**
     * =====================================================
     * Buscar epígrafe relacionado.
     * =====================================================
     */

    public relatedToSection(

        sectionId: string

    ): LegalReference[] {

        return this.all().filter(

            ref =>

                ref.relatedSections

                .includes(sectionId)

        );

    }

    /**
     * =====================================================
     * Referencias vigentes.
     * =====================================================
     */

    public active(): LegalReference[] {

        return this.all().filter(

            r =>

                r.active

        );

    }

    /**
     * =====================================================
     * Eliminar.
     * =====================================================
     */

    public remove(

        id: string

    ): boolean {

        return this.references.delete(id);

    }

    /**
     * =====================================================
     * Número de referencias.
     * =====================================================
     */

    public size(): number {

        return this.references.size;

    }

    /**
     * =====================================================
     * Vaciar registro.
     * =====================================================
     */

    public clear(): void {

        this.references.clear();

    }

}
