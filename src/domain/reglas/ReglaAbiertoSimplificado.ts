/**
 * CONTRATA IA
 * =========================================================
 * Procedimiento Abierto Simplificado.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";
import { ReglaProcedimiento } from "./ReglaProcedimiento";

export class ReglaAbiertoSimplificado implements ReglaProcedimiento {

    public readonly nombre = "Abierto Simplificado";

    esAplicable(expediente: Expediente): boolean {

        // IMPLEMENTAR LCSP

        return false;

    }

    determinarProcedimiento(): ProcedimientoContratacion {

        return ProcedimientoContratacion.ABIERTO_SIMPLIFICADO;

    }

}
