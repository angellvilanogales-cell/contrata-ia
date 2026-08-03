/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ClassificationRule
 * ------------------------------------------------------------
 * Determina cuándo debe exigirse clasificación empresarial.
 *
 * LCSP
 *
 * Base jurídica preparada para ampliarse con los Knowledge Packs.
 *
 * ============================================================
 */

import {

    UUID

} from "../../common/types";

import {

    ContractType,

    ProcedureType

} from "../../legal/types";

import {

    SolvencyContext,

    SolvencyRequirement,

    SolvencyType,

    SolvencyLevel,

    ContractorClassification

} from "./SolvencyTypes";

export class ClassificationRule {

    /**
     * =====================================================
     * EVALUACIÓN PRINCIPAL
     * =====================================================
     */

    public evaluate(

        context: SolvencyContext

    ): SolvencyRequirement {

        if (

            !this.requiresClassification(

                context

            )

        ) {

            return this.notRequired();

        }

        return this.required(

            context

        );

    }

    /**
     * =====================================================
     * CLASIFICACIÓN
     * =====================================================
     */

    public getClassification(

        context: SolvencyContext

    ): ContractorClassification {

        if (

            !this.requiresClassification(

                context

            )

        ) {

            return {

                required:false

            };

        }

        return {

            required:true,

            group:

                this.group(

                    context

                ),

            subgroup:

                this.subgroup(

                    context

                ),

            category:

                this.category(

                    context

                )

        };

    }

    /**
     * =====================================================
     * REGLA PRINCIPAL
     * =====================================================
     */

    private requiresClassification(

        context: SolvencyContext

    ):boolean{

        /**
         * Primera implementación.
         *
         * Posteriormente se sustituirá
         * por KnowledgeRuleProvider.
         */

        if(

            context.contractType

            !==

            ContractType.WORKS

        ){

            return false;

        }

        if(

            context.procedure

            ===

            ProcedureType.MINOR

        ){

            return false;

        }

        return (

            context.estimatedValue

            >=

            500000

        );

    }

    /**
     * =====================================================
     * GRUPO
     * =====================================================
     */

    private group(

        context:SolvencyContext

    ):string{

        return "A";

    }

    /**
     * =====================================================
     * SUBGRUPO
     * =====================================================
     */

    private subgroup(

        context:SolvencyContext

    ):string{

        return "1";

    }

    /**
     * =====================================================
     * CATEGORÍA
     * =====================================================
     */

    private category(

        context:SolvencyContext

    ):string{

        if(

            context.estimatedValue

            >5000000

        ){

            return "6";

        }

        if(

            context.estimatedValue

            >2000000

        ){

            return "5";

        }

        if(

            context.estimatedValue

            >1000000

        ){

            return "4";

        }

        return "3";

    }

    /**
     * =====================================================
     * RESULTADO POSITIVO
     * =====================================================
     */

    private required(

        context:SolvencyContext

    ):SolvencyRequirement{

        const classification=

            this.getClassification(

                context

            );

        return{

            id:

                crypto.randomUUID()

                as UUID,

            type:

                SolvencyType.CLASSIFICATION,

            required:true,

            level:

                SolvencyLevel.HIGH,

            justification:

                "Debe exigirse clasificación empresarial.",

            legalReference:

                "LCSP",

            observations:[

                `Grupo ${classification.group}`,

                `Subgrupo ${classification.subgroup}`,

                `Categoría ${classification.category}`

            ]

        };

    }

    /**
     * =====================================================
     * RESULTADO NEGATIVO
     * =====================================================
     */

    private notRequired()

    :SolvencyRequirement{

        return{

            id:

                crypto.randomUUID()

                as UUID,

            type:

                SolvencyType.CLASSIFICATION,

            required:false,

            level:

                SolvencyLevel.NONE,

            justification:

                "No procede exigir clasificación empresarial.",

            legalReference:

                "LCSP"

        };

    }

}
