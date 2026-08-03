/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseValidator
 * ------------------------------------------------------------
 * Clase base para todos los validadores jurídicos.
 *
 * ============================================================
 */

import {

    ValidationResult

} from "./FrameworkTypes";

export abstract class BaseValidator<TContext> {

    /**
     * Advertencias.
     */
    protected readonly warnings: string[] = [];

    /**
     * Errores.
     */
    protected readonly errors: string[] = [];

    /**
     * =====================================================
     * MÉTODO PRINCIPAL
     * =====================================================
     */

    public validate(

        context: TContext

    ): ValidationResult {

        this.reset();

        this.performValidation(

            context

        );

        return {

            valid:

                this.errors.length === 0,

            warnings:

                [...this.warnings],

            errors:

                [...this.errors]

        };

    }

    /**
     * =====================================================
     * IMPLEMENTACIÓN ESPECÍFICA
     * =====================================================
     */

    protected abstract performValidation(

        context: TContext

    ): void;

    /**
     * =====================================================
     * ADVERTENCIA
     * =====================================================
     */

    protected warning(

        message: string

    ): void {

        if (

            !this.warnings.includes(

                message

            )

        ) {

            this.warnings.push(

                message

            );

        }

    }

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    protected error(

        message: string

    ): void {

        if (

            !this.errors.includes(

                message

            )

        ) {

            this.errors.push(

                message

            );

        }

    }

    /**
     * =====================================================
     * COMPROBACIONES AUXILIARES
     * =====================================================
     */

    protected require(

        condition: boolean,

        message: string

    ): void {

        if (!condition) {

            this.error(

                message

            );

        }

    }

    protected recommend(

        condition: boolean,

        message: string

    ): void {

        if (!condition) {

            this.warning(

                message

            );

        }

    }

    protected requireNotNull(

        value: unknown,

        message: string

    ): void {

        this.require(

            value !== undefined &&

            value !== null,

            message

        );

    }

    protected requireString(

        value: unknown,

        message: string

    ): void {

        this.require(

            typeof value === "string" &&

            value.trim().length > 0,

            message

        );

    }

    protected requirePositive(

        value: number,

        message: string

    ): void {

        this.require(

            value > 0,

            message

        );

    }

    protected requirePercentage(

        value: number,

        message: string

    ): void {

        this.require(

            value >= 0 &&

            value <= 100,

            message

        );

    }

    protected requireArray(

        value: unknown[],

        message: string

    ): void {

        this.require(

            value.length > 0,

            message

        );

    }

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    public reset(): void {

        this.warnings.length = 0;

        this.errors.length = 0;

    }

    /**
     * =====================================================
     * CONSULTA
     * =====================================================
     */

    public getWarnings()

    : ReadonlyArray<string> {

        return this.warnings;

    }

    public getErrors()

    : ReadonlyArray<string> {

        return this.errors;

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            warnings:

                this.warnings.length,

            errors:

                this.errors.length

        };

    }

}
