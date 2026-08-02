```typescript
/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgePack
 * ------------------------------------------------------------
 * Modelo normalizado utilizado por todos los paquetes de
 * conocimiento del sistema.
 *
 * Este archivo define exclusivamente estructuras de datos.
 *
 * NO contiene:
 * - lógica jurídica
 * - reglas
 * - decisiones
 * - interpretación normativa
 *
 * ============================================================
 */

import { KnowledgeRelationType } from "../catalogs/CoreKnowledgeConcepts";

/**
 * Estado de un Knowledge Pack.
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
 * Información que el sistema necesita conocer
 * para poder aplicar este conocimiento.
 */
export interface KnowledgeInput {

    id: string;

    name: string;

    description: string;

    required: boolean;

}

/**
 * Información producida por este Knowledge Pack.
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
 * Relación semántica.
 */
export interface KnowledgeRelation {

    source: string;

    relation: KnowledgeRelationType;

    target: string;

}

/**
 * Referencia normativa.
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
 * Ejemplo documental.
 */
export interface KnowledgeExample {

    source: string;

    description: string;

}

/**
 * Regla jurídica.
 *
 * IMPORTANTE:
 * El RuleEngine será quien posteriormente
 * interprete estas reglas.
 */
export interface KnowledgeRule {

    id: string;

    description: string;

    enabled: boolean;

}

/**
 * Pregunta que el asistente debe formular
 * cuando este paquete sea necesario.
 */
export interface RequiredQuestion {

    id: string;

    question: string;

    targetField: string;

    required: boolean;

}

/**
 * Conceptos que deberán recalcularse
 * cuando cambie este Knowledge Pack.
 */
export interface DecisionImpact {

    conceptId: string;

    description: string;

}

/**
 * Modelo normalizado de Knowledge Pack.
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
     * Información necesaria.
     */
    inputs: KnowledgeInput[];

    /**
     * Información generada.
     */
    outputs: KnowledgeOutput[];

    /**
     * Relaciones.
     */
    relations: KnowledgeRelation[];

    /**
     * Documentos afectados.
     */
    affectedDocuments: AffectedDocument[];

    /**
     * Reglas.
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

    /**
     * Preguntas que deberá realizar
     * automáticamente el QuestionFlowEngine.
     */
    requiredQuestions: RequiredQuestion[];

    /**
     * Conceptos afectados cuando este
     * Knowledge Pack cambie.
     */
    decisionImpacts: DecisionImpact[];

}
```
