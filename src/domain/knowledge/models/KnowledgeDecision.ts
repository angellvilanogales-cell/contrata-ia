/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgeDecision
 * ------------------------------------------------------------
 * Modelo estándar de respuesta del Knowledge Engine.
 *
 * Todos los catálogos deberán devolver SIEMPRE un objeto
 * KnowledgeDecision.
 *
 * Esto garantiza que el resto del sistema (DocumentComposer,
 * PCAP, PPT, Memorias, Informes...) pueda interpretar cualquier
 * decisión sin conocer la lógica interna de cada catálogo.
 * ============================================================
 */

/**
 * Referencia normativa utilizada para justificar una decisión.
 */
export interface LegalReference {

    /**
     * Norma de referencia.
     *
     * Ejemplo:
     * "LCSP"
     */
    source: string;

    /**
     * Artículo o disposición.
     *
     * Ejemplo:
     * "Artículo 159"
     */
    article?: string;

    /**
     * Texto descriptivo.
     */
    description?: string;

}

/**
 * Resultado estándar devuelto por cualquier catálogo.
 */
export interface KnowledgeDecision {

    /**
     * Indica si la resolución ha sido satisfactoria.
     */
    success: boolean;

    /**
     * Recomendación principal.
     */
    recommendation?: string;

    /**
     * Nivel de confianza (0-100).
     */
    confidence: number;

    /**
     * Explicación de la decisión.
     */
    justification: string[];

    /**
     * Referencias normativas empleadas.
     */
    legalReferences: LegalReference[];

    /**
     * Documentos afectados por la decisión.
     */
    affectedDocuments: string[];

    /**
     * Observaciones adicionales.
     */
    observations: string[];

    /**
     * Advertencias detectadas.
     */
    warnings: string[];

    /**
     * Errores encontrados.
     */
    errors: string[];

}

/**
 * Crea una respuesta vacía.
 */
export function createKnowledgeDecision(): KnowledgeDecision {

    return {

        success: false,

        confidence: 0,

        justification: [],

        legalReferences: [],

        affectedDocuments: [],

        observations: [],

        warnings: [],

        errors: []

    };

}
