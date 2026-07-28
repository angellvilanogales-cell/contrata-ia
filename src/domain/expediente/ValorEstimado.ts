/**
 * CONTRATA IA
 * =========================================================
 * Valor Estimado del Contrato (VEC).
 *
 * Magnitud económica utilizada por la LCSP para determinar
 * el procedimiento de adjudicación y otras obligaciones.
 * =========================================================
 */

export class ValorEstimado {

    constructor(
        public readonly importe: number
    ) {

        if (importe < 0) {
            throw new Error("El valor estimado no puede ser negativo.");
        }

    }

}
