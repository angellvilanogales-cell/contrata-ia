/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DependencyGraph
 * ------------------------------------------------------------
 * Construye automáticamente el grafo de dependencias
 * entre todos los archivos del proyecto.
 *
 * Utiliza:
 *
 * - FileScanner
 * - ImportAnalyzer
 *
 * ============================================================
 */

import * as path from "path";

import {

    FileScanner,

    ScannedFile

} from "./FileScanner";

import {

    ImportAnalyzer,

    ImportReference

} from "./ImportAnalyzer";

export interface DependencyNode {

    file: string;

    imports: string[];

    importedBy: string[];

}

export class DependencyGraph {

    private readonly scanner: FileScanner;

    private readonly analyzer: ImportAnalyzer;

    constructor(

        scanner: FileScanner,

        analyzer: ImportAnalyzer

    ) {

        this.scanner = scanner;

        this.analyzer = analyzer;

    }

    /**
     * =====================================================
     * Construye el grafo completo.
     * =====================================================
     */

    public build(): Map<string, DependencyNode> {

        const graph =

            new Map<string, DependencyNode>();

        const files =

            this.scanner.scan();

        /**
         * Crear nodos.
         */

        for (const file of files) {

            graph.set(

                file.absolutePath,

                {

                    file:

                        file.absolutePath,

                    imports: [],

                    importedBy: []

                }

            );

        }

        /**
         * Resolver imports.
         */

        for (const file of files) {

            const node =

                graph.get(file.absolutePath)!;

            const imports =

                this.analyzer.internal(

                    file.absolutePath

                );

            for (const imp of imports) {

                const resolved =

                    this.resolve(

                        imp,

                        files

                    );

                if (!resolved) {

                    continue;

                }

                node.imports.push(

                    resolved.absolutePath

                );

                graph

                    .get(

                        resolved.absolutePath

                    )

                    ?.importedBy

                    .push(

                        file.absolutePath

                    );

            }

        }

        return graph;

    }

    /**
     * =====================================================
     * Archivos raíz.
     * =====================================================
     */

    public roots(): DependencyNode[] {

        return [

            ...this.build().values()

        ].filter(

            node =>

                node.importedBy.length === 0

        );

    }

    /**
     * =====================================================
     * Hojas.
     * =====================================================
     */

    public leaves(): DependencyNode[] {

        return [

            ...this.build().values()

        ].filter(

            node =>

                node.imports.length === 0

        );

    }

    /**
     * =====================================================
     * Dependencias de un archivo.
     * =====================================================
     */

    public dependencies(

        file: string

    ): string[] {

        return this.build()

            .get(file)

            ?.imports

            ?? [];

    }

    /**
     * =====================================================
     * Quién usa un archivo.
     * =====================================================
     */

    public dependents(

        file: string

    ): string[] {

        return this.build()

            .get(file)

            ?.importedBy

            ?? [];

    }

    /**
     * =====================================================
     * Resolver ruta.
     * =====================================================
     */

    private resolve(

        reference: ImportReference,

        files: ScannedFile[]

    ): ScannedFile | undefined {

        if (!reference.resolvedPath) {

            return undefined;

        }

        const normalized =

            path.normalize(

                reference.resolvedPath

            );

        return files.find(file => {

            const withoutExt =

                file.absolutePath

                    .replace(

                        /\.tsx?$/,

                        ""

                    );

            return (

                withoutExt === normalized ||

                file.absolutePath === normalized ||

                file.absolutePath.startsWith(

                    normalized + "."

                )

            );

        });

    }

}
