/**
 * ============================================================
 * CONTRATA IA
 * BaseDocumentGenerator
 * ============================================================
 *
 * Clase base para todos los generadores documentales.
 *
 * Todos los documentos oficiales heredarán de esta
 * clase.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

export abstract class BaseDocumentGenerator {

    /**
     * Genera el documento.
     */
    public abstract generar(

        contexto: ExpedienteContext

    ): Promise<string>;

    /**
     * Sustituye variables en una plantilla.
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

    /**
     * Limpia etiquetas vacías.
     */
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
