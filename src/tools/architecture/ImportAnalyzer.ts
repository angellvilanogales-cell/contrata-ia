/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ImportAnalyzer
 * ------------------------------------------------------------
 * Analiza automáticamente todos los imports del proyecto.
 *
 * Funciones:
 *
 * - Obtener imports
 * - Obtener exports
 * - Detectar imports relativos
 * - Detectar imports absolutos
 * - Detectar dependencias internas
 * - Detectar dependencias externas
 *
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

export interface ImportReference {

    file: string;

    importPath: string;

    resolvedPath?: string;

    external: boolean;

}

export class ImportAnalyzer {

    /**
     * Obtiene todos los imports de un archivo.
     */

    public analyze(file: string): ImportReference[] {

        const content = fs.readFileSync(

            file,

            "utf8"

        );

        const imports: ImportReference[] = [];

        const regex =

            /import\s+(?:.+?)\s+from\s+['"](.+)['"]/g;

        let match: RegExpExecArray | null;

        while (

            (match = regex.exec(content)) !== null

        ) {

            const importPath = match[1];

            const external =

                !importPath.startsWith(".");

            imports.push({

                file,

                importPath,

                resolvedPath: external

                    ? undefined

                    : this.resolveImport(

                        file,

                        importPath

                    ),

                external

            });

        }

        return imports;

    }

    /**
     * Devuelve únicamente imports internos.
     */

    public internal(file: string): ImportReference[] {

        return this.analyze(file)

            .filter(

                i => !i.external

            );

    }

    /**
     * Devuelve únicamente imports externos.
     */

    public external(file: string): ImportReference[] {

        return this.analyze(file)

            .filter(

                i => i.external

            );

    }

    /**
     * Número total de imports.
     */

    public count(file: string): number {

        return this.analyze(file).length;

    }

    /**
     * Comprueba si existe un import concreto.
     */

    public hasImport(

        file: string,

        importName: string

    ): boolean {

        return this.analyze(file)

            .some(

                i =>

                    i.importPath === importName

            );

    }

    /**
     * Resuelve ruta relativa.
     */

    private resolveImport(

        file: string,

        relative: string

    ): string {

        const directory =

            path.dirname(file);

        return path.normalize(

            path.join(

                directory,

                relative

            )

        );

    }

    /**
     * Obtiene exports del archivo.
     */

    public exports(file: string): string[] {

        const content = fs.readFileSync(

            file,

            "utf8"

        );

        const exports: string[] = [];

        const regex =

            /export\s+(?:class|interface|enum|type|const|function)\s+([A-Za-z0-9_]+)/g;

        let match: RegExpExecArray | null;

        while (

            (match = regex.exec(content)) !== null

        ) {

            exports.push(

                match[1]

            );

        }

        return exports;

    }

    /**
     * Comprueba si el archivo exporta algo.
     */

    public hasExports(

        file: string

    ): boolean {

        return this.exports(file).length > 0;

    }

}
