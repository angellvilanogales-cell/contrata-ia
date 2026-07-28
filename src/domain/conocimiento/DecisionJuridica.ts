/**
 * ============================================================
 * CONTRATA IA
 * DecisionJuridica
 * ============================================================
 *
 * Representa el resultado de una decisión tomada por
 * cualquiera de los motores del sistema.
 *
 * No solo contiene el resultado,
 * sino también la justificación jurídica.
 *
 * ============================================================
 */

export class DecisionJuridica<T> {

    /**
     * Resultado obtenido.
     */
    public resultado!: T;

    /**
     * Explicación en lenguaje natural.
     */
    public explicacion = "";

    /**
     * Artículos de referencia.
     */
    public articulos: string[] = [];

    /**
     * Normativa utilizada.
     */
    public normativa: string[] = [];

    /**
     * Informes consultivos.
     */
    public informes: string[] = [];

    /**
     * Jurisprudencia.
     */
    public jurisprudencia: string[] = [];

    /**
     * Reglas aplicadas.
     */
    public reglasAplicadas: string[] = [];

    /**
     * Nivel de confianza.
     */
    public confianza = 100;

    /**
     * Observaciones adicionales.
     */
    public observaciones: string[] = [];

}
