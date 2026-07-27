/**
 * CONTRATA IA
 * =========================================================
 * Regla para determinar el procedimiento de contratación.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";

export interface ReglaProcedimiento {

    nombre: string;

    esAplicable(
        expediente: Expediente
    ): boolean;

    determinarProcedimiento(
        expediente: Expediente
    ): ProcedimientoContratacion;

}
