/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT VALIDATOR
 *
 * Validador previo a la exportación.
 *
 ******************************************************************************/

export interface ExportValidationResult {

    valid: boolean;

    errors: string[];

    warnings: string[];

}

export class ExportValidator {

    /**************************************************************************
     *
     * Validación principal
     *
     **************************************************************************/

    public validate(

        expediente: unknown

    ): ExportValidationResult {

        const errors: string[] = [];

        const warnings: string[] = [];

        if (

            expediente === null ||

            expediente === undefined

        ) {

            errors.push(

                "No existe expediente."

            );

        }

        else {

            this.validateBasicInformation(

                expediente as Record<string, unknown>,

                errors,

                warnings

            );

        }

        return {

            valid:

                errors.length === 0,

            errors,

            warnings

        };

    }

    /**************************************************************************
     *
     * Información básica
     *
     **************************************************************************/

    private validateBasicInformation(

        expediente: Record<string, unknown>,

        errors: string[],

        warnings: string[]

    ): void {

        if (

            !expediente["id"]

        ) {

            errors.push(

                "El expediente no tiene identificador."

            );

        }

        if (

            !expediente["objeto"]

        ) {

            errors.push(

                "No existe objeto del contrato."

            );

        }

        if (

            !expediente["cpv"]

        ) {

            warnings.push(

                "El expediente no tiene código CPV."

            );

        }

        if (

            !expediente["presupuesto"]

        ) {

            warnings.push(

                "No existe presupuesto base."

            );

        }

        if (

            !expediente["procedimiento"]

        ) {

            warnings.push(

                "No se ha definido el procedimiento de contratación."

            );

        }

    }

    /**************************************************************************
     *
     * Validación rápida
     *
     **************************************************************************/

    public canExport(

        expediente: unknown

    ): boolean {

        return this.validate(

            expediente

        ).valid;

    }

}
