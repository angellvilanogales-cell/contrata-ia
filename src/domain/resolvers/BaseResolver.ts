/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseResolver
 * ------------------------------------------------------------
 *
 * Clase base de todos los motores expertos.
 *
 * Ningún Resolver implementará directamente toda la lógica.
 *
 * Todos heredarán de BaseResolver.
 *
 * RESPONSABILIDADES
 *
 * • Crear ResolutionResult
 * • Registrar advertencias
 * • Registrar errores
 * • Registrar evidencias
 * • Registrar artículos
 * • Registrar reglas
 * • Registrar Knowledge Packs
 * • Construir razonamientos
 *
 * ============================================================
 */

import {

    ResolutionResult,

    ResolutionConfidence,

    ResolutionEvidence,

    ResolutionArticle,

    AppliedRule,

    createResolutionResult

} from "./ResolutionResult";

export abstract class BaseResolver<T> {

    /**
     * Resultado.
     */
    protected result!: ResolutionResult<T>;

    /**
     * Inicializa una resolución.
     */
    protected initialize(

        value: T

    ): void {

        this.result = createResolutionResult(

            value

        );

    }

    /**
     * Devuelve el resultado.
     */
    protected build():

        ResolutionResult<T> {

        return this.result;

    }

    /**
     * Nivel de confianza.
     */
    protected confidence(

        confidence: ResolutionConfidence

    ): void {

        this.result.confidence = confidence;

    }

    /**
     * Añade razonamiento.
     */
    protected reasoning(

        text: string

    ): void {

        if (

            this.result.reasoning.length === 0

        ) {

            this.result.reasoning = text;

            return;

        }

        this.result.reasoning +=

            "\n" + text;

    }

    /**
     * Añade una evidencia.
     */
    protected evidence(

        evidence: ResolutionEvidence

    ): void {

        this.result.evidences.push(

            evidence

        );

    }

    /**
     * Añade artículo.
     */
    protected article(

        article: ResolutionArticle

    ): void {

        this.result.articles.push(

            article

        );

    }

    /**
     * Añade regla.
     */
    protected rule(

        rule: AppliedRule

    ): void {

        this.result.appliedRules.push(

            rule

        );

    }

    /**
     * Añade Knowledge Pack.
     */
    protected knowledgePack(

        id: string

    ): void {

        if (

            !this.result.knowledgePacks.includes(id)

        ) {

            this.result.knowledgePacks.push(id);

        }

    }

    /**
     * Advertencia.
     */
    protected warning(

        text: string

    ): void {

        this.result.warnings.push(

            text

        );

    }

    /**
     * Error.
     */
    protected error(

        text: string

    ): void {

        this.result.errors.push(

            text

        );

    }

    /**
     * Alternativa.
     */
    protected alternative(

        value: T,

        reason: string

    ): void {

        this.result.alternatives.push({

            value,

            reason

        });

    }

    /**
     * ¿Existen errores?
     */
    protected hasErrors():

        boolean {

        return this.result.errors.length > 0;

    }

    /**
     * ¿Existen advertencias?
     */
    protected hasWarnings():

        boolean {

        return this.result.warnings.length > 0;

    }

    /**
     * Limpia el resultado.
     */
    protected reset(

        value: T

    ): void {

        this.initialize(

            value

        );

    }

    /**
     * Todos los motores deberán implementar
     * este método.
     */
    public abstract resolve(

        ...args: unknown[]

    ): ResolutionResult<T>;

}
