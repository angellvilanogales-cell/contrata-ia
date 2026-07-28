/**
 * ============================================================
 * CONTRATA IA
 * SolvenciaResultado
 * ============================================================
 *
 * Resultado generado por SolvenciaEngine.
 *
 * Será utilizado posteriormente por:
 *
 * - Memoria
 * - PCAP
 * - Informes
 * - Expediente
 *
 * ============================================================
 */

export class SolvenciaResultado {

    /**
     * ¿Debe exigirse solvencia?
     */
    public exigirSolvencia = false;

    /**
     * ¿Debe exigirse clasificación?
     */
    public exigirClasificacion = false;

    /**
     * Solvencia económica.
     */
    public solvenciaEconomica: string[] = [];

    /**
     * Solvencia técnica.
     */
    public solvenciaTecnica: string[] = [];

    /**
     * Justificación jurídica.
     */
    public fundamentos: string[] = [];

    /**
     * Observaciones.
     */
    public observaciones: string[] = [];

}
