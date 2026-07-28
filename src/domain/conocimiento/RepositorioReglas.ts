/**
 * CONTRATA IA
 * =========================================================
 * Repositorio de reglas jurídicas.
 * =========================================================
 */

import { ReglaJuridica } from "./ReglaJuridica";

export interface RepositorioReglas {

    obtenerReglas(): Promise<ReglaJuridica[]>;

}
