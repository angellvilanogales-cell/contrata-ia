/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Necesidad pública que justifica la contratación.
 * ---------------------------------------------------------
 */

export class NecesidadContrato {

    constructor(
        public readonly descripcion: string
    ) {

        if (!descripcion.trim()) {
            throw new Error("Debe describirse la necesidad pública.");
        }

    }

}
