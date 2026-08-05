/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadlineDecision
 * ------------------------------------------------------------
 * Resultado del Motor de Plazos.
 *
 * ============================================================
 */

export interface DeadlineDecision {

    /**
     * Plazo presentación ofertas.
     */
    ofertasDias:number;

    /**
     * Plazo adjudicación.
     */
    adjudicacionDias:number;

    /**
     * Plazo formalización.
     */
    formalizacionDias:number;

    /**
     * Plazo subsanación.
     */
    subsanacionDias:number;

    /**
     * Plazo recurso.
     */
    recursoDias:number;

    /**
     * Plazo ejecución.
     */
    ejecucionDias:number;

    /**
     * Justificación.
     */
    justificacion:string;

    /**
     * Normativa aplicada.
     */
    normativa:string;

    /**
     * Artículo LCSP.
     */
    articulo:string;

    /**
     * Confianza.
     */
    confidence:number;

}

/**
 * ============================================================
 * DeadlineContext
 * ============================================================
 */

export interface DeadlineContext{

    tipoContrato:string;

    procedimiento:string;

    tramitacion:string;

    regulacionArmonizada:boolean;

    valorEstimado:number;

    urgencia:boolean;

    emergencia:boolean;

    financiacionEuropea:boolean;

}
