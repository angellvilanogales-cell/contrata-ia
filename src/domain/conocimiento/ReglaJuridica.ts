/**
 * CONTRATA IA
 * ---------------------------------------------------------
 * Regla jurídica utilizada por el Motor Jurídico para
 * transformar hechos administrativos en decisiones
 * motivadas.
 * ---------------------------------------------------------
 */

import { HechoAdministrativo } from "../hechos/HechoAdministrativo";

export interface ReglaJuridica {

    nombre: string;

    descripcion: string;

    esAplicable(
        hechos: HechoAdministrativo[]
    ): boolean;

}
