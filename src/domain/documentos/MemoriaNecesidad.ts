/**
 * CONTRATA IA
 * =========================================================
 * Memoria de Necesidad.
 *
 * Justifica la necesidad pública que motiva la contratación.
 * =========================================================
 */

export class MemoriaNecesidad {

    constructor(

        public readonly descripcion: string,

        public readonly objetivos: string[]

    ) {

        if (!descripcion.trim()) {
            throw new Error("Debe justificarse la necesidad.");
        }

    }

}
