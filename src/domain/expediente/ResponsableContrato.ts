/**
 * CONTRATA IA
 * =========================================================
 * Responsable del contrato.
 * =========================================================
 */

export class ResponsableContrato {

    constructor(

        public readonly nombre: string,

        public readonly unidad: string

    ) {

        if (!nombre.trim()) {
            throw new Error("Debe indicarse el responsable.");
        }

        if (!unidad.trim()) {
            throw new Error("Debe indicarse la unidad administrativa.");
        }

    }

}
