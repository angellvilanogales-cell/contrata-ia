/**
 * CONTRATA IA
 * =========================================================
 * Informe de propuesta del procedimiento de contratación.
 * =========================================================
 */

import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";

export class InformeProcedimiento {

    constructor(

        public readonly procedimiento: ProcedimientoContratacion,

        public readonly motivacion: string

    ) {

        if (!motivacion.trim()) {
            throw new Error("Debe motivarse el procedimiento.");
        }

    }

}
