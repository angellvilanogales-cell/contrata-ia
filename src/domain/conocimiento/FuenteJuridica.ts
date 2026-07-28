/**
 * ============================================================
 * CONTRATA IA
 * FuenteJuridica
 * ============================================================
 *
 * Describe una fuente jurídica utilizada para fundamentar
 * una decisión del sistema experto.
 *
 * Todas las reglas deberán poder enlazarse con una o varias
 * fuentes jurídicas.
 *
 * ============================================================
 */

export class FuenteJuridica {

    /**
     * Identificador único.
     */
    public id = "";

    /**
     * Tipo de fuente.
     *
     * LCSP
     * DIRECTIVA
     * INFORME
     * JURISPRUDENCIA
     * MODELO
     * INSTRUCCION
     */
    public tipo = "";

    /**
     * Organismo emisor.
     */
    public organismo = "";

    /**
     * Título.
     */
    public titulo = "";

    /**
     * Referencia.
     *
     * Ejemplo:
     * Art. 145 LCSP
     */
    public referencia = "";

    /**
     * Fecha.
     */
    public fecha?: Date;

    /**
     * URL oficial.
     */
    public url = "";

    /**
     * Resumen.
     */
    public resumen = "";

    /**
     * Palabras clave.
     */
    public etiquetas: string[] = [];

    /**
     * Indica si la fuente continúa vigente.
     */
    public vigente = true;

}
