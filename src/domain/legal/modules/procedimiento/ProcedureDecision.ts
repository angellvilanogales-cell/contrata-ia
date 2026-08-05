/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureDecision
 * ------------------------------------------------------------
 * Resultado jurídico del análisis del procedimiento de
 * adjudicación.
 *
 * ============================================================
 */

export interface ProcedureDecision {

    /**
     * Procedimiento seleccionado.
     */
    procedimiento: ProcedureType;

    /**
     * Tipo de tramitación.
     */
    tramitacion: ProcedureProcessing;

    /**
     * ¿Contrato sujeto a regulación armonizada?
     */
    regulacionArmonizada: boolean;

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

/* ========================================================= */

export enum ProcedureType {

    MENOR = "MENOR",

    ABIERTO = "ABIERTO",

    ABIERTO_SIMPLIFICADO = "ABIERTO_SIMPLIFICADO",

    ABIERTO_SIMPLIFICADO_ABREVIADO = "ABIERTO_SIMPLIFICADO_ABREVIADO",

    RESTRINGIDO = "RESTRINGIDO",

    NEGOCIADO = "NEGOCIADO",

    DIALOGO_COMPETITIVO = "DIALOGO_COMPETITIVO",

    ASOCIACION_INNOVACION = "ASOCIACION_INNOVACION"

}

/* ========================================================= */

export enum ProcedureProcessing {

    ORDINARIA = "ORDINARIA",

    URGENTE = "URGENTE",

    EMERGENCIA = "EMERGENCIA"

}
