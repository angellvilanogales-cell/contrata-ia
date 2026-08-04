/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DuplicateDetector
 * ------------------------------------------------------------
 * Detecta duplicidades arquitectónicas dentro del proyecto.
 *
 * Analiza:
 *
 * - Clases duplicadas
 * - Interfaces duplicadas
 * - Enums duplicados
 * - Motores duplicados
 * - Builders duplicados
 * - Generadores duplicados
 * - Composers duplicados
 * - Adapters duplicados
 *
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

import {

    FileScanner,

    ScannedFile

} from "./FileScanner";

export interface DuplicateItem {

    name: string;

    kind: string;

    files: string[];

}

export class DuplicateDetector {

    constructor(

        private readonly scanner: FileScanner

    ) {

    }

    /**
     * =====================================================
     * Ejecuta el análisis completo.
     * =====================================================
     */

    public analyze(): DuplicateItem[] {

        const map =

            new Map<string, DuplicateItem>();

        const files =

            this.scanner.scan();

        for (const file of files) {

            this.inspectFile(

                file,

                map

            );

        }

        return [

            ...map.values()

        ].filter(

            item =>

                item.files.length > 1

        );

    }

    /**
     * =====================================================
     * Analiza un archivo.
     * =====================================================
     */

    private inspectFile(

        file: ScannedFile,

        map: Map<string, DuplicateItem>

    ): void {

        const content =

            fs.readFileSync(

                file.absolutePath,

                "utf8"

            );

        this.collect(

            content,

            file,

            map,

            "class",

            /export\s+class\s+([A-Za-z0-9_]+)/g

        );

        this.collect(

            content,

            file,

            map,

            "interface",

            /export\s+interface\s+([A-Za-z0-9_]+)/g

        );

        this.collect(

            content,

            file,

            map,

            "enum",

            /export\s+enum\s+([A-Za-z0-9_]+)/g

        );

        this.collect(

            content,

            file,

            map,

            "type",

            /export\s+type\s+([A-Za-z0-9_]+)/g

        );

    }

    /**
     * =====================================================
     * Registra coincidencias.
     * =====================================================
     */

    private collect(

        content: string,

        file: ScannedFile,

        map: Map<string, DuplicateItem>,

        kind: string,

        regex: RegExp

    ): void {

        let match: RegExpExecArray | null;

        while (

            (match = regex.exec(content)) !== null

        ) {

            const name =

                match[1];

            const key =

                `${kind}:${name}`;

            if (

                !map.has(key)

            ) {

                map.set(

                    key,

                    {

                        name,

                        kind,

                        files: []

                    }

                );

            }

            map.get(key)!

                .files

                .push(

                    file.relativePath

                );

        }

    }

    /**
     * =====================================================
     * Busca duplicados por nombre de archivo.
     * =====================================================
     */

    public duplicatedFileNames(): string[] {

        const names =

            new Map<string, number>();

        for (

            const file of this.scanner.scan()

        ) {

            names.set(

                file.fileName,

                (names.get(file.fileName) ?? 0) + 1

            );

        }

        return [

            ...names.entries()

        ]

            .filter(

                ([, count]) => count > 1

            )

            .map(

                ([name]) => name

            );

    }

    /**
     * =====================================================
     * Detecta posibles motores duplicados.
     * =====================================================
     */

    public duplicatedEngines(): DuplicateItem[] {

        return this.analyze()

            .filter(

                d =>

                    d.name.endsWith("Engine")

            );

    }

    /**
     * =====================================================
     * Detecta posibles Builders duplicados.
     * =====================================================
     */

    public duplicatedBuilders(): DuplicateItem[] {

        return this.analyze()

            .filter(

                d =>

                    d.name.endsWith("Builder")

            );

    }

    /**
     * =====================================================
     * Detecta posibles Generators duplicados.
     * =====================================================
     */

    public duplicatedGenerators(): DuplicateItem[] {

        return this.analyze()

            .filter(

                d =>

                    d.name.endsWith("Generator")

            );

    }

    /**
     * =====================================================
     * Detecta posibles Adapters duplicados.
     * =====================================================
     */

    public duplicatedAdapters(): DuplicateItem[] {

        return this.analyze()

            .filter(

                d =>

                    d.name.endsWith("Adapter")

            );

    }

}
