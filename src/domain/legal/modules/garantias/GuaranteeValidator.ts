/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeValidator
 * ------------------------------------------------------------
 * Validador del contexto del Motor de Garantías.
 *
 * ============================================================
 */

import { GuaranteeContext } from "./GuaranteeContext";

export class GuaranteeValidator {

    /**
     * =====================================================
     * Validar contexto.
     * =====================================================
     */
    public validate(

        context: GuaranteeContext

    ): ValidationResult {

        const errors: string[] = [];
        const warnings: string[] = [];

        if (!context.tipoContrato) {

            errors.push(
                "Debe indicarse el tipo de contrato."
            );

        }

        if (!context.procedimiento) {

            errors.push(
                "Debe indicarse el procedimiento."
            );

        }

        if (context.valorEstimado == null ||
            context.valorEstimado < 0) {

            errors.push(
                "El valor estimado no es válido."
            );

        }

        if (context.presupuestoBaseLicitacion == null ||
            context.presupuestoBaseLicitacion < 0) {

            errors.push(
                "El presupuesto base de licitación no es válido."
            );

        }

        if (!context.administracion) {

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

/* ========================================================= */

export interface ValidationResult {

    valid: boolean;

    errors: string[];

    warnings: string[];

}
