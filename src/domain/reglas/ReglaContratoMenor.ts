/**
 * CONTRATA IA
 * =========================================================
 * Regla para contratos menores.
 *
 * La lógica jurídica se implementará posteriormente
 * conforme a la LCSP vigente.
 * =========================================================
 */

import { Expediente } from "../expediente/Expediente";
import { ProcedimientoContratacion } from "../expediente/ProcedimientoContratacion";
import { ReglaProcedimiento } from "./ReglaProcedimiento";

export class ReglaContratoMenor implements ReglaProcedimiento {

    public readonly nombre = "Contrato Menor";

    esAplicable(expediente: Expediente): boolean {

        // IMPLEMENTAR LCSP

        return false;

    }

    determinarProcedimiento(): ProcedimientoContratacion {

        return ProcedimientoContratacion.NEGOCIADO;

    }

}
