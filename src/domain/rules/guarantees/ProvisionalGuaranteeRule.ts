/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProvisionalGuaranteeRule
 * ------------------------------------------------------------
 * Determina si procede exigir garantía provisional.
 *
 * LCSP
 * Art. 106
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

export class ProvisionalGuaranteeRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: GuaranteeContext

    ): GuaranteeRequirement {

        const required =

            this.requiresProvisionalGuarantee(

                context

            );

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                GuaranteeType.PROVISIONAL,

            required,

            percentage:

                required

                ?3

                :0,

            amount:

                required

                ?this.calculate(

                    context.estimatedValue,

                    3

                )

                :0,

            status:

                required

                ?GuaranteeStatus.REQUIRED

                :GuaranteeStatus.NOT_REQUIRED,

            justification:

                required

                ?this.justification(context)

                :"No procede exigir garantía provisional.",

            legalReference:

                "LCSP art.106",

            acceptedMethods:[

                GuaranteeMethod.CASH,

                GuaranteeMethod.BANK_GUARANTEE,

                GuaranteeMethod.INSURANCE,

                GuaranteeMethod.PUBLIC_DEBT

            ],

            observations:

                required

                ?this.observations()

                :[]

        };

    }

    /**
     * =====================================================
     * REGLA
     * =====================================================
     *
     * Primera implementación.
     *
     * En la siguiente versión la decisión
     * procederá de los Knowledge Packs.
     */

    private requiresProvisionalGuarantee(

        context: GuaranteeContext

    ): boolean {

        if (

            context.europeanThreshold

        ) {

            return true;

        }

        if (

            context.riskLevel >= 9

        ) {

            return true;

        }

        return false;

    }

    /**
     * =====================================================
     * JUSTIFICACIÓN
     * =====================================================
     */

    private justification(

        context: GuaranteeContext

    ): string {

        if (

            context.europeanThreshold

        ) {

            return "Procede valorar la exigencia de garantía provisional por la especial relevancia del contrato.";

        }

        return "Procede valorar garantía provisional debido al elevado riesgo del expediente.";

    }

    /**
     * =====================================================
     * OBSERVACIONES
     * =====================================================
     */

    private observations(): string[] {

        return [

            "Debe justificarse expresamente en el expediente.",

            "Tiene carácter excepcional.",

            "Debe respetarse el principio de proporcionalidad.",

            "No puede imponerse de forma automática."

        ];

    }

    /**
     * =====================================================
     * CÁLCULO
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

}
