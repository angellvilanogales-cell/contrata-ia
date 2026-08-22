/**
 * ============================================================
 * CONTRATA IA
 * RuleLoader
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
    /** Resultado declarativo opcional de las reglas de decisión. */
    resultado?: unknown;
}

export class RuleLoader {
    public cargar(fichero: string): RuleDefinition[] {
        const ruta = path.resolve(fichero);
        if (!fs.existsSync(ruta)) throw new Error(`No existe el fichero de reglas: ${ruta}`);
        const contenido = fs.readFileSync(ruta, "utf8");
        const json = JSON.parse(contenido) as { reglas?: RuleDefinition[] };
        return json.reglas ?? [];
    }
}
