/**
 * CONTRATA IA
 * =========================================================
 * Procedimiento Abierto.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";
import { ReglaProcedimiento } from "./ReglaProcedimiento";

export class ReglaAbierto implements ReglaProcedimiento {

    public readonly nombre = "Procedimiento Abierto";

    esAplicable(expediente: Expediente): boolean {

        // IMPLEMENTAR LCSP

        return false;

    }

    determinarProcedimiento(): ProcedimientoContratacion {

        return ProcedimientoContratacion.ABIERTO;

    }

}
