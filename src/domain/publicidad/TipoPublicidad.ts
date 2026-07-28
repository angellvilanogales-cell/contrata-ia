/**
 * ============================================================
 * CONTRATA IA
 * TipoPublicidad
 * ============================================================
 *
 * Tipos de publicidad de la licitación.
 *
 * ============================================================
 */

export enum TipoPublicidad {

    /**
     * Sin publicidad.
     */
    NINGUNA = "NINGUNA",

    /**
     * Perfil del contratante.
     */
    PERFIL_CONTRATANTE = "PERFIL_CONTRATANTE",

    /**
     * Plataforma de Contratación del Sector Público.
     */
    PLACE = "PLACE",

    /**
     * Diario Oficial de la Unión Europea.
     */
    DOUE = "DOUE",

    /**
     * Publicidad combinada.
     */
    PLACE_DOUE = "PLACE_DOUE"

}
