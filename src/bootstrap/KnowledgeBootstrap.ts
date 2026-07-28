/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeBootstrap
 * ============================================================
 *
 * Inicializa todo el banco de conocimiento del sistema.
 *
 * ============================================================
 */

import * as path from "path";

import { KnowledgeLoader } from "../domain/conocimiento/KnowledgeLoader";
import { KnowledgeRepository } from "../domain/conocimiento/KnowledgeRepository";
import { RuleDefinition } from "../domain/conocimiento/RuleLoader";

import { CPVRepository } from "../domain/cpv/CPVRepository";
import { CPVEntry } from "../domain/cpv/CPVEntry";

export class KnowledgeBootstrap {

    constructor(

        private readonly repository: KnowledgeRepository,

        private readonly cpvRepository: CPVRepository,

        private readonly loader = new KnowledgeLoader()

    ) {}

    /**
     * Inicializa completamente el sistema.
     */
    public inicializar(): void {

        this.cargarArticulos();

        this.cargarReglas();

        this.cargarCPV();

        // Próximamente:
        //
        // this.cargarPlantillas();
        // this.cargarInformes();
        // this.cargarJurisprudencia();
        // this.cargarClausulas();

    }

    /**
     * =====================================================
     * LCSP
     * =====================================================
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
     * =====================================================
     * REGLAS
     * =====================================================
     */
    private cargarReglas(): void {

        const ficheros = this.loader.cargarDirectorio<any>(

            path.join(

                process.cwd(),

                "knowledge",

                "rules"

            )

        );

        for (const fichero of ficheros) {

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

    /**
     * =====================================================
     * CPV
     * =====================================================
     */
    private cargarCPV(): void {

        const catalogo = this.loader.cargarJSON<CPVEntry[]>(

            path.join(

                process.cwd(),

                "knowledge",

                "cpv",

                "cpv.json"

            )

        );

        this.cpvRepository.cargar(

            catalogo

        );

        for (const cpv of catalogo) {

            this.repository.registrarCPV(

                cpv

            );

        }

    }

}
