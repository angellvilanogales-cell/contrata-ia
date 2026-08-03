/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ResolutionResult
 * ------------------------------------------------------------
 * Modelo común utilizado por todos los motores expertos
 * (Resolvers) del sistema.
 *
 * Ningún Resolver devolverá valores simples.
 *
 * Todos devolverán un ResolutionResult completamente
 * justificado y trazable.
 *
 * ============================================================
 */

/**
 * Nivel de confianza de la resolución.
 */
export enum ResolutionConfidence {

    LOW = "LOW",

    MEDIUM = "MEDIUM",

    HIGH = "HIGH",

    CERTAIN = "CERTAIN"

}

/**
 * Evidencia utilizada para alcanzar una decisión.
 */
export interface ResolutionEvidence {

    /**
     * Documento origen.
     */
    document?: string;

    /**
     * Nombre del apartado.
     */
    section?: string;

    /**
     * Referencia interna.
     */
    reference?: string;

}

/**
 * Artículo normativo utilizado.
 */
export interface ResolutionArticle {

    /**
     * Norma.
     *
     * Ejemplo:
     * LCSP
     */
    regulation: string;

    /**
     * Artículo.
     */
    article: string;

    /**
     * Observaciones.
     */
    notes?: string;

}

/**
 * Regla aplicada.
 */
export interface AppliedRule {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

}

/**
 * Alternativa posible.
 */
export interface ResolutionAlternative<T> {

    /**
     * Valor alternativo.
     */
    value: T;

    /**
     * Motivo.
     */
    reason: string;

}

/**
 * Resultado común.
 */
export interface ResolutionResult<T> {

    /**
     * Valor finalmente seleccionado.
     */
    value: T;

    /**
     * Nivel de confianza.
     */
    confidence: ResolutionConfidence;

    /**
     * Explicación completa.
     */
    reasoning: string;

    /**
     * Evidencias utilizadas.
     */
    evidences: ResolutionEvidence[];

    /**
     * Artículos utilizados.
     */
    articles: ResolutionArticle[];

    /**
     * Knowledge Packs utilizados.
     */
    knowledgePacks: string[];

    /**
     * Reglas aplicadas.
     */
    appliedRules: AppliedRule[];

    /**
     * Advertencias.
     */
    warnings: string[];

    /**
     * Errores.
     */
    errors: string[];

    /**
     * Posibles alternativas.
     */
    alternatives: ResolutionAlternative<T>[];

}

/**
 * Crea un resultado vacío.
 */
export function createResolutionResult<T>(
    value: T
): ResolutionResult<T> {

    return {

        value,

        confidence: ResolutionConfidence.MEDIUM,

        reasoning: "",

        evidences: [],

        articles: [],

        knowledgePacks: [],

        appliedRules: [],

        warnings: [],

        errors: [],

        alternatives: []

    };

}
