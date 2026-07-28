/**
 * ============================================================
 * CONTRATA IA
 * EstadoExpediente
 * ============================================================
 *
 * Estados del ciclo de vida del expediente.
 *
 * Permitirá continuar un expediente,
 * validar fases y controlar el workflow.
 *
 * ============================================================
 */

export enum EstadoExpediente {

    /**
     * Expediente recién creado.
     */
    BORRADOR = "BORRADOR",

    /**
     * Analizando necesidad.
     */
    ANALISIS_NECESIDAD = "ANALISIS_NECESIDAD",

    /**
     * Determinando CPV.
     */
    CPV = "CPV",

    /**
     * Determinando procedimiento.
     */
    PROCEDIMIENTO = "PROCEDIMIENTO",

    /**
     * Analizando publicidad.
     */
    PUBLICIDAD = "PUBLICIDAD",

    /**
     * Analizando solvencia.
     */
    SOLVENCIA = "SOLVENCIA",

    /**
     * Analizando división en lotes.
     */
    LOTES = "LOTES",

    /**
     * Elaborando memoria.
     */
    MEMORIA = "MEMORIA",

    /**
     * Elaborando PCAP.
     */
    PCAP = "PCAP",

    /**
     * Elaborando PPT.
     */
    PPT = "PPT",

    /**
     * Expediente validado.
     */
    VALIDADO = "VALIDADO",

    /**
     * Expediente finalizado.
     */
    FINALIZADO = "FINALIZADO"

}
