/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Motor de insuficiencia de medios.
 *
 * Determina si procede justificar automáticamente la
 * insuficiencia de medios personales o materiales del
 * órgano de contratación.
 * ---------------------------------------------------------
 */

import { HechoAdministrativo } from "../hechos/HechoAdministrativo";

export interface MotorInsuficienciaMedios {

    generarJustificacion(
        hechos: HechoAdministrativo[]
    ): Promise<string>;

}
