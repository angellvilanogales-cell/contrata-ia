/**
 * CONTRATA IA
 * =========================================================
 * Resultado de la evaluación de una regla jurídica.
 * =========================================================
 */

export class ResultadoEvaluacion {

    constructor(

        public readonly regla: string,

        public readonly valida: boolean,

        public readonly motivacion: string

    ) {}

}
