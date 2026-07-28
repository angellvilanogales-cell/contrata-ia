/**
 * ============================================================
 * CONTRATA IA
 * ResultadoBusquedaCPV
 * ============================================================
 *
 * Representa un candidato CPV obtenido durante
 * el análisis del objeto del contrato.
 *
 * ============================================================
 */

export class ResultadoBusquedaCPV {

    constructor(

        public readonly codigo: string,

        public readonly descripcion: string,

        public readonly principal: boolean,

        public readonly confianza: number,

        public readonly palabrasClave: string[] = []

    ) {}

    /**
     * Indica si la confianza puede considerarse alta.
     */
    public esAltaConfianza(): boolean {

        return this.confianza >= 0.85;

    }

    /**
     * Indica si necesita validación humana.
     */
    public requiereRevision(): boolean {

        return this.confianza < 0.70;

    }

    /**
     * Devuelve una representación textual.
     */
    public toString(): string {

        return `${this.codigo} - ${this.descripcion}`;

    }

}
