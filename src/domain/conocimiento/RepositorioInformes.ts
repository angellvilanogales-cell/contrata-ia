/**
 * CONTRATA IA
 * =========================================================
 * Repositorio de informes y modelos de informes.
 * =========================================================
 */

export interface RepositorioInformes {

    obtenerModelo(
        nombre: string
    ): Promise<string>;

}
