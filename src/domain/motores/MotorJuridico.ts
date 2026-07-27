/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Motor Jurídico.
 *
 * Es el núcleo del sistema experto. Recibe los hechos del
 * expediente y devuelve decisiones administrativas
 * motivadas conforme a la normativa aplicable.
 * ---------------------------------------------------------
 */

import { HechoAdministrativo } from "../hechos/HechoAdministrativo";
import { DecisionAdministrativa } from "../decisiones/DecisionAdministrativa";

export interface MotorJuridico {

    evaluar(
        hechos: HechoAdministrativo[]
    ): Promise<DecisionAdministrativa[]>;

}
