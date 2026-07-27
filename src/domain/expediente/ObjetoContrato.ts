/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Objeto del contrato.
 * Describe de forma precisa la prestación que constituye
 * el objeto del expediente de contratación.
 * ---------------------------------------------------------
 */

export class ObjetoContrato {

    constructor(
        public readonly descripcion: string
    ) {

        if (!descripcion.trim()) {
            throw new Error("La descripción del objeto del contrato es obligatoria.");
        }

    }

}
