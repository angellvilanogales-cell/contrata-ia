/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReferenceEngine
 * ------------------------------------------------------------
 * Motor central de referencias jurídicas.
 *
 * Responsabilidades:
 *
 * • Resolver artículos.
 * • Resolver normas.
 * • Resolver referencias cruzadas.
 * • Validar vigencia.
 * • Normalizar citas.
 * • Construir bibliografía jurídica.
 *
 * ============================================================
 */

import { LegalReference } from "./LegalReference";
import { LegalReferenceRegistry } from "./LegalReferenceRegistry";

export class LegalReferenceEngine {

    constructor(

        private readonly registry:

            LegalReferenceRegistry

    ){

    }

    /**
     * =====================================================
     * Obtener referencia.
     * =====================================================
     */

    public resolve(

        id:string

    ):LegalReference{

        return this.registry.get(id);

    }

    /**
     * =====================================================
     * Buscar artículo.
     * =====================================================
     */

    public article(

        law:string,

        article:string

    ):LegalReference|undefined{

        return this.registry.byArticle(

            law,

            article

        );

    }

    /**
     * =====================================================
     * Buscar norma completa.
     * =====================================================
     */

    public law(

        law:string

    ):LegalReference[]{

        return this.registry.byLaw(

            law

        );

    }

    /**
     * =====================================================
     * Buscar por palabra clave.
     * =====================================================
     */

    public keyword(

        keyword:string

    ):LegalReference[]{

        return this.registry.byKeyword(

            keyword

        );

    }

    /**
     * =====================================================
     * Validar referencia.
     * =====================================================
     */

    public validate(

        id:string

    ):boolean{

        return this.registry.exists(id);

    }

    /**
     * =====================================================
     * Obtener únicamente referencias vigentes.
     * =====================================================
     */

    public active():LegalReference[]{

        return this.registry.active();

    }

    /**
     * =====================================================
     * Obtener referencias relacionadas
     * con un documento.
     * =====================================================
     */

    public relatedToDocument(

        documentId:string

    ):LegalReference[]{

        return this.registry.relatedToDocument(

            documentId

        );

    }

    /**
     * =====================================================
     * Obtener referencias relacionadas
     * con un epígrafe.
     * =====================================================
     */

    public relatedToSection(

        sectionId:string

    ):LegalReference[]{

        return this.registry.relatedToSection(

            sectionId

        );

    }



    /**
     * =====================================================
     * Normaliza una referencia jurídica.
     *
     * Ejemplo:
     *
     * lcsp 28
     * LCSP-28
     * art.28 lcsp
     *
     * →
     *
     * LCSP_028
     *
     * =====================================================
     */

    public normalize(reference: string): string {

        return reference

            .toUpperCase()

            .replace(/ART\.?/g, "")

            .replace(/\s+/g, "_")

            .replace(/-/g, "_")

            .replace(/__+/g, "_")

            .trim();

    }

    /**
     * =====================================================
     * Elimina referencias duplicadas.
     * =====================================================
     */

    public unique(

        references: LegalReference[]

    ): LegalReference[] {

        const map =

            new Map<string, LegalReference>();

        for (const ref of references) {

            map.set(

                ref.id,

                ref

            );

        }

        return [

            ...map.values()

        ];

    }

    /**
     * =====================================================
     * Orden jurídico.
     *
     * LCSP
     *
     * LPAC
     *
     * LRJSP
     *
     * RGLCAP
     *
     * =====================================================
     */

    public sort(

        references: LegalReference[]

    ): LegalReference[] {

        const order = [

            "LCSP",

            "LPAC",

            "LRJSP",

            "RGLCAP",

            "RD817",

            "OTRA"

        ];

        return references.sort(

            (a, b) => {

                const ia =

                    order.indexOf(a.law);

                const ib =

                    order.indexOf(b.law);

                if (ia !== ib) {

                    return ia - ib;

                }

                return a.article.localeCompare(

                    b.article,

                    "es"

                );

            }

        );

    }

    /**
     * =====================================================
     * Referencias cruzadas.
     * =====================================================
     */

    public related(

        reference: LegalReference

    ): LegalReference[] {

        const refs: LegalReference[] = [];

        for (

            const id of reference.relatedArticles

        ) {

            if (

                this.registry.exists(id)

            ) {

                refs.push(

                    this.registry.get(id)

                );

            }

        }

        return refs;

    }

    /**
     * =====================================================
     * Obtiene todas las referencias
     * necesarias para un documento.
     * =====================================================
     */

    public bibliography(

        references: LegalReference[]

    ): LegalReference[] {

        return this.sort(

            this.unique(

                references

            )

        );

    }

       /**
     * =====================================================
     * Devuelve únicamente las referencias vigentes
     * para una fecha determinada.
     * =====================================================
     */

