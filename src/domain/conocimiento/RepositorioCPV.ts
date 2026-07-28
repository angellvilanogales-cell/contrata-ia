/**
 * CONTRATA IA
 * =========================================================
 * Repositorio de códigos CPV.
 *
 * Proporciona acceso a la clasificación CPV utilizada por
 * el Motor CPV.
 * =========================================================
 */

export interface RepositorioCPV {

    buscarPorDescripcion(
        descripcion: string
    ): Promise<string[]>;

}
