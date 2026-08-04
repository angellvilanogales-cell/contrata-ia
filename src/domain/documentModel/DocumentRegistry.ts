/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DocumentRegistry
 * ------------------------------------------------------------
 * Registro central de TODOS los documentos del expediente.
 *
 * Aquí NO existe ningún texto.
 *
 * Solamente existe la definición de:
 *
 * • documentos
 * • estructura
 * • relaciones
 *
 * ============================================================
 */

import { DocumentDefinition } from "./DocumentDefinition";
import { DocumentType } from "./DocumentType";

export class DocumentRegistry {

    private readonly documents =

        new Map<DocumentType, DocumentDefinition>();

    /**
     * =====================================================
     * Registro
     * =====================================================
     */

    public register(

        definition: DocumentDefinition

    ): void {

        this.documents.set(

            definition.type,

            definition

        );

    }

    /**
     * =====================================================
     * Obtener documento
     * =====================================================
     */

    public get(

        type: DocumentType

    ): DocumentDefinition {

        const document =

            this.documents.get(type);

        if (!document) {

            throw new Error(

                `Documento no registrado: ${type}`

            );

        }

        return document;

    }

    /**
     * =====================================================
     * ¿Existe?
     * =====================================================
     */

    public exists(

        type: DocumentType

    ): boolean {

        return this.documents.has(type);

    }

    /**
     * =====================================================
     * Todos
     * =====================================================
     */

    public all(): DocumentDefinition[] {

        return [

            ...this.documents.values()

        ].sort(

            (a,b)=>a.order-b.order

        );

    }

    /**
     * =====================================================
     * Documentos obligatorios
     * =====================================================
     */

    public mandatory(): DocumentDefinition[] {

        return this.all().filter(

            d=>d.mandatory

        );

    }

    /**
     * =====================================================
     * Documentos opcionales
     * =====================================================
     */

    public optional(): DocumentDefinition[] {

        return this.all().filter(

            d=>!d.mandatory

        );

    }

}

