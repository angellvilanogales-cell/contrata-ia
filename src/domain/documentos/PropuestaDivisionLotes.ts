/**
 * CONTRATA IA
 * =========================================================
 * Propuesta de división en lotes.
 * =========================================================
 */

import { Lote } from "../expediente/Lote";

export class PropuestaDivisionLotes {

    constructor(

        public readonly dividir: boolean,

        public readonly motivacion: string,

        public readonly lotes: Lote[] = []

    ) {

        if (!motivacion.trim()) {
            throw new Error("Debe motivarse la propuesta.");
        }

    }

}
