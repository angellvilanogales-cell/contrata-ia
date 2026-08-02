/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgeConcept
 * ------------------------------------------------------------
 * Unidad mínima de conocimiento del sistema.
 *
 * Todo el conocimiento jurídico de Contrata-IA se representa
 * mediante conceptos relacionados entre sí.
 *
 * Un concepto NO contiene lógica.
 *
 * Un concepto describe:
 *
 * • qué es
 * • de qué depende
 * • qué consecuencias produce
 * • qué documentos afecta
 * • qué normativa lo respalda
 *
 * ============================================================
 */

/**
 * Relación entre conceptos.
 */
export interface KnowledgeRelation {

    /**
     * Concepto origen.
     */
    source: string;

    /**
     * Tipo de relación.
     *
     * Ejemplos:
     *  - determines
     *  - depends_on
     *  - generates
     *  - requires
     *  - affects
     */
    relation: string;

    /**
     * Concepto destino.
     */
    target: string;

}

/**
 * Referencia normativa.
 */
export interface LegalReference {

    /**
     * Norma.
     */
    regulation: string;

    /**
     * Artículo.
     */
    article?: string;

    /**
     * Observaciones.
     */
    notes?: string;

}

/**
 * Concepto de conocimiento.
 */
export interface KnowledgeConcept {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Dominio funcional.
     *
     * Ejemplos:
     *
     * Procedure
     * CPV
     * Solvency
     * Clauses
     */
    domain: string;

    /**
     * Descripción.
     */
    description: string;

    /**
     * Conceptos de los que depende.
     */
    dependsOn: string[];

    /**
     * Conceptos que genera.
     */
    produces: string[];

    /**
     * Documentos afectados.
     */
    affectedDocuments: string[];

    /**
     * Relaciones.
     */
    relations: KnowledgeRelation[];

    /**
     * Referencias jurídicas.
     */
    legalReferences: LegalReference[];

    /**
     * Activo.
     */
    enabled: boolean;

}
