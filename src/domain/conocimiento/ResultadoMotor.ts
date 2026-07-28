/**
 * ============================================================
 * CONTRATA IA
 * ResultadoMotor
 * ============================================================
 *
 * Clase base para cualquier resultado generado por
 * un motor de inferencia.
 *
 * Todos los motores devolverán objetos derivados
 * de esta clase.
 *
 * ============================================================
 */

export abstract class ResultadoMotor {

    constructor(

        /**
         * Nivel de confianza.
         */
        public readonly confianza: number,

        /**
         * Explicación resumida.
         */
        public readonly explicacion: string,

        /**
         * Normativa aplicada.
         */
        public readonly referenciasNormativas: string[] = [],

        /**
         * Observaciones.
         */
        public readonly observaciones: string[] = []

    ) {}

    /**
     * Indica si la decisión puede proponerse
     * automáticamente.
     */
    public esAutomatico(): boolean {

        return this.confianza >= 0.90;

    }

    /**
     * Indica si requiere validación técnica.
     */
    public requiereRevision(): boolean {

        return this.confianza < 0.90;

    }

}
