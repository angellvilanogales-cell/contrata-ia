/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadlineValidator
 * ------------------------------------------------------------
 * Validador del contexto del Motor de Plazos.
 *
 * ============================================================
 */

import { DeadlineContext } from "./DeadlineContext";

export class DeadlineValidator {

    public validate(

        context: DeadlineContext

    ): ValidationResult {

        const errors: string[] = [];

        const warnings: string[] = [];

        if (!context.tipoContrato) {

            errors.push(
                "No existe tipo de contrato."
            );

        }

        if (!context.procedimiento) {

            errors.push(
                "No existe procedimiento."
            );

        }

        if (context.valorEstimado == null) {

            errors.push(
                "No existe valor estimado."
            );

        }

        if (!context.tramitacion) {

            warnings.push(
                "No se ha indicado la tramitación."
            );

        }

        return {

            valid: errors.length === 0,

            errors,

            warnings

        };

    }

}

export interface ValidationResult {

    valid: boolean;

    errors: string[];

    warnings: string[];

}
