/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityValidator
 * ------------------------------------------------------------
 * Valida que el contexto contiene la información mínima
 * necesaria para determinar correctamente las obligaciones
 * de publicidad.
 *
 * ============================================================
 */

import { PublicityContext } from "./PublicityContext";

export class PublicityValidator {

    /**
     * =====================================================
     * Validar contexto.
     * =====================================================
     */
    public validate(

        context: PublicityContext

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

        if (!context.procedimiento) {

            errors.push(

                "No se ha determinado el procedimiento de adjudicación."

            );

        }

        if (!context.administracion) {

            errors.push(

                "No existe administración contratante."

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
