/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DocumentModelEngine
 * ------------------------------------------------------------
 * Núcleo documental del sistema.
 *
 * Responsabilidades:
 *
 * • Define los documentos del expediente.
 * • Define sus epígrafes.
 * • Determina qué apartados son obligatorios.
 * • Determina dependencias.
 * • Determina reutilización de secciones.
 * • Construye el modelo documental que utilizarán
 *   todos los generadores.
 *
 * Ningún generador conoce la estructura
 * de un documento.
 *
 * ============================================================
 */

import { DocumentRegistry } from "./DocumentRegistry";
import { DocumentDefinition } from "./DocumentDefinition";
import { DocumentType } from "./DocumentType";
import { SectionDefinition } from "./SectionDefinition";
import { DocumentContext } from "../documental/DocumentContext";

export class DocumentModelEngine {

    constructor(

        private readonly registry: DocumentRegistry

    ) {

    }

    /**
     * =====================================================
     * Devuelve el modelo documental completo.
     * =====================================================
     */

    public build(

        context: DocumentContext,

        type: DocumentType

    ): DocumentDefinition {

        const definition =

            this.registry.get(type);

        const visibleSections =

            definition.sections.filter(

                section =>

                    section.isVisible(context)

            );

        return {

            ...definition,

            sections: visibleSections

        };

    }

    /**
     * =====================================================
     * ¿Existe un documento?
     * =====================================================
     */

    public exists(

        type: DocumentType

    ): boolean {

        return this.registry.exists(type);

    }

    /**
     * =====================================================
     * Obtiene una sección concreta.
     * =====================================================
     */

    public getSection(

        document: DocumentType,

        id: string

    ): SectionDefinition | undefined {

        return this.registry

            .get(document)

            .sections

            .find(

                s => s.id === id

            );

    }

    /**
     * =====================================================
     * Devuelve todas las secciones visibles.
     * =====================================================
     */

    public getSections(

        context: DocumentContext,

        document: DocumentType

    ): SectionDefinition[] {

        return this.build(

            context,

            document

        ).sections;

    }

}

