/**
 * CONTRATA IA
 * =========================================================
 * Memoria de insuficiencia de medios.
 * =========================================================
 */

export class MemoriaInsuficienciaMedios {

    constructor(

        public readonly justificacion: string,

        public readonly procede: boolean

    ) {

        if (!justificacion.trim()) {
            throw new Error("Debe existir una justificación.");
        }

    }

}
