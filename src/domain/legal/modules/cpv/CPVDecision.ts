/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVDecision
 * ------------------------------------------------------------
 * Resultado del Motor CPV.
 * ============================================================
 */

export interface CPVDecision {

    /**
     * CPV principal.
     */
    cpvPrincipal: string;

    /**
     * Descripción del CPV principal.
     */
    descripcionPrincipal: string;

    /**
     * CPV secundarios.
     */
    cpvSecundarios: string[];

    /**
     * Descripciones CPV secundarios.
     */
    descripcionesSecundarias: string[];

    /**
     * Nivel de adecuación (0-100).
     */
    score: number;

    /**
     * ¿Es recomendable dividir en lotes?
     */
    recomiendaLotes: boolean;

    /**
     * Justificación jurídica y técnica.
     */
    justificacion: string;

    /**
     * Norma aplicada.
     */
    normativa: string;

    /**
     * Referencia normativa.
     */
    articulo: string;

    /**
     * Nivel de confianza.
     */
    confidence: number;

}
