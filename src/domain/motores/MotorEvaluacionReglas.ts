/**
 * CONTRATA IA
 * =========================================================
 * Motor genérico de evaluación de reglas.
 *
 * Ejecuta un conjunto de reglas jurídicas y devuelve
 * la primera que resulte aplicable.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ReglaProcedimiento } from "../reglas/ReglaProcedimiento";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";

export class MotorEvaluacionReglas {

    constructor(
        private readonly reglas: ReglaProcedimiento[]
    ) {}

    public evaluar(
        expediente: Expediente
    ): ProcedimientoContratacion {

        for (const regla of this.reglas) {

            if (regla.esAplicable(expediente)) {
                return regla.determinarProcedimiento(expediente);
            }

        }

        throw new Error(
            "No existe ninguna regla aplicable para este expediente."
        );

    }

}
