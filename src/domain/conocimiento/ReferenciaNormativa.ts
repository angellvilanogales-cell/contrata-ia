/**
 * ============================================================
 * CONTRATA IA
 * ReferenciaNormativa
 * ============================================================
 *
 * Representa una referencia jurídica utilizada para
 * justificar una decisión del sistema.
 *
 * Puede hacer referencia a:
 *
 * • Artículos de la LCSP
 * • Reglamentos
 * • Instrucciones
 * • Directivas
 * • Jurisprudencia
 * • Informes consultivos
 *
 * ============================================================
 */

export class ReferenciaNormativa {

    constructor(

        /**
         * Norma.
         */
        public readonly norma: string,

        /**
         * Artículo o referencia.
         */
        public readonly articulo: string,

        /**
         * Apartado.
         */
        public readonly apartado: string | null = null,

        /**
         * Texto justificativo.
         */
        public readonly descripcion: string,

        /**
         * Prioridad de aplicación.
         */
        public readonly prioridad: number = 0

    ) {}

    /**
     * Devuelve una referencia corta.
     */
    public referencia(): string {

        if (!this.apartado) {
            return `${this.norma} art. ${this.articulo}`;
        }

        return `${this.norma} art. ${this.articulo}.${this.apartado}`;

    }

    /**
     * Devuelve la referencia completa.
     */
    public toString(): string {

        return `${this.referencia()} - ${this.descripcion}`;

    }

    /**
     * Indica si pertenece a la LCSP.
     */
    public esLCSP(): boolean {

        return this.norma.trim().toUpperCase() === "LCSP";

    }

    /**
     * Indica si tiene prioridad.
     */
    public esPrioritaria(): boolean {

        return this.prioridad > 0;

    }

}
