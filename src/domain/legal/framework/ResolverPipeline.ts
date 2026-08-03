/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ResolverPipeline
 * ------------------------------------------------------------
 * Pipeline de ejecución de Resolvers.
 *
 * Coordina la ejecución de todos los motores jurídicos.
 *
 * ============================================================
 */

import {

    ResolverContext,
    ResolverDecision

} from "./FrameworkTypes";

export interface Resolver<T = unknown> {

    resolve(

        context: ResolverContext

    ): ResolverDecision<T>;

}

export class ResolverPipeline {

    /**
     * Resolvers registrados.
     */
    private readonly resolvers:
        Resolver[] = [];

    /**
     * Decisiones generadas.
     */
    private readonly decisions:
        ResolverDecision[] = [];

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public add(

        resolver: Resolver

    ): this {

        this.resolvers.push(

            resolver

        );

        return this;

    }

    /**
     * Registro múltiple.
     */
    public addMany(

        resolvers: Resolver[]

    ): this {

        for (const resolver of resolvers) {

            this.add(

                resolver

            );

        }

        return this;

    }

    /**
     * =====================================================
     * EJECUCIÓN
     * =====================================================
     */

    public execute(

        context: ResolverContext

    ): ResolverDecision[] {

        this.reset();

        for (const resolver of this.resolvers) {

            const decision =

                resolver.resolve(

                    context

                );

            this.decisions.push(

                decision

            );

        }

        return [...this.decisions];

    }

    /**
     * =====================================================
     * DECISIONES
     * =====================================================
     */

    public getDecisions()

    : ReadonlyArray<ResolverDecision> {

        return this.decisions;

    }

    /**
     * Última decisión.
     */
    public last()

    : ResolverDecision | undefined {

        return this.decisions.at(-1);

    }

    /**
     * =====================================================
     * CONSULTAS
     * =====================================================
     */

    public countResolvers()

    : number {

        return this.resolvers.length;

    }

    public countDecisions()

    : number {

        return this.decisions.length;

    }

    /**
     * =====================================================
     * ¿TODAS LAS DECISIONES SON VÁLIDAS?
     * =====================================================
     */

    public allValid()

    : boolean {

        return this.decisions.every(

            decision =>

                decision.valid

        );

    }

    /**
     * =====================================================
     * ADVERTENCIAS
     * =====================================================
     */

    public warnings()

    : string[] {

        const warnings: string[] = [];

        for (const decision of this.decisions) {

            warnings.push(

                ...decision.validation.warnings

            );

        }

        return [...new Set(warnings)];

    }

    /**
     * =====================================================
     * ERRORES
     * =====================================================
     */

    public errors()

    : string[] {

        const errors: string[] = [];

        for (const decision of this.decisions) {

            errors.push(

                ...decision.validation.errors

            );

        }

        return [...new Set(errors)];

    }

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    public reset(): void {

        this.decisions.length = 0;

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            resolvers:

                this.countResolvers(),

            executed:

                this.countDecisions(),

            valid:

                this.allValid(),

            warnings:

                this.warnings().length,

            errors:

                this.errors().length

        };

    }

}
