/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ContractRules
 * ------------------------------------------------------------
 *
 * Familia de reglas relacionadas con:
 *
 *  • Tipo de contrato
 *  • Valor estimado
 *  • Contrato menor
 *  • Umbrales LCSP
 *
 * ============================================================
 */

import { UUID } from "../../common/types";

import {
    Rule,
    RulePriority,
    RuleCategory,
    RuleScope,
    RuleSource,
    RuleAction
} from "../RuleEngine";

import {
    LegalReasonType,
    ProcedureType
} from "../../legal/types";

export class ContractRules {

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public static register(

        engine: any

    ): void {

        engine.registerRule(

            this.contractTypeRule(engine)

        );

        engine.registerRule(

            this.estimatedValueRule(engine)

        );

        engine.registerRule(

            this.minorContractRule(engine)

        );

        engine.registerRule(

            this.thresholdRule(engine)

        );

    }

    /**
     * =====================================================
     * TIPO DE CONTRATO
     * =====================================================
     */

    private static contractTypeRule(

        engine: any

    ): Rule {

        return {

            id: crypto.randomUUID() as UUID,

            code: "CONTRACT_TYPE",

            name: "Determinación del tipo de contrato",

            description:
                "Clasifica el contrato conforme a la LCSP.",

            priority:
                RulePriority.CRITICAL,

            category:
                RuleCategory.CONTRACT,

            scope:
                RuleScope.NATIONAL,

            source:
                RuleSource.LCSP,

            action:
                RuleAction.CALCULATE,

            legalReason:
                LegalReasonType.CONTRACT_TYPE,

            condition: (context) =>

                context?.contract?.type != undefined,

            success: {

                valid: true,

                message:
                    "Tipo contractual determinado."

            },

            failure: {

                valid: false,

                message:
                    "Debe definirse el tipo contractual."

            }

        };

    }

    /**
     * =====================================================
     * VALOR ESTIMADO
     * =====================================================
     */

    private static estimatedValueRule(

        engine: any

    ): Rule {

        return {

            id: crypto.randomUUID() as UUID,

            code: "ESTIMATED_VALUE",

            name: "Valor estimado",

            description:
                "Comprueba la existencia del valor estimado.",

            priority:
                RulePriority.CRITICAL,

            category:
                RuleCategory.VALUE,

            scope:
                RuleScope.NATIONAL,

            source:
                RuleSource.LCSP,

            action:
                RuleAction.VALIDATE,

            legalReason:
                LegalReasonType.PROCEDURE,

            condition: (context) =>

                Number(

                    context?.contract?.estimatedValue ?? 0

                ) > 0,

            success: {

                valid: true,

                message:
                    "Valor estimado válido."

            },

            failure: {

                valid: false,

                message:
                    "Debe calcularse el valor estimado."

            }

        };

    }

    /**
     * =====================================================
     * CONTRATO MENOR
     * =====================================================
     */

    private static minorContractRule(

        engine: any

    ): Rule {

        return {

            id: crypto.randomUUID() as UUID,

            code: "MINOR_CONTRACT",

            name: "Contrato menor",

            description:
                "Determina si el expediente puede tramitarse como contrato menor.",

            priority:
                RulePriority.HIGH,

            category:
                RuleCategory.PROCEDURE,

            scope:
                RuleScope.NATIONAL,

            source:
                RuleSource.LCSP,

            action:
                RuleAction.RECOMMEND,

            legalReason:
                LegalReasonType.PROCEDURE,

            condition: (context) =>

                Number(

                    context?.contract?.estimatedValue ?? 0

                )

                <=

                Number(

                    engine.getVariable<number>(

                        "MINOR_THRESHOLD"

                    ) ?? 15000

                ),

            success: {

                valid: true,

                message:
                    "Procede analizar el contrato menor.",

                value:
                    ProcedureType.MINOR

            },

            failure: {

                valid: true,

                message:
                    "Debe utilizarse un procedimiento ordinario."

            }

        };

    }

    /**
     * =====================================================
     * UMBRALES
     * =====================================================
     */

    private static thresholdRule(

        engine: any

    ): Rule {

        return {

            id: crypto.randomUUID() as UUID,

            code: "LCSP_THRESHOLDS",

            name: "Control de umbrales",

            description:
                "Comprueba los umbrales económicos.",

            priority:
                RulePriority.HIGH,

            category:
                RuleCategory.VALUE,

            scope:
                RuleScope.NATIONAL,

            source:
                RuleSource.LCSP,

            action:
                RuleAction.VALIDATE,

            legalReason:
                LegalReasonType.PROCEDURE,

            condition: (context) =>

                Number(

                    context?.contract?.estimatedValue ?? 0

                ) >= 0,

            success: {

                valid: true,

                message:
                    "Umbral correctamente evaluado."

            },

            failure: {

                valid: false,

                message:
                    "No ha sido posible evaluar el umbral."

            }

        };

    }

}
