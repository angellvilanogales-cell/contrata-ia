/**
 * ============================================================
 * CONTRATA IA
 * ObjetoContrato
 * ============================================================
 *
 * Representa el objeto del contrato introducido por
 * el usuario antes de iniciar el expediente.
 *
 * Constituye la entrada principal del sistema experto.
 *
 * Basado en los artículos 99 a 102 de la LCSP.
 *
 * ============================================================
 */

export class ObjetoContrato {

    /**
     * Descripción breve.
     */
    public titulo = "";

    /**
     * Descripción completa.
     */
    public descripcion = "";

    /**
     * Necesidad administrativa.
     */
    public necesidad = "";

    /**
     * Objetivos perseguidos.
     */
    public objetivos: string[] = [];

    /**
     * Tipo de contrato previsto.
     *
     * Obras
     * Servicios
     * Suministros
     * Mixto
     */
    public tipoContrato = "";

    /**
     * Valor estimado.
     */
    public valorEstimado = 0;

    /**
     * Presupuesto base de licitación.
     */
    public presupuestoBase = 0;

    /**
     * Duración prevista (meses).
     */
    public duracionMeses = 0;

    /**
     * Posibilidad de prórroga.
     */
    public admiteProrroga = false;

    /**
     * Número máximo de prórrogas.
     */
    public numeroProrrogas = 0;

}
