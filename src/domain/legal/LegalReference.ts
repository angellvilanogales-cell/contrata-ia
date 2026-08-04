/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReference
 * ------------------------------------------------------------
 * Representa una referencia normativa única.
 *
 * Todas las referencias legales del sistema deberán
 * utilizar esta entidad.
 *
 * Ningún documento almacenará directamente artículos
 * en formato texto.
 *
 * ============================================================
 */

export interface LegalReference {

    /**
     * Identificador interno.
     *
     * Ejemplo:
     *
     * LCSP_028
     *
     */

    id: string;

    /**
     * Norma.
     *
     * Ejemplos:
     *
     * LCSP
     * RD817
     * RGLCAP
     * LPAC
     * LRJSP
     *
     */

    law: string;

    /**
     * Título oficial de la norma.
     */

    lawTitle: string;

    /**
     * Artículo.
     */

    article: string;

    /**
     * Apartado.
     */

    section?: string;

    /**
     * Letra.
     */

    letter?: string;

    /**
     * Texto resumido.
     */

    summary: string;

    /**
     * Texto completo.
     *
     * Opcional.
     */

    fullText?: string;

    /**
     * Vigencia.
     */

    validFrom?: Date;

    validUntil?: Date;

    /**
     * ¿Está vigente?
     */

    active: boolean;

    /**
     * Palabras clave.
     */

    keywords: string[];

    /**
     * Documentos afectados.
     */

    relatedDocuments: string[];

    /**
     * Epígrafes afectados.
     */

    relatedSections: string[];

    /**
     * Referencias cruzadas.
     */

    relatedArticles: string[];

    /**
     * Observaciones.
     */

    notes?: string;

}
