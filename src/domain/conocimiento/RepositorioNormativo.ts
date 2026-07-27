/**
 * CONTRATA IA
 * =========================================================
 * Repositorio de conocimiento normativo.
 *
 * Será la puerta de entrada a toda la normativa utilizada
 * por el sistema experto.
 * =========================================================
 */

import { Norma } from "../normativa/Norma";

export interface RepositorioNormativo {

    obtenerNormas(): Promise<Norma[]>;

}
