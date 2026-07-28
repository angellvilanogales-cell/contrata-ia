/**
 * CONTRATA IA
 * =========================================================
 * Informe de solvencia.
 * =========================================================
 */

export class InformeSolvencia {

    constructor(

        public readonly contenido: string

    ) {

        if (!contenido.trim()) {
            throw new Error("Debe existir un informe de solvencia.");
        }

    }

}
