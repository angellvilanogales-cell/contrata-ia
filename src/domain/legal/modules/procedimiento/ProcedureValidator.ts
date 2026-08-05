/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureValidator
 * ------------------------------------------------------------
 * Valida que el contexto contiene toda la información
 * mínima necesaria antes de ejecutar el Motor de
 * Procedimientos.
 *
 * No determina el procedimiento.
 * Únicamente valida el contexto.
 *
 * ============================================================
 */

import { ProcedureContext } from "./ProcedureContext";

export class ProcedureValidator {

    /**
     * =====================================================
     * Valida el contexto.
     * =====================================================
     */
    public validate(

        context: ProcedureContext

    ): ValidationResult {

        const errors: string[] = [];

        const warnings: string[] = [];

        if (!context.tipoContrato) {

            errors.push(

                "No se ha indicado el tipo de contrato."

            );

        }

        if (context.valorEstimado == null) {

            errors.push(

                "No existe valor estimado."

            );

        }

        if (context.presupuestoBaseLicitacion == null) {

            warnings.push(

                "No se ha indicado el presupuesto base de licitación."

            );

        }

        if (!context.organoContratacion) {

            errors.push(

                "No existe órgano de contratación."

            );

        }

        if (context.duracionMeses < 0) {

            errors.push(

                "La duración del contrato no puede ser negativa."

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
