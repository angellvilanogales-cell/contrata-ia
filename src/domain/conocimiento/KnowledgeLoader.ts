/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeLoader
 * ============================================================
 *
 * Cargador del banco de conocimiento.
 *
 * Será el responsable de cargar:
 *
 * - Artículos LCSP
 * - Reglas
 * - Informes
 * - Jurisprudencia
 * - Plantillas
 * - Cláusulas
 * - CPV
 *
 * Todo el conocimiento será cargado una única vez
 * durante el arranque de la aplicación.
 *
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

export class KnowledgeLoader {

    /**
     * Lee un fichero JSON.
     */
    public cargarJSON<T>(

        fichero: string

    ): T {

        const ruta = path.resolve(fichero);

        if (!fs.existsSync(ruta)) {

            throw new Error(

                `No existe el fichero ${ruta}`

            );

        }

        const contenido = fs.readFileSync(

            ruta,

            "utf8"

        );

        return JSON.parse(contenido) as T;

    }

    /**
     * Carga todos los JSON de un directorio.
     */
    public cargarDirectorio<T>(

        directorio: string

    ): T[] {

        const ruta = path.resolve(directorio);

        if (!fs.existsSync(ruta)) {

            return [];

        }

        const resultado: T[] = [];

        const archivos = fs.readdirSync(ruta);

        for (const archivo of archivos) {

            if (!archivo.endsWith(".json")) {

                continue;

            }

            resultado.push(

                this.cargarJSON<T>(

                    path.join(ruta, archivo)

                )

            );

        }

        return resultado;

    }

}
