/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * InsuranceRule
 * ------------------------------------------------------------
 * Determina la necesidad de exigir un seguro de responsabilidad
 * civil o profesional conforme a la LCSP.
 * ============================================================
 */

import {
    SolvencyContext,
    SolvencyRequirement,
    SolvencyType,
    SolvencyLevel
} from "./SolvencyTypes";

import { UUID } from "../../common/types";
import {
    ContractType,
    ProcedureType
} from "../../legal/types";

export class InsuranceRule {

    /**
     * =====================================================
     * EVALUACIÓN
     * =====================================================
     */

    public evaluate(

        context: SolvencyContext

    ): SolvencyRequirement {

        if (this.requiresInsurance(context)) {

            return this.required(context);

        }

        return this.notRequired();

    }

    /**
     * =====================================================
     * DETERMINA SI PROCEDE
     * =====================================================
     */

    private requiresInsurance(

        context: SolvencyContext

    ): boolean {

        if (

            context.procedure === ProcedureType.MINOR

        ) {

            return false;

        }

        if (

            context.contractType === ContractType.SERVICES

        ) {

            return true;

        }

        if (

            context.europeanThreshold

        ) {

            return true;

        }

        if (

            context.estimatedValue > 500000

        ) {

            return true;

        }

        return false;

    }

    /**
     * =====================================================
     * RESULTADO POSITIVO
     * =====================================================
     */

    private required(

        context: SolvencyContext

    ): SolvencyRequirement {

        const observations: string[] = [];

        if (

            context.contractType === ContractType.SERVICES

        ) {

            observations.push(

                "Valorar seguro de responsabilidad profesional."

            );

        }

        if (

            context.europeanThreshold

        ) {

            observations.push(

                "Comprobar cobertura suficiente para contratos SARA."

            );

        }

        if (

            context.estimatedValue > 500000

        ) {

            observations.push(

                "Importe asegurado proporcional al riesgo del contrato."

            );

        }

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                SolvencyType.INSURANCE,

            required:

                true,

            level:

                SolvencyLevel.NORMAL,

            justification:

                "Procede exigir seguro de responsabilidad.",

            legalReference:

                "LCSP",

            observations

        };

    }

    /**
     * =====================================================
     * RESULTADO NEGATIVO
     * =====================================================
     */

    private notRequired()

    : SolvencyRequirement {

        return {

            id:

                crypto.randomUUID() as UUID,

            type:

                SolvencyType.INSURANCE,

            required:

                false,

            level:

                SolvencyLevel.NONE,

            justification:

                "No procede exigir seguro específico.",

            legalReference:

                "LCSP"

        };

    }

    /**
     * =====================================================
     * IMPORTE RECOMENDADO
     * =====================================================
     */

    public recommendedCoverage(

        estimatedValue:number

    ):number{

        if(estimatedValue<=50000){

            return 50000;

        }

        if(estimatedValue<=250000){

            return 250000;

        }

        if(estimatedValue<=1000000){

            return 1000000;

        }

        return estimatedValue;

    }

}
