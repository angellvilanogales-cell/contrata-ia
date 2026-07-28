/**
 * ============================================================
 * CONTRATA IA
 * RuleLoader
 * ============================================================
 *
 * Cargador de reglas jurídicas.
 *
 * Responsable de convertir los ficheros JSON
 * del directorio knowledge/rules en objetos
 * utilizados por el sistema experto.
 *
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

export interface RuleDefinition {

    id: string;

    nombre: string;

    tipo: string;

    prioridad: number;

    condicion: string;

    mensaje: string;

    articulo: string;

}

export class RuleLoader {

    /**
     * Carga un fichero de reglas.
     */
    public cargar(
        fichero: string
    ): RuleDefinition[] {

        const ruta = path.resolve(fichero);

        if (!fs.existsSync(ruta)) {

            throw new Error(
                `No existe el fichero de reglas: ${ruta}`
            );

        }

        const contenido =
            fs.readFileSync(ruta, "utf8");

        const json =
            JSON.parse(contenido);

        return json.reglas as RuleDefinition[];

    }

}