    public activeOn(

        date: Date,

        references: LegalReference[]

    ): LegalReference[] {

        return references.filter(ref => {

            if (!ref.active) {

                return false;

            }

            if (

                ref.validFrom &&

                ref.validFrom > date

            ) {

                return false;

            }

            if (

                ref.validUntil &&

                ref.validUntil < date

            ) {

                return false;

            }

            return true;

        });

    }

    /**
     * =====================================================
     * Obtiene todas las referencias utilizadas
     * por un conjunto de epígrafes.
     * =====================================================
     */

    public fromSections(

        sectionIds: string[]

    ): LegalReference[] {

        const result: LegalReference[] = [];

        for (

            const sectionId of sectionIds

        ) {

            result.push(

                ...this.registry.relatedToSection(

                    sectionId

                )

            );

        }

        return this.bibliography(result);

    }

    /**
     * =====================================================
     * Obtiene todas las referencias utilizadas
     * por un conjunto de documentos.
     * =====================================================
     */

    public fromDocuments(

        documentIds: string[]

    ): LegalReference[] {

        const result: LegalReference[] = [];

        for (

            const document of documentIds

        ) {

            result.push(

                ...this.registry.relatedToDocument(

                    document

                )

            );

        }

        return this.bibliography(result);

    }

    /**
     * =====================================================
     * Devuelve la fundamentación jurídica
     * completa para un documento.
     * =====================================================
     */

    public legalFoundation(

        documentId: string

    ): LegalReference[] {

        return this.bibliography(

            this.registry.relatedToDocument(

                documentId

            )

        );

    }

    /**
     * =====================================================
     * Devuelve la fundamentación jurídica
     * para un epígrafe concreto.
     * =====================================================
     */

    public legalFoundationSection(

        sectionId: string

    ): LegalReference[] {

        return this.bibliography(

            this.registry.relatedToSection(

                sectionId

            )

        );

    }

    /**
     * =====================================================
     * ¿Existe un artículo concreto?
     * =====================================================
     */

    public contains(

        references: LegalReference[],

        id: string

    ): boolean {

        return references.some(

            ref =>

                ref.id === id

        );

    }

    /**
     * =====================================================
     * Añade una referencia evitando duplicados.
     * =====================================================
     */

    public append(

        references: LegalReference[],

        reference: LegalReference

    ): LegalReference[] {

        if (

            this.contains(

                references,

                reference.id

            )

        ) {

            return references;

        }

        return this.bibliography(

            [

                ...references,

                reference

            ]

        );

    }

    /**
     * =====================================================
     * Construye una cita administrativa abreviada.
     *
     * Ejemplo:
     *
     * Artículo 28 LCSP
     *
     * =====================================================
     */

    public shortCitation(

        reference: LegalReference

    ): string {

        let text = `Artículo ${reference.article}`;

        if (reference.section) {

            text += `.${reference.section}`;

        }

        if (reference.letter) {

            text += `.${reference.letter}`;

        }

        text += ` ${reference.law}`;

        return text;

    }

    /**
     * =====================================================
     * Construye una cita administrativa completa.
     * =====================================================
     */

    public fullCitation(

        reference: LegalReference

    ): string {

        return `${this.shortCitation(reference)}. ${reference.summary}`;

    }

    /**
     * =====================================================
     * Exporta las referencias para un documento.
     * =====================================================
     */

    public export(

        references: LegalReference[]

    ): string[] {

        return this.bibliography(

            references

        ).map(

            ref => this.fullCitation(ref)

        );

    }

    /**
     * =====================================================
     * Comprueba referencias duplicadas.
     * =====================================================
     */

    public duplicated(

        references: LegalReference[]

    ): LegalReference[] {

        const seen = new Set<string>();

        const duplicates: LegalReference[] = [];

        for (const ref of references) {

            if (seen.has(ref.id)) {

                duplicates.push(ref);

            } else {

                seen.add(ref.id);

            }

        }

        return duplicates;

    }

    /**
     * =====================================================
     * Validación completa.
     * =====================================================
     */

    public validateBibliography(

        references: LegalReference[]

    ): string[] {

        const errors: string[] = [];

        for (const ref of references) {

            if (!ref.active) {

                errors.push(

                    `Referencia no vigente: ${ref.id}`

                );

            }

            if (

                !ref.article ||

                ref.article.trim() === ""

            ) {

                errors.push(

                    `Artículo inexistente: ${ref.id}`

                );

            }

            if (

                !ref.summary ||

                ref.summary.trim() === ""

            ) {

                errors.push(

                    `Resumen inexistente: ${ref.id}`

                );

            }

        }

        const duplicated =

            this.duplicated(

                references

            );

        for (const ref of duplicated) {

            errors.push(

                `Referencia duplicada: ${ref.id}`

            );

        }

        return errors;

    }

    /**
     * =====================================================
     * Estadísticas.
     * =====================================================
     */

    public statistics() {

        return {

            total:

                this.registry.size(),

            active:

                this.registry.active().length,

            laws:

                [

                    ...new Set(

                        this.registry

                            .all()

                            .map(

                                r => r.law

                            )

                    )

                ]

        };

    }

}

}
