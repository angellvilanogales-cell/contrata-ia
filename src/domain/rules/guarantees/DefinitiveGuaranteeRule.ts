/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DefinitiveGuaranteeRule
 * ------------------------------------------------------------
 * Determina la garantía definitiva.
 *
 * LCSP
 * Arts. 107–111
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

export class DefinitiveGuaranteeRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: GuaranteeContext

    ): GuaranteeRequirement {

        const percentage =

            this.percentage(context);

        const required =

            this.required(context);

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                GuaranteeType.DEFINITIVE,

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

                "LCSP arts.107–111",

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
     * ¿ES OBLIGATORIA?
     * =====================================================
     */

    private required(

        context: GuaranteeContext

    ): boolean {

        /**
         * Primera versión.
         *
         * Posteriormente será sustituida por
         * Knowledge Packs.
         */

        return true;

    }

    /**
     * =====================================================
     * PORCENTAJE
     * =====================================================
     */

    private percentage(

        context: GuaranteeContext

    ): number {

        return 5;

    }

    /**
     * =====================================================
     * IMPORTE
     * =====================================================
     */

    private calculate(

        base:number,

        percentage:number

    ):number{

        return Math.round(

            base *

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

    ): string {

        if(!required){

            return "No procede garantía definitiva.";

        }

        return "Procede garantía definitiva conforme a la LCSP.";

    }

    /**
     * =====================================================
     * OBSERVACIONES
     * =====================================================
     */

    private observations(

        context: GuaranteeContext,

        required:boolean

    ): string[] {

        if(!required){

            return [];

        }

        return [

            "Debe constituirse antes de la formalización.",

            "Puede constituirse mediante cualquiera de las modalidades legalmente admitidas.",

            "Responde del correcto cumplimiento del contrato.",

            "Será devuelta tras la correcta ejecución."

        ];

    }

    /**
     * =====================================================
     * DEVOLUCIÓN
     * =====================================================
     */

    public returnAllowed(

        contractFinished:boolean,

        pendingResponsibilities:boolean

    ):boolean{

        return (

            contractFinished &&

            !pendingResponsibilities

        );

    }

    /**
     * =====================================================
     * INCAUTACIÓN
     * =====================================================
     */

    public forfeitureAllowed(

        seriousBreach:boolean

    ):boolean{

        return seriousBreach;

    }

}
