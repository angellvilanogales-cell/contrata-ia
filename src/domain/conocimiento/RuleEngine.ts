/**
 * ============================================================
 * CONTRATA IA
 * RuleEngine
 * ============================================================
 *
 * Motor responsable de gestionar las reglas jurídicas
 * cargadas desde el repositorio de conocimiento.
 *
 * No interpreta las reglas.
 * Únicamente las carga, organiza y permite su consulta.
 *
 * La interpretación corresponde al InferenceEngine.
 *
 * ============================================================
 */

import { RuleLoader, RuleDefinition } from "./RuleLoader";

export class RuleEngine {

    /**
     * Cargador de reglas.
     */
    private readonly loader = new RuleLoader();

    /**
     * Reglas cargadas.
     */
    private reglas: RuleDefinition[] = [];

    /**
     * Carga un fichero de reglas.
     */
    public cargarReglas(

        fichero: string

    ): void {

        this.reglas = this.loader.cargar(fichero);

    }

    /**
     * Devuelve todas las reglas.
     */
    public obtenerReglas(): readonly RuleDefinition[] {

        return this.reglas;

    }

    /**
     * Devuelve una regla concreta.
     */
    public obtenerRegla(

        id: string

    ): RuleDefinition | undefined {

        return this.reglas.find(

            r => r.id === id

        );

    }

    /**
     * Comprueba si existe una regla.
     */
    public existeRegla(

        id: string

    ): boolean {

        return this.obtenerRegla(id) !== undefined;

    }

    /**
     * Devuelve todas las reglas
     * ordenadas por prioridad.
     */
    public obtenerReglasOrdenadas(): RuleDefinition[] {

        return [...this.reglas]

            .sort(

                (a, b) => a.prioridad - b.prioridad

            );

    }

    /**
     * Devuelve todas las reglas
     * de un tipo determinado.
     */
    public obtenerPorTipo(

        tipo: string

    ): RuleDefinition[] {

        return this.reglas.filter(

            r => r.tipo === tipo

        );

    }

    /**
     * Número de reglas cargadas.
     */
    public total(): number {

        return this.reglas.length;

    }

    /**
     * Elimina todas las reglas.
     */
    public limpiar(): void {

        this.reglas = [];

    }

}
