/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * StatisticsGenerator
 * ------------------------------------------------------------
 * Genera estadísticas completas del proyecto.
 *
 * Utiliza:
 *
 * - FileScanner
 * - DependencyGraph
 * - DuplicateDetector
 * - DeadCodeDetector
 *
 * ============================================================
 */

import { FileScanner } from "./FileScanner";
import { DependencyGraph } from "./DependencyGraph";
import { DuplicateDetector } from "./DuplicateDetector";
import { DeadCodeDetector } from "./DeadCodeDetector";

export interface ProjectStatistics {

    totalFiles: number;

    totalDirectories: number;

    byExtension: Record<string, number>;

    duplicatedClasses: number;

    duplicatedBuilders: number;

    duplicatedGenerators: number;

    duplicatedAdapters: number;

    duplicatedEngines: number;

    deadFiles: number;

    deadExports: number;

    dependencyRoots: number;

    dependencyLeaves: number;

}

export class StatisticsGenerator {

    constructor(

        private readonly scanner: FileScanner,

        private readonly graph: DependencyGraph,

        private readonly duplicates: DuplicateDetector,

        private readonly deadCode: DeadCodeDetector

    ) {

    }

    /**
     * =====================================================
     * Estadísticas completas.
     * =====================================================
     */

    public generate(): ProjectStatistics {

        const files =

            this.scanner.scan();

        const byExtension: Record<string, number> = {};

        for (const file of files) {

            byExtension[file.extension] =

                (byExtension[file.extension] ?? 0) + 1;

        }

        const directories =

            new Set(

                files.map(

                    f => f.directory

                )

            );

        const dead =

            this.deadCode.statistics();

        return {

            totalFiles:

                files.length,

            totalDirectories:

                directories.size,

            byExtension,

            duplicatedClasses:

                this.duplicates.analyze().length,

            duplicatedBuilders:

                this.duplicates

                    .duplicatedBuilders()

                    .length,

            duplicatedGenerators:

                this.duplicates

                    .duplicatedGenerators()

                    .length,

            duplicatedAdapters:

                this.duplicates

                    .duplicatedAdapters()

                    .length,

            duplicatedEngines:

                this.duplicates

                    .duplicatedEngines()

                    .length,

            deadFiles:

                dead.files,

            deadExports:

                dead.exports,

            dependencyRoots:

                this.graph.roots().length,

            dependencyLeaves:

                this.graph.leaves().length

        };

    }

    /**
     * =====================================================
     * Mostrar por consola.
     * =====================================================
     */

    public print(): void {

        const stats =

            this.generate();

        console.table(stats);

    }

}
