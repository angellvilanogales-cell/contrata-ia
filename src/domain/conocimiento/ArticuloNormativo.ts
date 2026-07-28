/**
 * ============================================================
 * CONTRATA IA
 * ArticuloNormativo
 * ============================================================
 *
 * Representa un artículo de una norma jurídica.
 *
 * Esta entidad será utilizada por:
 *
 * - Reglas jurídicas
 * - Decisiones jurídicas
 * - Memorias
 * - Informes
 * - PCAP
 * - PPT
 *
 * ============================================================
 */

import { FuenteJuridica } from "./FuenteJuridica";

export class ArticuloNormativo {

    /**
     * Identificador interno.
     */
    public id = "";

    /**
     * Número del artículo.
     *
     * Ejemplo:
     * 99
     * 145
     * 159
     */
    public numero = "";

    /**
     * Título del artículo.
     */
    public titulo = "";

    /**
     * Texto consolidado.
     */
    public texto = "";

    /**
     * Resumen funcional utilizado por
     * el sistema experto.
     */
    public resumen = "";

    /**
     * Palabras clave.
     */
    public etiquetas: string[] = [];

    /**
     * Fuente normativa.
     */
    public fuente!: FuenteJuridica;

    /**
     * Artículos relacionados.
     */
    public relacionados: string[] = [];

    /**
     * Indica si el artículo continúa vigente.
     */
    public vigente = true;

}
