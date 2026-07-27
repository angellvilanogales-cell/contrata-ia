/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Justificación de insuficiencia de medios.
 *
 * Constituye uno de los elementos esenciales de la memoria
 * justificativa cuando resulte exigible.
 * ---------------------------------------------------------
 */

export class InsuficienciaMedios {

    constructor(

        public readonly justificacion: string,

        public readonly acreditada: boolean

    ) {

        if (!justificacion.trim()) {
            throw new Error("Debe existir una justificación.");
        }

    }

}
