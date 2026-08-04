/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ArchitectureInspector
 * ------------------------------------------------------------
 * Punto de entrada del motor de auditoría arquitectónica.
 *
 * Orquesta:
 *
 *  • FileScanner
 *  • ImportAnalyzer
 *  • DependencyGraph
 *  • DuplicateDetector
 *  • DeadCodeDetector
 *  • StatisticsGenerator
 *  • MarkdownReportGenerator
 *
 * ============================================================
 */

import * as path from "path";

import { FileScanner } from "./FileScanner";
import { ImportAnalyzer } from "./ImportAnalyzer";
import { DependencyGraph } from "./DependencyGraph";
import { DuplicateDetector } from "./DuplicateDetector";
import { DeadCodeDetector } from "./DeadCodeDetector";
import { StatisticsGenerator } from "./StatisticsGenerator";
import {
    MarkdownReportGenerator,
    ArchitectureReport
} from "./MarkdownReportGenerator";

export interface ArchitectureInspectorOptions {

    /**
     * Raíz del proyecto.
     */

    projectRoot: string;

    /**
     * Carpeta donde generar informes.
     */

    outputDirectory: string;

}

export class ArchitectureInspector {

    private readonly scanner: FileScanner;

    private readonly analyzer: ImportAnalyzer;

    private readonly dependencyGraph: DependencyGraph;

    private readonly duplicateDetector: DuplicateDetector;

    private readonly deadCodeDetector: DeadCodeDetector;

    private readonly statisticsGenerator: StatisticsGenerator;

    private readonly markdownGenerator: MarkdownReportGenerator;

    constructor(

        private readonly options: ArchitectureInspectorOptions

    ) {

        this.scanner = new FileScanner({

            root: options.projectRoot

        });

        this.analyzer = new ImportAnalyzer();

        this.dependencyGraph = new DependencyGraph(

            this.scanner,

            this.analyzer

        );

        this.duplicateDetector = new DuplicateDetector(

            this.scanner

        );

        this.deadCodeDetector = new DeadCodeDetector(

            this.scanner,

            this.dependencyGraph,

            this.analyzer

        );

        this.statisticsGenerator = new StatisticsGenerator(

            this.scanner,

            this.dependencyGraph,

            this.duplicateDetector,

            this.deadCodeDetector

        );

        this.markdownGenerator =

            new MarkdownReportGenerator();

    }

    /**
     * =====================================================
     * Ejecuta toda la auditoría.
     * =====================================================
     */

    public run(): ArchitectureReport {

        return {

            statistics:

                this.statisticsGenerator.generate(),

            duplicated:

                this.duplicateDetector.analyze(),

            deadCode:

                this.deadCodeDetector.analyze(),

            dependencyGraph:

                this.dependencyGraph.build()

        };

    }

    /**
     * =====================================================
     * Genera el informe Markdown.
     * =====================================================
     */

    public generateReport(): string {

        const report = this.run();

        return this.markdownGenerator.save(

            this.options.outputDirectory,

            report

        );

    }

    /**
     * =====================================================
     * Ejecuta la auditoría completa.
     * =====================================================
     */

    public execute(): void {

        console.log("");

        console.log("====================================");

        console.log(" CONTRATA-IA");

        console.log(" Architecture Inspector");

        console.log("====================================");

        console.log("");

        const reportPath =

            this.generateReport();

        console.log(

            "Informe generado correctamente."

        );

        console.log("");

        console.log(

            reportPath

        );

        console.log("");

    }

}

/**
 * ============================================================
 * Ejecución desde línea de comandos.
 * ============================================================
 */

if (require.main === module) {

    const projectRoot = process.cwd();

    const outputDirectory = path.join(

        projectRoot,

        "architecture-report"

    );

    const inspector =

        new ArchitectureInspector({

            projectRoot,

            outputDirectory

        });

    inspector.execute();

}
