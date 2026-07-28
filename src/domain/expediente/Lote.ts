/**
 * CONTRATA IA
 * =========================================================
 * Lote del contrato.
 * =========================================================
 */

export class Lote {

    constructor(

        public readonly numero: number,

        public readonly descripcion: string

    ) {

        if (numero <= 0) {
            throw new Error("Número de lote incorrecto.");
        }

        if (!descripcion.trim()) {
            throw new Error("Debe indicarse la descripción del lote.");
        }

    }

}
