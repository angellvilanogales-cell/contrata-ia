/**
 * ============================================================
 * CONTRATA IA
 * SolvenciaRegla
 * ============================================================
 *
 * Modelo de una regla jurídica de solvencia.
 *
 * Estas reglas serán cargadas posteriormente desde
 * la base de conocimiento.
 *
 * ============================================================
 */

export class SolvenciaRegla {

    /**
     * Identificador único.
     */
    public id = "";

    /**
     * Nombre de la regla.
     */
    public nombre = "";

    /**
     * Tipo de contrato.
     */
    public tipoContrato?: string;

    /**
     * Procedimiento.
     */
    public procedimiento?: string;

    /**
     * Valor estimado mínimo.
     */
    public valorMinimo?: number;

    /**
     * Valor estimado máximo.
     */
    public valorMaximo?: number;

    /**
     * ¿Debe exigirse solvencia?
     */
    public exigirSolvencia = false;

    /**
     * ¿Debe exigirse clasificación?
     */
    public exigirClasificacion = false;

    /**
     * Medios de acreditación económica.
     */
    public solvenciaEconomica: string[] = [];

    /**
     * Medios de acreditación técnica.
     */
    public solvenciaTecnica: string[] = [];

    /**
     * Referencias jurídicas.
     */
    public fundamentos: string[] = [];

    /**
     * Prioridad de la regla.
     */
    public prioridad = 0;

    /**
     * Estado.
     */
    public activa = true;

}
