/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * TurnoverRule
 * ------------------------------------------------------------
 * Control del volumen anual de negocios.
 *
 * LCSP
 * Artículos 87 y concordantes.
 *
 * ============================================================
 */

import { UUID } from "../../common/types";

import {
    SolvencyContext,
    SolvencyRequirement,
    SolvencyLevel,
    SolvencyType
} from "./SolvencyTypes";

export interface TurnoverValidation {

    valid: boolean;

    requiredTurnover: number;

    declaredTurnover: number;

    deficit: number;

}

export class TurnoverRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: SolvencyContext

    ): SolvencyRequirement {

        const required =

            this.calculateRequiredTurnover(

                context

            );

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                SolvencyType.TURNOVER,

            required: true,

            level:

                this.level(

                    context

                ),

            justification:

                "Debe acreditarse volumen anual de negocios suficiente.",

            legalReference:

                "LCSP art. 87",

            observations: [

                `Volumen mínimo recomendado: ${required.toLocaleString()} €`

            ]

        };

    }

    /**
     * =====================================================
     * CÁLCULO
     * =====================================================
     */

    public calculateRequiredTurnover(

        context: SolvencyContext

    ): number {

        /**
         * Primera aproximación.
         *
         * Posteriormente este cálculo será
         * sustituido por Knowledge Packs.
         */

        return Math.round(

            context.estimatedValue * 1.5

        );

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    public validate(

        context: SolvencyContext,

        declaredTurnover: number

    ): TurnoverValidation {

        const required =

            this.calculateRequiredTurnover(

                context

            );

        const valid =

            declaredTurnover >= required;

        return {

            valid,

            requiredTurnover:

                required,

            declaredTurnover,

            deficit:

                valid

                ?0

                :required-declaredTurnover

        };

    }

    /**
     * =====================================================
     * NIVEL
     * =====================================================
     */

    private level(

        context: SolvencyContext

    ): SolvencyLevel {

        if (

            context.europeanThreshold

        ) {

            return SolvencyLevel.HIGH;

        }

        if (

            context.estimatedValue > 1000000

        ) {

            return SolvencyLevel.HIGH;

        }

        if (

            context.estimatedValue > 250000

        ) {

            return SolvencyLevel.NORMAL;

        }

        return SolvencyLevel.BASIC;

    }

    /**
     * =====================================================
     * INFORMACIÓN
     * =====================================================
     */

    public recommendation(

        context: SolvencyContext

    ): string {

        const required =

            this.calculateRequiredTurnover(

                context

            );

        return `Se recomienda exigir un volumen anual de negocios de al menos ${required.toLocaleString()} €.`;

    }

}
