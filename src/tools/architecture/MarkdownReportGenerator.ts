/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * MarkdownReportGenerator
 * ------------------------------------------------------------
 * Genera automáticamente un informe Markdown con el
 * resultado del análisis arquitectónico.
 *
 * ============================================================
 */

import * as fs from "fs";
import * as path from "path";

import { ProjectStatistics } from "./StatisticsGenerator";
import { DuplicateItem } from "./DuplicateDetector";
import { DeadCodeItem } from "./DeadCodeDetector";
import { DependencyNode } from "./DependencyGraph";

export interface ArchitectureReport {

    statistics: ProjectStatistics;

    duplicated: DuplicateItem[];

    deadCode: DeadCodeItem[];

    dependencyGraph: Map<string, DependencyNode>;

}

export class MarkdownReportGenerator {

    /**
     * =====================================================
     * Genera el documento completo.
     * =====================================================
     */

    public generate(

        report: ArchitectureReport

    ): string {

        const md: string[] = [];

        md.push("# CONTRATA-IA");
        md.push("");
        md.push("## Architecture Report");
        md.push("");

        md.push("---");
        md.push("");

        md.push("## Resumen");
        md.push("");

        md.push(`- Archivos: ${report.statistics.totalFiles}`);
        md.push(`- Directorios: ${report.statistics.totalDirectories}`);
        md.push(`- Raíces: ${report.statistics.dependencyRoots}`);
        md.push(`- Hojas: ${report.statistics.dependencyLeaves}`);
        md.push("");

        md.push("---");
        md.push("");

        md.push("## Extensiones");
        md.push("");

        md.push("| Extensión | Cantidad |");
        md.push("|-----------|---------:|");

        Object.entries(report.statistics.byExtension)

            .sort()

            .forEach(([ext, count]) => {

                md.push(`| ${ext} | ${count} |`);

            });

        md.push("");

        md.push("---");
        md.push("");

        md.push("## Duplicados");
        md.push("");

        if (report.duplicated.length === 0) {

            md.push("No se han encontrado duplicados.");

        } else {

            report.duplicated.forEach(item => {

                md.push(`### ${item.kind}: ${item.name}`);
                md.push("");

                item.files.forEach(file => {

                    md.push(`- ${file}`);

                });

                md.push("");

            });

        }

        md.push("---");
        md.push("");

        md.push("## Código potencialmente muerto");
        md.push("");

        if (report.deadCode.length === 0) {

            md.push("No se ha detectado código muerto.");

        } else {

            report.deadCode.forEach(item => {

                md.push(
                    `- **${item.type}** \`${item.name}\``
                );

                md.push(
                    `  - Archivo: ${item.file}`
                );

                md.push(
                    `  - Motivo: ${item.reason}`
                );

                md.push("");

            });

        }

        md.push("---");
        md.push("");

        md.push("## Dependencias");

        md.push("");

        report.dependencyGraph.forEach(node => {

            md.push(`### ${node.file}`);

            md.push("");

            md.push("Importa:");

            if (node.imports.length === 0) {

                md.push("- Ninguno");

            } else {

                node.imports.forEach(dep =>

                    md.push(`- ${dep}`)

                );

            }

            md.push("");

            md.push("Es utilizado por:");

            if (node.importedBy.length === 0) {

                md.push("- Ninguno");

            } else {

                node.importedBy.forEach(dep =>

                    md.push(`- ${dep}`)

                );

            }

            md.push("");

        });

        md.push("---");
        md.push("");

        md.push("## Fin del informe");

        return md.join("\n");

    }

    /**
     * =====================================================
     * Guarda el informe.
     * =====================================================
     */

    public save(

        outputDirectory: string,

        report: ArchitectureReport

    ): string {

        if (

            !fs.existsSync(outputDirectory)

        ) {

            fs.mkdirSync(

                outputDirectory,

                {

                    recursive: true

                }

            );

        }

        const output = path.join(

            outputDirectory,

            "ArchitectureReport.md"

        );

        fs.writeFileSync(

            output,

            this.generate(report),

            "utf8"

        );

        return output;

    }

}
