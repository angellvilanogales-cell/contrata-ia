/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeRepository
 * ============================================================
 *
 * Repositorio central de conocimiento.
 *
 * Toda la inteligencia del sistema se almacena aquí.
 *
 * Contendrá:
 *
 *  - Artículos LCSP
 *  - Reglas
 *  - Informes
 *  - Jurisprudencia
 *  - Cláusulas
 *  - Plantillas
 *  - CPV
 *
 * ============================================================
 */

import { RuleDefinition } from "./RuleLoader";

export class KnowledgeRepository {

    /**
     * Artículos LCSP.
     */
    private readonly articulos = new Map<string, any>();

    /**
     * Reglas.
     */
    private readonly reglas = new Map<string, RuleDefinition>();

    /**
     * Informes.
     */
    private readonly informes = new Map<string, any>();

    /**
     * Jurisprudencia.
     */
    private readonly jurisprudencia = new Map<string, any>();

    /**
     * Cláusulas.
     */
    private readonly clausulas = new Map<string, any>();

    /**
     * Plantillas.
     */
    private readonly plantillas = new Map<string, any>();

    /**
     * CPV.
     */
    private readonly cpv = new Map<string, any>();

    // =======================================================
    // ARTÍCULOS
    // =======================================================

    public registrarArticulo(

        articulo: any

    ): void {

        this.articulos.set(

            articulo.id,

            articulo

        );

    }

    public obtenerArticulo(

        id: string

    ): any | undefined {

        return this.articulos.get(id);

    }

    public obtenerArticulos(): any[] {

        return [...this.articulos.values()];

    }

    // =======================================================
    // REGLAS
    // =======================================================

    public registrarRegla(

        regla: RuleDefinition

    ): void {

        this.reglas.set(

            regla.id,

            regla

        );

    }

    public obtenerRegla(

        id: string

    ): RuleDefinition | undefined {

        return this.reglas.get(id);

    }

    public obtenerReglas(): RuleDefinition[] {

        return [...this.reglas.values()];

    }

    // =======================================================
    // INFORMES
    // =======================================================

    public registrarInforme(

        informe: any

    ): void {

        this.informes.set(

            informe.id,

            informe

        );

    }

    public obtenerInformes(): any[] {

        return [...this.informes.values()];

    }

    // =======================================================
    // JURISPRUDENCIA
    // =======================================================

    public registrarJurisprudencia(

        sentencia: any

    ): void {

        this.jurisprudencia.set(

            sentencia.id,

            sentencia

        );

    }

    public obtenerJurisprudencia(): any[] {

        return [...this.jurisprudencia.values()];

    }

    // =======================================================
    // CLÁUSULAS
    // =======================================================

    public registrarClausula(

        clausula: any

    ): void {

        this.clausulas.set(

            clausula.id,

            clausula

        );

    }

    public obtenerClausulas(): any[] {

        return [...this.clausulas.values()];

    }

    // =======================================================
    // PLANTILLAS
    // =======================================================

    public registrarPlantilla(

        plantilla: any

    ): void {

        this.plantillas.set(

            plantilla.id,

            plantilla

        );

    }

    public obtenerPlantillas(): any[] {

        return [...this.plantillas.values()];

    }

    // =======================================================
    // CPV
    // =======================================================

    public registrarCPV(

        registro: any

    ): void {

        this.cpv.set(

            registro.codigo,

            registro

        );

    }

    public obtenerCPV(

        codigo: string

    ): any | undefined {

        return this.cpv.get(codigo);

    }

    public obtenerTodosCPV(): any[] {

        return [...this.cpv.values()];

    }

    // =======================================================
    // ESTADÍSTICAS
    // =======================================================

    public estadisticas() {

        return {

            articulos: this.articulos.size,

            reglas: this.reglas.size,

            informes: this.informes.size,

            jurisprudencia: this.jurisprudencia.size,

            clausulas: this.clausulas.size,

            plantillas: this.plantillas.size,

            cpv: this.cpv.size

        };

    }

}
