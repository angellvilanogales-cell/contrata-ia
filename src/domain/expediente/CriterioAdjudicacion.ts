/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Criterio de adjudicación.
 *
 * Representa un criterio utilizado para valorar las ofertas
 * conforme a la LCSP.
 * ---------------------------------------------------------
 */

export class CriterioAdjudicacion {

    constructor(

        public readonly nombre: string,

        public readonly ponderacion: number,

        public readonly evaluableMedianteFormula: boolean

    ) {

        if (!nombre.trim()) {
            throw new Error("Debe indicarse el criterio.");
        }

        if (ponderacion <= 0 || ponderacion > 100) {
            throw new Error("La ponderación debe estar comprendida entre 1 y 100.");
        }

    }

}
