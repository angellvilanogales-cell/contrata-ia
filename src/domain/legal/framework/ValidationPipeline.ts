/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ValidationPipeline
 * ------------------------------------------------------------
 * Ejecuta una cadena de validadores.
 *
 * Todos los motores jurídicos utilizarán este Pipeline.
 *
 * ============================================================
 */

import {

    ValidationResult

} from "./FrameworkTypes";

import { BaseValidator } from "./BaseValidator";

export class ValidationPipeline<TContext> {

    /**
     * Validadores registrados.
     */
    private readonly validators:
        BaseValidator<TContext>[] = [];

    /**
     * Resultado acumulado.
     */
    private readonly result: ValidationResult = {

        valid: true,

        warnings: [],

        errors: []

    };

    /* ============================================================
     * REGISTRO
     * ============================================================
     */

    public add(

        validator: BaseValidator<TContext>

    ): this {

        this.validators.push(

            validator

        );

        return this;

    }

    /**
     * Registro múltiple.
     */
    public addMany(

        validators: BaseValidator<TContext>[]

    ): this {

        for (const validator of validators) {

            this.add(

                validator

            );

        }

        return this;

    }

    /* ============================================================
     * EJECUCIÓN
     * ============================================================
     */

    public execute(

        context: TContext

    ): ValidationResult {

        this.reset();

        for (const validator of this.validators) {

            const validation =

                validator.validate(

                    context

                );

            this.merge(

                validation

            );

        }

        return {

            valid:

                this.result.valid,

            warnings:

                [...this.result.warnings],

            errors:

                [...this.result.errors]

        };

    }

    /* ============================================================
     * UNIÓN
     * ============================================================
     */

    private merge(

        validation: ValidationResult

    ): void {

        if (!validation.valid) {

            this.result.valid = false;

        }

        for (const warning of validation.warnings) {

            if (

                !this.result.warnings.includes(

                    warning

                )

            ) {

                this.result.warnings.push(

                    warning

                );

            }

        }

        for (const error of validation.errors) {

            if (

                !this.result.errors.includes(

                    error

                )

            ) {

                this.result.errors.push(

                    error

                );

            }

        }

    }

    /* ============================================================
     * RESET
     * ============================================================
     */

    public reset(): void {

        this.result.valid = true;

        this.result.warnings.length = 0;

        this.result.errors.length = 0;

    }

    /* ============================================================
     * CONSULTA
     * ============================================================
     */

    public count(): number {

        return this.validators.length;

    }

    public validatorsList()

    : ReadonlyArray<BaseValidator<TContext>> {

        return this.validators;

    }

    /* ============================================================
     * DIAGNÓSTICO
     * ============================================================
     */

    public diagnostics() {

        return {

            validators:

                this.validators.length,

            warnings:

                this.result.warnings.length,

            errors:

                this.result.errors.length

        };

    }

}
