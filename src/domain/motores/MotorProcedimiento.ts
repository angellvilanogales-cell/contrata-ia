/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Motor de selección del procedimiento de adjudicación.
 *
 * Determina el procedimiento aplicable conforme a la LCSP
 * utilizando el valor estimado, el objeto del contrato,
 * el tipo de contrato y el resto de hechos administrativos.
 * ---------------------------------------------------------
 */

import { HechoAdministrativo } from "../hechos/HechoAdministrativo";

export interface MotorProcedimiento {

    determinarProcedimiento(
        hechos: HechoAdministrativo[]
    ): Promise<string>;

}
