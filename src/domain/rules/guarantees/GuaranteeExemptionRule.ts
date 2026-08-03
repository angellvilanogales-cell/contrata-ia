/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeExemptionRule
 * ------------------------------------------------------------
 * Exenciones de garantías.
 *
 * LCSP
 * Arts. 106-114
 *
 * Primera versión.
 * La decisión será sustituida posteriormente por
 * Knowledge Packs.
 * ============================================================
 */

import {

    GuaranteeContext,
    GuaranteeRequirement,
    GuaranteeType,
    GuaranteeStatus,
    GuaranteeMethod

} from "./GuaranteeTypes";

import { UUID } from "../../common/types";

export class GuaranteeExemptionRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: GuaranteeContext

    ): GuaranteeRequirement {

        const exempt =

            this.isExempt(

                context

            );

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                GuaranteeType.DEFINITIVE,

            required:

                !exempt,

            percentage:

                exempt ? 0 : 5,

            amount:

                exempt

                    ?0

                    :this.calculate(

                        context.awardPrice,

                        5

                    ),

            status:

                exempt

                    ?GuaranteeStatus.NOT_REQUIRED

                    :GuaranteeStatus.REQUIRED,

            justification:

                this.justification(

                    context,

                    exempt

                ),

            legalReference:

                "LCSP",

            acceptedMethods:[

                GuaranteeMethod.CASH,

                GuaranteeMethod.BANK_GUARANTEE,

                GuaranteeMethod.INSURANCE,

                GuaranteeMethod.PUBLIC_DEBT

            ],

            observations:

                this.observations(

                    exempt

                )

        };

    }

    /**
     * =====================================================
     * REGLA
     * =====================================================
     */

    private isExempt(

        context: GuaranteeContext

    ): boolean {

        /**
         * Primera implementación.
         *
         * Será sustituida completamente
         * por Knowledge Packs.
         */

        if (

            context.riskLevel <= 2

            &&

            !context.abnormalBid

        ) {

            return true;

        }

        return false;

    }

    /**
     * =====================================================
     * IMPORTE
     * =====================================================
     */

    private calculate(

        value:number,

        percentage:number

    ):number{

        return Math.round(

            value*

            percentage/

            100

        );

    }

    /**
     * =====================================================
     * JUSTIFICACIÓN
     * =====================================================
     */

    private justification(

        context:GuaranteeContext,

        exempt:boolean

    ):string{

        if(exempt){

            return "Procede la exención de garantía conforme a la normativa aplicable y a las circunstancias del expediente.";

        }

        return "No concurren circunstancias que permitan la exención de garantía.";

    }

    /**
     * =====================================================
     * OBSERVACIONES
     * =====================================================
     */

    private observations(

        exempt:boolean

    ):string[]{

        if(!exempt){

            return [];

        }

        return [

            "La exención debe motivarse.",

            "Debe incorporarse al expediente.",

            "No puede acordarse automáticamente.",

            "Debe respetar el principio de proporcionalidad."

        ];

    }

    /**
     * =====================================================
     * REQUIERE INFORME
     * =====================================================
     */

    public requiresReport(

        context:GuaranteeContext

    ):boolean{

        return this.isExempt(

            context

        );

    }

}
