/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ConflictSeverity
 * ------------------------------------------------------------
 * Define el nivel de gravedad de los conflictos
 * detectados por el Motor Jurídico.
 *
 * Este nivel permitirá al DecisionEngine decidir
 * si puede continuar, debe advertir o debe detener
 * completamente la generación del expediente.
 *
 * ============================================================
 */

export enum ConflictSeverity {

    /**
     * Información.
     *
     * No afecta al expediente.
     */
    INFO = "INFO",

    /**
     * Advertencia.
     *
     * El expediente puede continuar,
     * aunque requiere revisión.
     */
    WARNING = "WARNING",

    /**
     * Error.
     *
     * Debe revisarse antes de continuar.
     */
    ERROR = "ERROR",

    /**
     * Error crítico.
     *
     * El Motor Jurídico debe detenerse.
     */
    CRITICAL = "CRITICAL"

}
