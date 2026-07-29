/**
 * ============================================================
 * CONTRATA IA
 * TemplateEngine
 * ============================================================
 *
 * Motor encargado de cargar plantillas documentales
 * y sustituir automáticamente las variables por los
 * datos contenidos en el ExpedienteContext.
 *
 * Todos los generadores documentales utilizarán
 * esta clase.
 *
 * ============================================================
 */

import * as fs from "fs";

export class TemplateEngine {

    /**
     * Carga una plantilla desde disco.
     */
    public cargarPlantilla(

        ruta: string

    ): string {

        return fs.readFileSync(

            ruta,

            "utf8"

        );

    }

    /**
     * Sustituye variables.
     */
    public renderizar(

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
     * Elimina variables no sustituidas.
     */
    public limpiar(

        documento: string

    ): string {

        return documento

            .replace(/\{\{.*?\}\}/g, "")

            .replace(/[ \t]+\n/g, "\n")

            .replace(/\n{3,}/g, "\n\n")

            .trim();

    }

    /**
     * Carga una plantilla y devuelve el documento final.
     */
    public generar(

        rutaPlantilla: string,

        variables: Record<string, unknown>

    ): string {

        const plantilla =

            this.cargarPlantilla(

                rutaPlantilla

            );

        return this.limpiar(

            this.renderizar(

                plantilla,

                variables

            )

        );

    }

}
