/**
 * CONTRATA IA
 * =========================================================
 * Presupuesto Base de Licitación.
 * =========================================================
 */

export class PresupuestoBaseLicitacion {

    constructor(
        public readonly importe: number
    ) {

        if (importe < 0) {
            throw new Error("El presupuesto base no puede ser negativo.");
        }

    }

}
