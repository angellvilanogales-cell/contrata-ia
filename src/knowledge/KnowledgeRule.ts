/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeRule
 * ============================================================
 *
 * Regla jurídica derivada de la normativa.
 *
 * Constituye la unidad mínima de conocimiento del sistema.
 *
 * Una regla describe:
 *
 * • cuándo aplica
 * • qué necesita
 * • qué produce
 * • qué documentos modifica
 * *
 * ============================================================
 */

export interface KnowledgeRule {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre corto.
     */
    nombre: string;

    /**
     * Artículo LCSP.
     */
    articulo: string;

    /**
     * Descripción jurídica.
     */
    descripcion: string;

    /**
     * Información necesaria para aplicar la regla.
     */
    entradas: string[];

    /**
     * Resultado producido.
     */
    salidas: string[];

    /**
     * Motores afectados.
     */
    motores: string[];

    /**
     * Documentos afectados.
     */
    documentos: string[];

}
