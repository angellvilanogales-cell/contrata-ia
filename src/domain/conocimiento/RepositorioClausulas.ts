/**
 * CONTRATA IA
 * =========================================================
 * Repositorio de cláusulas administrativas.
 *
 * Contendrá cláusulas generales, sociales,
 * medioambientales y específicas.
 * =========================================================
 */

export interface RepositorioClausulas {

    obtenerClausulas(
        categoria: string
    ): Promise<string[]>;

}
