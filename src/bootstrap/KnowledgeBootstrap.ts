/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeBootstrap
 * ============================================================
 *
 * Inicializa todo el conocimiento del sistema.
 *
 * Carga automáticamente:
 *
 *  - Artículos LCSP
 *  - Reglas
 *  - CPV
 *  - Informes
 *  - Jurisprudencia
 *  - Cláusulas
 *  - Plantillas
 *
 * ============================================================
 */

import * as path from "path";

import { KnowledgeLoader } from "../domain/conocimiento/KnowledgeLoader";
import { KnowledgeRepository } from "../domain/conocimiento/KnowledgeRepository";
import { RuleDefinition } from "../domain/conocimiento/RuleLoader";

export class KnowledgeBootstrap {

    constructor(

        private readonly repository: KnowledgeRepository,

        private readonly loader = new KnowledgeLoader()

    ) {}

    /**
     * Inicializa todo el banco de conocimiento.
     */
    public inicializar(): void {

        this.cargarArticulos();

        this.cargarReglas();

        // Próximamente:
        //
        // this.cargarCPV();
        // this.cargarInformes();
        // this.cargarJurisprudencia();
        // this.cargarPlantillas();
        // this.cargarClausulas();

    }

    /**
     * ---------------------------------------------------------
     * LCSP
     * ---------------------------------------------------------
     */
    private cargarArticulos(): void {

        const articulos = this.loader.cargarDirectorio<any>(

            path.join(

                process.cwd(),

                "knowledge",

                "lcsp",

                "articulos"

            )

        );

        for (const articulo of articulos) {

            this.repository.registrarArticulo(

                articulo

            );

        }

    }

    /**
     * ---------------------------------------------------------
     * REGLAS
     * ---------------------------------------------------------
     */
    private cargarReglas(): void {

        const reglas = this.loader.cargarDirectorio<any>(

            path.join(

                process.cwd(),

                "knowledge",

                "rules"

            )

        );

        for (const fichero of reglas) {

            if (!Array.isArray(fichero.reglas)) {

                continue;

            }

            for (const regla of fichero.reglas as RuleDefinition[]) {

                this.repository.registrarRegla(

                    regla

                );

            }

        }

    }

}
