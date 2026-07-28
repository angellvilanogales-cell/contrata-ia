/**
 * ============================================================
 * CONTRATA IA
 * CandidatoCPV
 * ============================================================
 *
 * Representa un candidato propuesto durante el análisis
 * del objeto contractual.
 *
 * A diferencia de ResultadoBusquedaCPV, esta clase incorpora
 * la explicación del razonamiento seguido por el sistema.
 *
 * ============================================================
 */

import { ResultadoBusquedaCPV } from "./ResultadoBusquedaCPV";

export class CandidatoCPV {

    constructor(

        /**
         * Resultado encontrado.
         */
        public readonly resultado: ResultadoBusquedaCPV,

        /**
         * Nivel de coincidencia léxica.
         */
        public readonly coincidenciaLexica: number,

        /**
         * Nivel de coincidencia semántica.
         */
        public readonly coincidenciaSemantica: number,

        /**
         * Motivo principal de selección.
         */
        public readonly motivo: string,

        /**
         * Reglas jurídicas utilizadas.
         */
        public readonly reglasAplicadas: string[] = [],

        /**
         * Observaciones del motor.
         */
        public readonly observaciones: string[] = []

    ) {}

    /**
     * Índice global de calidad.
     */
    public get indiceGlobal(): number {

        return (
            this.coincidenciaLexica * 0.40 +
            this.coincidenciaSemantica * 0.40 +
            this.resultado.confianza * 0.20
        );

    }

    /**
     * Indica si puede proponerse automáticamente.
     */
    public esSeleccionAutomatica(): boolean {

        return this.indiceGlobal >= 0.90;

    }

    /**
     * Indica si requiere revisión técnica.
     */
    public requiereRevisionHumana(): boolean {

        return this.indiceGlobal < 0.90;

    }

    /**
     * Añade una observación.
     */
    public agregarObservacion(texto: string): CandidatoCPV {

        return new CandidatoCPV(
            this.resultado,
            this.coincidenciaLexica,
            this.coincidenciaSemantica,
            this.motivo,
            this.reglasAplicadas,
            [...this.observaciones, texto]
        );

    }

}
