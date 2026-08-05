/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyValidator
 * ------------------------------------------------------------
 * Validador del contexto del Motor de Solvencia.
 *
 * Comprueba que existe toda la información necesaria antes
 * de ejecutar las reglas jurídicas.
 *
 * ============================================================
 */

import { SolvencyContext } from "./SolvencyContext";

export class SolvencyValidator {

    /**
     * =====================================================
     * Validación del contexto.
     * =====================================================
     */
    public validate(

        context: SolvencyContext

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
                "Debe indicarse el procedimiento de adjudicación."
            );

        }

        if (context.valorEstimado == null || context.valorEstimado < 0) {

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

        if (context.duracionMeses <= 0) {

            warnings.push(
                "No se ha indicado una duración válida del contrato."
            );

        }

        if (!context.cpvPrincipal) {

            warnings.push(
                "No se ha indicado el CPV principal."
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
