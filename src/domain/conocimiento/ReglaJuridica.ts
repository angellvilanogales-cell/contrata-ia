/**
 * ============================================================
 * CONTRATA IA
 * ReglaJuridica
 * ============================================================
 *
 * Unidad básica de razonamiento jurídico.
 *
 * Una regla indica:
 *
 * SI ocurre una condición
 *
 * ENTONCES debe aplicarse una consecuencia.
 *
 * Los motores nunca contendrán reglas.
 * Las reglas vivirán únicamente en esta capa.
 *
 * ============================================================
 */

import { ReferenciaNormativa } from "./ReferenciaNormativa";

export class ReglaJuridica {

    constructor(

        /**
         * Identificador único.
         */
        public readonly id: string,

        /**
         * Nombre corto.
         */
        public readonly nombre: string,

        /**
         * Descripción funcional.
         */
        public readonly descripcion: string,

        /**
         * Motor responsable.
         *
         * Ej:
         * CPV
         * PROCEDIMIENTO
         * SOLVENCIA
         * PUBLICIDAD
         */
        public readonly motor: string,

        /**
         * Condición.
         */
        public readonly condicion: string,

        /**
         * Consecuencia.
         */
        public readonly consecuencia: string,

        /**
         * Referencias jurídicas.
         */
        public readonly referencias: ReferenciaNormativa[] = [],

        /**
         * Prioridad.
         */
        public readonly prioridad: number = 0,

        /**
         * Activa.
         */
        public readonly activa: boolean = true

    ) {}

    /**
     * Indica si la regla puede utilizarse.
     */
    public disponible(): boolean {

        return this.activa;

    }

    /**
     * Devuelve la referencia principal.
     */
    public referenciaPrincipal(): ReferenciaNormativa | undefined {

        return this.referencias[0];

    }

    /**
     * Comprueba si afecta a un motor.
     */
    public afectaMotor(
        nombreMotor: string
    ): boolean {

        return (
            this.motor.toUpperCase() ===
            nombreMotor.toUpperCase()
        );

    }

}
