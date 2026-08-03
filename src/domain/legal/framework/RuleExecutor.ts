/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * RuleExecutor
 * ------------------------------------------------------------
 * Ejecuta reglas registradas dentro del Framework Jurídico.
 *
 * Sustituye la lógica de ejecución distribuida del RuleEngine.
 *
 * ============================================================
 */

import {

    ResolverContext,
    RuleExecution

} from "./FrameworkTypes";

import { BaseRule } from "./BaseRule";

import { RuleRegistry } from "./RuleRegistry";

export class RuleExecutor {

    /**
     * Historial de ejecución.
     */
    private readonly executions: RuleExecution[] = [];

    /**
     * Variables compartidas.
     */
    private readonly variables =
        new Map<string, unknown>();

    constructor(

        private readonly registry: RuleRegistry

    ) {}

    /* ============================================================
     * VARIABLES
     * ============================================================
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

    /* ============================================================
     * EJECUTA UNA REGLA
     * ============================================================
     */

    public execute(

        code: string,

        context: ResolverContext

    ): RuleExecution | undefined {

        const rule =

            this.registry.get(

                code

            );

        if (!rule) {

            return undefined;

        }

        const execution =

            rule.execute(

                context,

                this.variables

            );

        this.executions.push(

            execution

        );

        return execution;

    }

    /* ============================================================
     * EJECUTA TODAS
     * ============================================================
     */

    public executeAll(

        context: ResolverContext

    ): RuleExecution[] {

        this.executions.length = 0;

        for (const rule of this.registry.all()) {

            this.executions.push(

                rule.execute(

                    context,

                    this.variables

                )

            );

        }

        return [...this.executions];

    }

    /* ============================================================
     * EJECUTA UN CONJUNTO
     * ============================================================
     */

    public executeRules(

        rules: BaseRule[],

        context: ResolverContext

    ): RuleExecution[] {

        this.executions.length = 0;

        for (const rule of rules) {

            this.executions.push(

                rule.execute(

                    context,

                    this.variables

                )

            );

        }

        return [...this.executions];

    }

    /* ============================================================
     * HISTORIAL
     * ============================================================
     */

    public history()

    : ReadonlyArray<RuleExecution> {

        return this.executions;

    }

    /* ============================================================
     * ÚLTIMA
     * ============================================================
     */

    public last()

    : RuleExecution | undefined {

        return this.executions.at(-1);

    }

    /* ============================================================
     * REGLAS EJECUTADAS
     * ============================================================
     */

    public count()

    : number {

        return this.executions.length;

    }

    /* ============================================================
     * RESET
     * ============================================================
     */

    public reset(): void {

        this.executions.length = 0;

        this.variables.clear();

    }

    /* ============================================================
     * DIAGNÓSTICO
     * ============================================================
     */

    public diagnostics() {

        return {

            executedRules:

                this.executions.length,

            variables:

                this.variables.size,

            registry:

                this.registry.count()

        };

    }

}
