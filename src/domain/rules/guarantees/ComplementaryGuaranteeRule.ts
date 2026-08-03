/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ComplementaryGuaranteeRule
 * ------------------------------------------------------------
 * Garantía complementaria.
 *
 * LCSP
 * Art. 107.2
 *
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

export class ComplementaryGuaranteeRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: GuaranteeContext

    ): GuaranteeRequirement {

        const required =

            this.requiresComplementaryGuarantee(

                context

            );

        const percentage =

            this.percentage(

                context

            );

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                GuaranteeType.COMPLEMENTARY,

            required,

            percentage,

            amount:

                required

                    ? this.calculate(

                        context.awardPrice,

                        percentage

                    )

                    : 0,

            status:

                required

                    ? GuaranteeStatus.REQUIRED

                    : GuaranteeStatus.NOT_REQUIRED,

            justification:

                this.justification(

                    context,

                    required

                ),

            legalReference:

                "LCSP art.107.2",

            acceptedMethods:[

                GuaranteeMethod.CASH,

                GuaranteeMethod.BANK_GUARANTEE,

                GuaranteeMethod.INSURANCE,

                GuaranteeMethod.PUBLIC_DEBT

            ],

            observations:

                this.observations(

                    context,

                    required

                )

        };

    }

    /**
     * =====================================================
     * REGLA
     * =====================================================
     *
     * Primera versión.
     *
     * Posteriormente esta lógica será sustituida
     * completamente por Knowledge Packs.
     */

    private requiresComplementaryGuarantee(

        context: GuaranteeContext

    ): boolean {

        if (

            context.abnormalBid

        ) {

            return true;

        }

        if (

            context.riskLevel >= 8

        ) {

            return true;

        }

        return false;

    }

    /**
     * =====================================================
     * PORCENTAJE
     * =====================================================
     */

    private percentage(

        context: GuaranteeContext

    ): number {

        if (

            context.abnormalBid

        ) {

            return 5;

        }

        if (

            context.riskLevel >= 8

        ) {

            return 3;

        }

        return 0;

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

            value *

            percentage /

            100

        );

    }

    /**
     * =====================================================
     * JUSTIFICACIÓN
     * =====================================================
     */

    private justification(

        context: GuaranteeContext,

        required:boolean

    ):string{

        if(!required){

            return "No procede garantía complementaria.";

        }

        if(

            context.abnormalBid

        ){

            return "Se propone garantía complementaria debido a oferta anormalmente baja.";

        }

        return "Se propone garantía complementaria por circunstancias de especial riesgo.";

    }

    /**
     * =====================================================
     * OBSERVACIONES
     * =====================================================
     */

    private observations(

        context:GuaranteeContext,

        required:boolean

    ):string[]{

        if(!required){

            return [];

        }

        const list:string[]=[];

        list.push(

            "Debe justificarse expresamente en el expediente."

        );

        list.push(

            "La motivación debe respetar el principio de proporcionalidad."

        );

        if(

            context.abnormalBid

        ){

            list.push(

                "Relacionada con la aceptación de una oferta anormalmente baja."

            );

        }

        if(

            context.riskLevel>=8

        ){

            list.push(

                "Derivada del nivel de riesgo del contrato."

            );

        }

        return list;

    }

    /**
     * =====================================================
     * ES REVISABLE
     * =====================================================
     */

    public reviewNeeded(

        context:GuaranteeContext

    ):boolean{

        return (

            context.abnormalBid ||

            context.riskLevel>=8

        );

    }

}
