/**
 * ============================================================
 * CONTRATA IA
 * BaseDocumentGenerator
 * ============================================================
 *
 * Clase base para todos los generadores documentales.
 *
 * Esta versión mantiene la compatibilidad con el proyecto
 * actual y prepara la futura refactorización.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

export abstract class BaseDocumentGenerator {

    /**
     * Punto de entrada único.
     */
    public async generar(

        contexto: ExpedienteContext

    ): Promise<string> {

        this.validar(contexto);

        await this.preparar(contexto);

        const resultado = await this.generarDocumento(contexto);

        return await this.finalizar(

            resultado,

            contexto

        );

    }

    /**
     * Preparación opcional.
     */
    protected async preparar(

        _contexto: ExpedienteContext

    ): Promise<void> {

        // Vacío por defecto.

    }

    /**
     * Validación común.
     */
    protected validar(

        contexto: ExpedienteContext

    ): void {

        if (!contexto) {

            throw new Error(

                "ExpedienteContext no definido."

            );

        }

    }

    /**
     * Implementación específica.
     */
    protected abstract generarDocumento(

        contexto: ExpedienteContext

    ): Promise<string>;

    /**
     * Posprocesado.
     */
    protected async finalizar(

        resultado: string,

        _contexto: ExpedienteContext

    ): Promise<string> {

        return resultado;

    }

    /**
     * =====================================================
     * Compatibilidad con la arquitectura actual.
     * =====================================================
     */

    protected reemplazarVariables(

        plantilla: string,

        variables: Record<string, unknown>

    ): string {

        let resultado = plantilla;

        for (const [clave, valor] of Object.entries(variables)) {

            resultado = resultado.replaceAll(

                `{{${clave}}}`,

                valor?.toString() ?? ""

            );

        }

        return resultado;

    }

    protected limpiar(

        texto: string

    ): string {

        return texto

            .replace(/\{\{.*?\}\}/g, "")

            .replace(/[ \t]+\n/g, "\n")

            .replace(/\n{3,}/g, "\n\n")

            .trim();

    }

}
