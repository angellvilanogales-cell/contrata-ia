/**
 * CONTRATA IA
 * =========================================================
 * Procedimiento Negociado.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";
import { ReglaProcedimiento } from "./ReglaProcedimiento";

export class ReglaNegociado implements ReglaProcedimiento {

    public readonly nombre = "Procedimiento Negociado";

    esAplicable(expediente: Expediente): boolean {

        // IMPLEMENTAR LCSP

        return false;

    }

    determinarProcedimiento(): ProcedimientoContratacion {

        return ProcedimientoContratacion.NEGOCIADO;

    }

}
