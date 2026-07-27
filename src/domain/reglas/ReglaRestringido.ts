/**
 * CONTRATA IA
 * =========================================================
 * Procedimiento Restringido.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";
import { ReglaProcedimiento } from "./ReglaProcedimiento";

export class ReglaRestringido implements ReglaProcedimiento {

    public readonly nombre = "Procedimiento Restringido";

    esAplicable(expediente: Expediente): boolean {

        // IMPLEMENTAR LCSP

        return false;

    }

    determinarProcedimiento(): ProcedimientoContratacion {

        return ProcedimientoContratacion.RESTRINGIDO;

    }

}
