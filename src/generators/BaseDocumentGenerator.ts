/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseDocumentGenerator
 * ------------------------------------------------------------
 * Clase base de todos los generadores documentales.
 *
 * Su responsabilidad NO es construir documentos.
 *
 * Su responsabilidad es coordinar el ciclo de generación.
 *
 * ============================================================
 */

import { DocumentGenerationContext } from "../documentModel/DocumentGenerationContext";

export abstract class BaseDocumentGenerator {

    /**
     * =====================================================
     * Punto único de entrada.
     * =====================================================
     */
    public async generar(

        context: DocumentGenerationContext

    ): Promise<string> {

        await this.prepare(context);

        this.validate(context);

        const result = await this.generateDocument(context);

        return await this.finalize(result, context);

    }

    /**
     * Preparación previa.
     */
    protected async prepare(

        _context: DocumentGenerationContext

    ): Promise<void> {

        // Implementación opcional

    }

    /**
     * Validación del contexto.
     */
    protected validate(

        context: DocumentGenerationContext

    ): void {

        if (!context) {

            throw new Error("DocumentGenerationContext no definido.");

        }

        if (!context.expediente) {

            throw new Error("Expediente no definido.");

        }

        if (!context.documentType) {

            throw new Error("Tipo documental no definido.");

        }

    }

    /**
     * Generación específica.
     */
    protected abstract generateDocument(

        context: DocumentGenerationContext

    ): Promise<string>;

    /**
     * Posprocesado.
     */
    protected async finalize(

        result: string,

        _context: DocumentGenerationContext

    ): Promise<string> {

        return result;

    }

}
