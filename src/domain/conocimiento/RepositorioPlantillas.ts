/**
 * CONTRATA IA
 * =========================================================
 * Repositorio de plantillas documentales.
 *
 * Permitirá recuperar las plantillas oficiales de memoria,
 * PCAP, PPT e informes.
 * =========================================================
 */

export interface RepositorioPlantillas {

    obtenerPlantilla(
        nombre: string
    ): Promise<string>;

}
