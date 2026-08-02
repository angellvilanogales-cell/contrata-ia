/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgePack
 * ------------------------------------------------------------
 * Modelo normalizado utilizado por todos los paquetes de
 * conocimiento del sistema.
 *
 * IMPORTANTE
 *
 * Este archivo únicamente define estructuras de datos.
 *
 * NO contiene:
 *
 * • reglas
 * • lógica jurídica
 * • interpretación normativa
 * • decisiones
 *
 * ============================================================
 */

import { KnowledgeRelationType } from "../catalogs/CoreKnowledgeConcepts";

/**
 * Estado del Knowledge Pack.
 */
export type KnowledgePackStatus =
    | "draft"
    | "review"
    | "validated"
    | "deprecated";

/**
 * Metadatos.
 */
export interface KnowledgePackMetadata {

    id: string;

    name: string;

    version: string;

    conceptId: string;

    domain: string;

    status: KnowledgePackStatus;

    author?: string;

    createdAt?: string;

    updatedAt?: string;

}

/**
 * Variable de entrada necesaria para tomar decisiones.
 */
export interface KnowledgeInput {

    id: string;

    name: string;

    description: string;

    required: boolean;

}

/**
 * Resultado producido por el conocimiento.
 */
export interface KnowledgeOutput {

    id: string;

    name: string;

    description: string;

}

/**
 * Documento afectado.
 */
export interface AffectedDocument {

    name: string;

    reason: string;

}

/**
 * Relación con otros conceptos.
 */
export interface KnowledgeRelation {

    source: string;

    relation: KnowledgeRelationType;

    target: string;

}

/**
 * Referencia jurídica.
 */
export interface LegalReference {

    regulation: string;

    article?: string;

    paragraph?: string;

    notes?: string;

}

/**
 * Observación procedente de las fuentes.
 */
export interface KnowledgeObservation {

    source: string;

    description: string;

}

/**
 * Ejemplo obtenido del banco documental.
 */
export interface KnowledgeExample {

    source: string;

    description: string;

}

/**
 * Regla jurídica.
 *
 * IMPORTANTE:
 * El RuleEngine será quien interprete posteriormente
 * estas reglas.
 */
export interface KnowledgeRule {

    id: string;

    description: string;

    enabled: boolean;

}

/**
 * Knowledge Pack normalizado.
 */
export interface KnowledgePack {

    /**
     * Metadatos.
     */
    metadata: KnowledgePackMetadata;

    /**
     * Definición.
     */
    definition: string;

    /**
     * Finalidad.
     */
    purpose: string;

    /**
     * Entradas necesarias.
     */
    inputs: KnowledgeInput[];

    /**
     * Resultados que produce.
     */
    outputs: KnowledgeOutput[];

    /**
     * Relaciones semánticas.
     */
    relations: KnowledgeRelation[];

    /**
     * Documentos afectados.
     */
    affectedDocuments: AffectedDocument[];

    /**
     * Reglas asociadas.
     */
    rules: KnowledgeRule[];

    /**
     * Referencias jurídicas.
     */
    legalReferences: LegalReference[];

    /**
     * Ejemplos.
     */
    examples: KnowledgeExample[];

    /**
     * Observaciones.
     */
    observations: KnowledgeObservation[];

}
