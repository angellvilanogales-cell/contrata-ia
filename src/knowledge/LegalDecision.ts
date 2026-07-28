/**
 * ============================================================
 * CONTRATA IA
 * LegalDecision
 * ============================================================
 *
 * Representa una decisión jurídica adoptada por el
 * motor de inferencia.
 *
 * Todas las decisiones deberán poder motivarse
 * normativamente.
 *
 * ============================================================
 */

export interface LegalDecision {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Nombre corto.
     */
    nombre: string;

    /**
     * Artículo de la LCSP que fundamenta
     * la decisión.
     */
    articulo: string;

    /**
     * Motivación jurídica.
     */
    motivacion: string;

    /**
     * Valor decidido.
     */
    valor: unknown;

    /**
     * Nivel de confianza.
     */
    confianza: number;

    /**
     * Documentos afectados.
     */
    documentos: string[];

}
