/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeCalculationRule
 * ------------------------------------------------------------
 * Cálculo automático de garantías.
 *
 * Preparado para sustituir porcentajes fijos por reglas
 * obtenidas desde los Knowledge Packs.
 *
 * ============================================================
 */

import {

    GuaranteeContext,
    GuaranteeConfiguration,
    GuaranteeRequirement,
    GuaranteeMethod,
    GuaranteeStatus,
    GuaranteeType

} from "./GuaranteeTypes";

import { UUID } from "../../common/types";

export class GuaranteeCalculationRule {

    /**
     * Configuración inicial.
     * Será sustituida posteriormente por KnowledgeProvider.
     */

    private readonly configuration: GuaranteeConfiguration = {

        provisionalPercentage: 0,

        definitivePercentage: 5,

        complementaryPercentage: 5,

        abnormalBidPercentage: 5

    };

    /* =====================================================
     * GARANTÍA PROVISIONAL
     * ===================================================== */

    public provisional(

        context: GuaranteeContext

    ): GuaranteeRequirement {

        const percentage =

            this.configuration.provisionalPercentage;

        return this.build(

            GuaranteeType.PROVISIONAL,

            percentage,

            context.estimatedValue,

            percentage > 0,

            "Garantía provisional."

        );

    }

    /* =====================================================
     * GARANTÍA DEFINITIVA
     * ===================================================== */

    public definitive(

        context: GuaranteeContext

    ): GuaranteeRequirement {

        const percentage =

            this.configuration.definitivePercentage;

        return this.build(

            GuaranteeType.DEFINITIVE,

            percentage,

            context.awardPrice,

            true,

            "Garantía definitiva."

        );

    }

    /* =====================================================
     * GARANTÍA COMPLEMENTARIA
     * ===================================================== */

    public complementary(

        context: GuaranteeContext

    ): GuaranteeRequirement {

        let percentage = 0;

        if (

            context.abnormalBid

        ) {

            percentage =

                this.configuration.abnormalBidPercentage;

        }

        if (

            context.riskLevel >= 8

        ) {

            percentage =

                Math.max(

                    percentage,

                    this.configuration.complementaryPercentage

                );

        }

        return this.build(

            GuaranteeType.COMPLEMENTARY,

            percentage,

            context.awardPrice,

            percentage > 0,

            "Garantía complementaria."

        );

    }

    /* =====================================================
     * CÁLCULO
     * ===================================================== */

    public calculate(

        base: number,

        percentage: number

    ): number {

        return Math.round(

            base *

            (percentage / 100)

        );

    }

    /* =====================================================
     * CONSTRUCTOR
     * ===================================================== */

    private build(

        type: GuaranteeType,

        percentage: number,

        base: number,

        required: boolean,

        justification: string

    ): GuaranteeRequirement {

        return {

            id:

                crypto.randomUUID() as UUID,

            type,

            required,

            percentage,

            amount:

                this.calculate(

                    base,

                    percentage

                ),

            status:

                required

                ? GuaranteeStatus.REQUIRED

                : GuaranteeStatus.NOT_REQUIRED,

            justification,

            legalReference:

                "LCSP",

            acceptedMethods: [

                GuaranteeMethod.CASH,

                GuaranteeMethod.BANK_GUARANTEE,

                GuaranteeMethod.INSURANCE,

                GuaranteeMethod.PUBLIC_DEBT

            ],

            observations: []

        };

    }

    /* =====================================================
     * CONFIGURACIÓN FUTURA
     * ===================================================== */

    public updateConfiguration(

        configuration: Partial<GuaranteeConfiguration>

    ): void {

        Object.assign(

            this.configuration,

            configuration

        );

    }

    public getConfiguration(): GuaranteeConfiguration {

        return {

            ...this.configuration

        };

    }

}
