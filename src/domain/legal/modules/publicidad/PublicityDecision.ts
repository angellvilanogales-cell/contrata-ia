/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityDecision
 * ------------------------------------------------------------
 * Resultado del análisis jurídico de publicidad.
 *
 * Determina qué publicaciones son obligatorias
 * para el expediente.
 *
 * ============================================================
 */

export interface PublicityDecision {

    /**
     * Perfil del Contratante.
     */
    perfilContratante: boolean;

    /**
     * Plataforma de Contratación.
     */
    plataformaContratacion: boolean;

    /**
     * DOUE.
     */
    doue: boolean;

    /**
     * BOE.
     */
    boe: boolean;

    /**
     * BOJA.
     */
    boja: boolean;

    /**
     * Portal Transparencia.
     */
    portalTransparencia: boolean;

    /**
     * Publicidad adicional.
     */
    publicidadAdicional: boolean;

    /**
     * Justificación jurídica.
     */
    justificacion: string;

    /**
     * Normativa aplicada.
     */
    normativa: string;

    /**
     * Artículo utilizado.
     */
    articulo: string;

    /**
     * Nivel de confianza.
     */
    confidence: number;

}
