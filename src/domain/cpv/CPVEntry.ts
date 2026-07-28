/**
 * ============================================================
 * CONTRATA IA
 * CPVEntry
 * ============================================================
 *
 * Representa un código CPV oficial.
 *
 * Esta clase constituye el modelo interno utilizado
 * por el motor CPV.
 *
 * Reglamento (CE) nº 213/2008
 * LCSP
 *
 * ============================================================
 */

export class CPVEntry {

    /**
     * Código CPV.
     *
     * Ejemplo:
     * 79993000-1
     */
    public codigo = "";

    /**
     * Descripción oficial.
     */
    public descripcion = "";

    /**
     * Nivel del CPV.
     *
     * División
     * Grupo
     * Clase
     * Categoría
     */
    public nivel = "";

    /**
     * Código padre.
     */
    public padre?: string;

    /**
     * Indica si el CPV está activo.
     */
    public activo = true;

    /**
     * Palabras clave utilizadas
     * para mejorar las búsquedas.
     */
    public palabrasClave: string[] = [];

    /**
     * Sinónimos.
     */
    public sinonimos: string[] = [];

}
