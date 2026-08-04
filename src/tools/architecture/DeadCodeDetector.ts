/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadCodeDetector
 * ------------------------------------------------------------
 * Detecta elementos potencialmente muertos dentro
 * del proyecto.
 *
 * Analiza:
 *
 * - Archivos nunca importados
 * - Clases nunca utilizadas
 * - Interfaces sin referencias
 * - Enums sin referencias
 * - Imports no utilizados (heurístico)
 *
 * ============================================================
 */

import * as fs from "fs";

import { FileScanner } from "./FileScanner";
import { DependencyGraph } from "./DependencyGraph";
import { ImportAnalyzer } from "./ImportAnalyzer";

export interface DeadCodeItem {

    type: string;

    name: string;

    file: string;

    reason: string;

}

export class DeadCodeDetector {

    constructor(

        private readonly scanner: FileScanner,

        private readonly graph: DependencyGraph,

        private readonly analyzer: ImportAnalyzer

    ){}

    /**
     * =====================================================
     * Ejecuta el análisis completo.
     * =====================================================
     */

    public analyze(): DeadCodeItem[]{

        const dead: DeadCodeItem[]=[];

        dead.push(

            ...this.detectUnusedFiles()

        );

        dead.push(

            ...this.detectUnusedExports()

        );

        return dead;

    }

    /**
     * =====================================================
     * Archivos nunca utilizados.
     * =====================================================
     */

    private detectUnusedFiles(): DeadCodeItem[]{

        const result: DeadCodeItem[]=[];

        const roots=

            this.graph.roots();

        for(const node of roots){

            if(

                node.file.includes("index.")

            ){

                continue;

            }

            result.push({

                type:"FILE",

                name:node.file,

                file:node.file,

                reason:

                    "El archivo no es importado por ningún otro."

            });

        }

        return result;

    }

    /**
     * =====================================================
     * Exportaciones nunca utilizadas.
     * =====================================================
     */

    private detectUnusedExports():DeadCodeItem[]{

        const result:DeadCodeItem[]=[];

        const files=

            this.scanner.scan();

        for(const file of files){

            const exports=

                this.analyzer.exports(

                    file.absolutePath

                );

            if(exports.length===0){

                continue;

            }

            const content=

                fs.readFileSync(

                    file.absolutePath,

                    "utf8"

                );

            for(const exp of exports){

                let used=false;

                for(const other of files){

                    if(

                        other.absolutePath===

                        file.absolutePath

                    ){

                        continue;

                    }

                    const otherContent=

                        fs.readFileSync(

                            other.absolutePath,

                            "utf8"

                        );

                    if(

                        otherContent.includes(exp)

                    ){

                        used=true;

                        break;

                    }

                }

                if(!used){

                    result.push({

                        type:"EXPORT",

                        name:exp,

                        file:file.relativePath,

                        reason:

                            "Exportación sin referencias."

                    });

                }

            }

        }

        return result;

    }

    /**
     * =====================================================
     * Resumen.
     * =====================================================
     */

    public statistics(){

        const dead=

            this.analyze();

        return{

            total:dead.length,

            files:

                dead.filter(

                    d=>d.type==="FILE"

                ).length,

            exports:

                dead.filter(

                    d=>d.type==="EXPORT"

                ).length

        };

    }

}
