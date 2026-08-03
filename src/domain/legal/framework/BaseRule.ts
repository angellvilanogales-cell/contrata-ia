/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseRule
 * ------------------------------------------------------------
 * Clase base para todas las reglas jurídicas.
 *
 * Todas las reglas del sistema deberán heredar de esta clase.
 *
 * ============================================================
 */

import { UUID } from "../../common/types";

import {

    ResolverContext,
    RuleResult,
    RuleExecution

} from "./FrameworkTypes";

export abstract class BaseRule {

    /**
     * =====================================================
     * IDENTIFICACIÓN
     * =====================================================
     */

    public readonly id: UUID;

    public readonly code: string;

    public readonly name: string;

    public readonly description: string;

    /**
     * =====================================================
     * CONSTRUCTOR
     * =====================================================
     */

    constructor(

        code: string,

        name: string,

        description: string

    ) {

        this.id = crypto.randomUUID() as UUID;

        this.code = code;

        this.name = name;

        this.description = description;

    }

    /**
     * =====================================================
     * CONDICIÓN
     * =====================================================
     */

    protected abstract condition(

        context: ResolverContext,

        variables: Map<string, unknown>

    ): boolean;

    /**
     * =====================================================
     * ÉXITO
     * =====================================================
     */

    protected abstract success(

        context: ResolverContext

    ): RuleResult;

    /**
     * =====================================================
     * FALLO
     * =====================================================
     */

    protected abstract failure(

        context: ResolverContext

    ): RuleResult;

    /**
     * =====================================================
     * EJECUCIÓN
     * =====================================================
     */

    public execute(

        context: ResolverContext,

        variables: Map<string, unknown>

    ): RuleExecution {

        const started = performance.now();

        let result: RuleResult;

        let executed = false;

        try {

            executed = this.condition(

                context,

                variables

            );

            result = executed

                ? this.success(context)

                : this.failure(context);

        }

        catch (error) {

            result = {

                valid: false,

                message:

                    error instanceof Error

                        ? error.message

                        : "Rule execution error.",

                errors: [

                    "Unexpected exception."

                ]

            };

        }

        return {

            id: crypto.randomUUID() as UUID,

            code: this.code,

            name: this.name,

            executed,

            executionTime:

                performance.now() - started,

            result

        };

    }

    /**
     * =====================================================
     * METADATOS
     * =====================================================
     */

    public metadata() {

        return {

            id: this.id,

            code: this.code,

            name: this.name,

            description: this.description

        };

    }

}
