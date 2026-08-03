/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * RuleRegistry
 * ------------------------------------------------------------
 * Registro centralizado de reglas jurídicas.
 *
 * Todos los motores consultarán este registro.
 *
 * ============================================================
 */

import { BaseRule } from "./BaseRule";

export class RuleRegistry {

    /**
     * Reglas registradas.
     */
    private readonly rules =
        new Map<string, BaseRule>();

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public register(

        rule: BaseRule

    ): void {

        if (

            this.rules.has(

                rule.code

            )

        ) {

            throw new Error(

                `La regla '${rule.code}' ya está registrada.`

            );

        }

        this.rules.set(

            rule.code,

            rule

        );

    }

    /**
     * =====================================================
     * REGISTRO MÚLTIPLE
     * =====================================================
     */

    public registerMany(

        rules: BaseRule[]

    ): void {

        for (const rule of rules) {

            this.register(

                rule

            );

        }

    }

    /**
     * =====================================================
     * ELIMINAR
     * =====================================================
     */

    public unregister(

        code: string

    ): boolean {

        return this.rules.delete(

            code

        );

    }

    /**
     * =====================================================
     * OBTENER
     * =====================================================
     */

    public get(

        code: string

    ): BaseRule | undefined {

        return this.rules.get(

            code

        );

    }

    /**
     * =====================================================
     * EXISTE
     * =====================================================
     */

    public has(

        code: string

    ): boolean {

        return this.rules.has(

            code

        );

    }

    /**
     * =====================================================
     * TODAS
     * =====================================================
     */

    public all()

    : BaseRule[] {

        return Array.from(

            this.rules.values()

        );

    }

    /**
     * =====================================================
     * CÓDIGOS
     * =====================================================
     */

    public codes()

    : string[] {

        return Array.from(

            this.rules.keys()

        );

    }

    /**
     * =====================================================
     * TOTAL
     * =====================================================
     */

    public count()

    : number {

        return this.rules.size;

    }

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    public clear(): void {

        this.rules.clear();

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export() {

        return this.all().map(

            rule =>

                rule.metadata()

        );

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            totalRules:

                this.count(),

            registeredCodes:

                this.codes()

        };

    }

}
