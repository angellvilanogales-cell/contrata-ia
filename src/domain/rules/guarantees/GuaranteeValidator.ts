/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeValidator
 * ------------------------------------------------------------
 * Validador completo del subsistema de Garantías.
 *
 * Centraliza toda la lógica de validación antes de que el
 * DecisionEngine utilice las garantías.
 *
 * ============================================================
 */

import {

    GuaranteeRequirement,
    GuaranteeValidation,
    GuaranteeStatus,
    GuaranteeType

} from "./GuaranteeTypes";

export class GuaranteeValidator {

    /**
     * =====================================================
     * VALIDACIÓN GENERAL
     * =====================================================
     */

    public validate(

        guarantees: GuaranteeRequirement[]

    ): GuaranteeValidation {

        const warnings: string[] = [];

        const errors: string[] = [];

        for (const guarantee of guarantees) {

            this.validateGuarantee(

                guarantee,

                warnings,

                errors

            );

        }

        return {

            valid: errors.length === 0,

            warnings,

            errors

        };

    }

    /**
     * =====================================================
     * VALIDACIÓN INDIVIDUAL
     * =====================================================
     */

    private validateGuarantee(

        guarantee: GuaranteeRequirement,

        warnings: string[],

        errors: string[]

    ): void {

        if (

            guarantee.required &&

            guarantee.amount <= 0

        ) {

            errors.push(

                `${guarantee.type}: importe no válido.`

            );

        }

        if (

            guarantee.required &&

            guarantee.percentage <= 0

        ) {

            errors.push(

                `${guarantee.type}: porcentaje incorrecto.`

            );

        }

        if (

            guarantee.required &&

            guarantee.acceptedMethods.length === 0

        ) {

            errors.push(

                `${guarantee.type}: no existen medios de constitución.`

            );

        }

        if (

            guarantee.status === GuaranteeStatus.FORFEITED &&

            guarantee.required === false

        ) {

            errors.push(

                `${guarantee.type}: incoherencia en estado.`

            );

        }

        if (

            guarantee.status === GuaranteeStatus.RETURNED &&

            guarantee.required

        ) {

            warnings.push(

                `${guarantee.type}: garantía ya devuelta.`

            );

        }

        if (

            guarantee.justification.trim().length === 0

        ) {

            warnings.push(

                `${guarantee.type}: falta justificación.`

            );

        }

    }

    /**
     * =====================================================
     * EXISTE GARANTÍA DEFINITIVA
     * =====================================================
     */

    public hasDefinitive(

        guarantees: GuaranteeRequirement[]

    ): boolean {

        return guarantees.some(

            g =>

                g.type === GuaranteeType.DEFINITIVE

        );

    }

    /**
     * =====================================================
     * EXISTE GARANTÍA COMPLEMENTARIA
     * =====================================================
     */

    public hasComplementary(

        guarantees: GuaranteeRequirement[]

    ): boolean {

        return guarantees.some(

            g =>

                g.type === GuaranteeType.COMPLEMENTARY

        );

    }

    /**
     * =====================================================
     * IMPORTE TOTAL
     * =====================================================
     */

    public totalAmount(

        guarantees: GuaranteeRequirement[]

    ): number {

        return guarantees

            .filter(

                g => g.required

            )

            .reduce(

                (sum, g) =>

                    sum + g.amount,

                0

            );

    }

    /**
     * =====================================================
     * INFORME
     * =====================================================
     */

    public report(

        guarantees: GuaranteeRequirement[]

    ) {

        const validation =

            this.validate(

                guarantees

            );

        return {

            valid:

                validation.valid,

            total:

                guarantees.length,

            required:

                guarantees.filter(

                    g => g.required

                ).length,

            amount:

                this.totalAmount(

                    guarantees

                ),

            warnings:

                validation.warnings,

            errors:

                validation.errors

        };

    }

}
