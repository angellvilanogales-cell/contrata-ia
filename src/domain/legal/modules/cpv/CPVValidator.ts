/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVValidator
 * ------------------------------------------------------------
 * Validador del contexto del Motor CPV.
 * ============================================================
 */

import { CPVContext } from "./CPVContext";

export class CPVValidator {

    public validate(

        context: CPVContext

    ): ValidationResult {

        const errors: string[] = [];
        const warnings: string[] = [];

        if (!context.objetoContrato?.trim()) {

            errors.push(
                "Debe indicarse el objeto del contrato."
            );

        }

        if (!context.tipoContrato?.trim()) {

            errors.push(
                "Debe indicarse el tipo de contrato."
            );

        }

        if (context.valorEstimado == null || context.valorEstimado < 0) {

            errors.push(
                "El valor estimado no es válido."
            );

        }

        if (!context.descripcion?.trim()) {

            warnings.push(
                "No existe descripción funcional del contrato."
            );

        }

        if (!context.administracion?.trim()) {

            warnings.push(
                "No se ha indicado la Administración contratante."
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
