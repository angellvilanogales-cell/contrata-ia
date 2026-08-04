/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * FileScanner
 * ------------------------------------------------------------
 * Escanea el árbol de directorios del proyecto y devuelve
 * todos los archivos compatibles con el análisis de
 * arquitectura.
 *
 * Responsabilidades:
 *
 * - Recorrer directorios
 * - Filtrar extensiones
 * - Ignorar carpetas configuradas
 * - Obtener información básica de cada archivo
 *
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

export interface ScannedFile {

    absolutePath: string;

    relativePath: string;

    directory: string;

    fileName: string;

    extension: string;

    size: number;

}

export interface ScanOptions {

    root: string;

    extensions?: string[];

    ignoredDirectories?: string[];

}

export class FileScanner {

    private readonly extensions: string[];

    private readonly ignoredDirectories: Set<string>;

    constructor(private readonly options: ScanOptions) {

        this.extensions = options.extensions ?? [

            ".ts",
            ".tsx",
            ".js",
            ".jsx",
            ".json",
            ".yaml",
            ".yml",
            ".md"

        ];

        this.ignoredDirectories = new Set(

            options.ignoredDirectories ?? [

                "node_modules",

                ".git",

                "dist",

                "build",

                ".next",

                "coverage"

            ]

        );

    }

    /**
     * Escaneo completo.
     */

    public scan(): ScannedFile[] {

        const result: ScannedFile[] = [];

        this.walk(

            this.options.root,

            result

        );

        result.sort(

            (a, b) =>

                a.relativePath.localeCompare(

                    b.relativePath

                )

        );

        return result;

    }

    /**
     * Recorrido recursivo.
     */

    private walk(

        currentPath: string,

        result: ScannedFile[]

    ): void {

        const entries = fs.readdirSync(

            currentPath,

            {

                withFileTypes: true

            }

        );

        for (const entry of entries) {

            const absolute = path.join(

                currentPath,

                entry.name

            );

            if (entry.isDirectory()) {

                if (

                    this.ignoredDirectories.has(

                        entry.name

                    )

                ) {

                    continue;

                }

                this.walk(

                    absolute,

                    result

                );

                continue;

            }

            const extension = path.extname(

                entry.name

            );

            if (

                !this.extensions.includes(

                    extension

                )

            ) {

                continue;

            }

            const stat = fs.statSync(

                absolute

            );

            result.push({

                absolutePath: absolute,

                relativePath: path.relative(

                    this.options.root,

                    absolute

                ),

                directory: path.dirname(

                    path.relative(

                        this.options.root,

                        absolute

                    )

                ),

                fileName: entry.name,

                extension,

                size: stat.size

            });

        }

    }

    /**
     * Cuenta archivos encontrados.
     */

    public count(): number {

        return this.scan().length;

    }

    /**
     * Agrupa por extensión.
     */

    public byExtension(): Map<string, ScannedFile[]> {

        const map = new Map<string, ScannedFile[]>();

        for (const file of this.scan()) {

            if (!map.has(file.extension)) {

                map.set(

                    file.extension,

                    []

                );

            }

            map.get(file.extension)!.push(file);

        }

        return map;

    }

}
