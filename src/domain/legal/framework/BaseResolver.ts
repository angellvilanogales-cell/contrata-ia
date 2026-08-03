/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseResolver
 * ------------------------------------------------------------
 * Clase base para todos los motores jurídicos.
 *
 * Todos los Resolvers heredarán de esta clase.
 *
 * ============================================================
 */

import {

    ResolverContext,
    ResolverDecision,
    RuleExecution,
    ValidationResult

} from "./FrameworkTypes";

import { BaseRule } from "./BaseRule";

export abstract class BaseResolver<TDecision>
{

    /**
     * Reglas registradas.
     */
    protected readonly rules: BaseRule[] = [];

    /**
     * Variables compartidas.
     */
    protected readonly variables =
        new Map<string, unknown>();

    /**
     * Ejecuciones realizadas.
     */
    protected readonly executions: RuleExecution[] = [];

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    protected register(

        rule: BaseRule

    ): void {

        this.rules.push(rule);

    }

    /**
     * =====================================================
     * VARIABLES
     * =====================================================
     */

    public setVariable(

        key: string,

        value: unknown

    ): void {

        this.variables.set(

            key,

            value

        );

    }

    public getVariable<T>(

        key: string

    ): T | undefined {

        return this.variables.get(

            key

        ) as T;

    }

    /**
     * =====================================================
     * RESOLVER
     * =====================================================
     */

    public resolve(

        context: ResolverContext

    ): ResolverDecision<TDecision> {

        this.executions.length = 0;

        const started = performance.now();

        for (const rule of this.rules) {

            this.executions.push(

                rule.execute(

                    context,

                    this.variables

                )

            );

        }

        const decision =
            this.buildDecision(

                context

            );

        decision.statistics = {

            totalRules:

                this.rules.length,

            executedRules:

                this.executions.length,

            executionTime:

                performance.now() - started

        };

        decision.validation =
            this.validation();

        decision.valid =
            decision.validation.valid;

        return decision;

    }

    /**
     * =====================================================
     * CONSTRUIR DECISIÓN
     * =====================================================
     */

    protected abstract buildDecision(

        context: ResolverContext

    ): ResolverDecision<TDecision>;

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    protected validation()

    : ValidationResult {

        const warnings: string[] = [];

        const errors: string[] = [];

        for (const execution of this.executions) {

            if (

                execution.result.warnings

            ) {

                warnings.push(

                    ...execution.result.warnings

                );

            }

            if (

                execution.result.errors

            ) {

                errors.push(

                    ...execution.result.errors

                );

            }

        }

        return {

            valid: errors.length === 0,

            warnings,

            errors

        };

    }

    /**
     * =====================================================
     * CONSULTA
     * =====================================================
     */

    public getExecutions()

    : ReadonlyArray<RuleExecution> {

        return this.executions;

    }

    public getRules()

    : ReadonlyArray<BaseRule> {

        return this.rules;

    }

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    public reset(): void {

        this.executions.length = 0;

        this.variables.clear();

    }

}
