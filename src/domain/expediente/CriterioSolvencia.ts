/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Requisito de solvencia.
 * ---------------------------------------------------------
 */

export class CriterioSolvencia {

    constructor(

        public readonly descripcion: string,

        public readonly obligatorio: boolean = true

    ) {

        if (!descripcion.trim()) {
            throw new Error("Debe describirse el criterio de solvencia.");
        }

    }

}
