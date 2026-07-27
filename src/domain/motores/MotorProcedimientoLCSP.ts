/**
 * CONTRATA IA
 * =========================================================
 * Motor específico para la selección del procedimiento
 * de contratación conforme a la LCSP.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";
import { ReglaProcedimiento } from "../reglas/ReglaProcedimiento";

export class MotorProcedimientoLCSP {

    constructor(
        private readonly reglas: ReglaProcedimiento[]
    ) {}

    determinar(
        expediente: Expediente
    ): ProcedimientoContratacion {

        for (const regla of this.reglas) {

            if (regla.esAplicable(expediente)) {
                return regla.determinarProcedimiento(expediente);
            }

        }

        throw new Error(
            "No existe una regla válida para determinar el procedimiento."
        );

    }

}
