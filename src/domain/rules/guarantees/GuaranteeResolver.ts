/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeResolver
 * ------------------------------------------------------------
 * Orquestador del subsistema de Garantías.
 *
 * Este componente centraliza todas las reglas relacionadas con
 * garantías y devuelve una única decisión jurídica.
 *
 * ============================================================
 */

import {

    GuaranteeContext,
    GuaranteeDecision,
    GuaranteeRequirement,
    GuaranteeReport,
    GuaranteeValidation

} from "./GuaranteeTypes";

import { ProvisionalGuaranteeRule } from "./ProvisionalGuaranteeRule";
import { DefinitiveGuaranteeRule } from "./DefinitiveGuaranteeRule";
import { ComplementaryGuaranteeRule } from "./ComplementaryGuaranteeRule";
import { GuaranteeExemptionRule } from "./GuaranteeExemptionRule";
import { GuaranteeValidator } from "./GuaranteeValidator";

export class GuaranteeResolver {

    private readonly provisionalRule =
        new ProvisionalGuaranteeRule();

    private readonly definitiveRule =
        new DefinitiveGuaranteeRule();

    private readonly complementaryRule =
        new ComplementaryGuaranteeRule();

    private readonly exemptionRule =
        new GuaranteeExemptionRule();

    private readonly validator =
        new GuaranteeValidator();

    /**
     * =====================================================
     * RESOLUCIÓN COMPLETA
     * =====================================================
     */

    public resolve(

        context: GuaranteeContext

    ): GuaranteeDecision {

        const provisional =

            this.provisionalRule.evaluate(

                context

            );

        const definitive =

            this.definitiveRule.evaluate(

                context

            );

        const complementary =

            this.complementaryRule.evaluate(

                context

            );

        /**
         * Aplicar exención
         */

        const exemption =

            this.exemptionRule.evaluate(

                context

            );

        if (!exemption.required) {

            definitive.required = false;

            definitive.percentage = 0;

            definitive.amount = 0;

            definitive.status = exemption.status;

            definitive.justification = exemption.justification;

            definitive.observations = [

                ...definitive.observations,

                ...exemption.observations

            ];

        }

        const guarantees: GuaranteeRequirement[] = [

            provisional,

            definitive,

            complementary

        ];

        const validation =

            this.validator.validate(

                guarantees

            );

        const report =

            this.buildReport(

                guarantees,

                validation

            );

        return {

            valid:

                validation.valid,

            provisional,

            definitive,

            complementary,

            report,

            validation

        };

    }

    /**
     * =====================================================
     * INFORME
     * =====================================================
     */

    private buildReport(

        guarantees: GuaranteeRequirement[],

        validation: GuaranteeValidation

    ): GuaranteeReport {

        return {

            generatedAt:

                new Date(),

            requirements:

                guarantees,

            warnings:

                validation.warnings,

            recommendations:

                this.recommendations(

                    guarantees

                )

        };

    }

    /**
     * =====================================================
     * RECOMENDACIONES
     * =====================================================
     */

    private recommendations(

        guarantees: GuaranteeRequirement[]

    ): string[] {

        const list: string[] = [];

        for (const guarantee of guarantees) {

            if (!guarantee.required) {

                continue;

            }

            list.push(

                `${guarantee.type}: verificar constitución antes de la formalización.`

            );

        }

        return list;

    }

    /**
     * =====================================================
     * IMPORTE TOTAL
     * =====================================================
     */

    public totalAmount(

        decision: GuaranteeDecision

    ): number {

        return [

            decision.provisional,

            decision.definitive,

            decision.complementary

        ]

        .filter(

            g => g.required

        )

        .reduce(

            (sum, g) =>

                sum + g.amount,

            0

        );

    }

}
