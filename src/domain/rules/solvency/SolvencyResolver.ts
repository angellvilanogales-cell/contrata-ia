/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyResolver
 * ------------------------------------------------------------
 * Resuelve la configuración final de solvencia del expediente.
 *
 * Este componente transforma las validaciones del
 * SolvencyValidator en una decisión consumible por
 * DecisionEngine y los generadores documentales.
 * ============================================================
 */

import {

    SolvencyContext,
    SolvencyRequirement,
    SolvencyEvaluation

} from "./SolvencyTypes";

import {

    SolvencyValidator

} from "./SolvencyValidator";

/* ============================================================
 * DECISIÓN FINAL
 * ============================================================
 */

export interface SolvencyDecision {

    valid: boolean;

    economic: boolean;

    technical: boolean;

    professional: boolean;

    insurance: boolean;

    classification: boolean;

    references: boolean;

    turnover: boolean;

    means: boolean;

    requirements: SolvencyRequirement[];

    warnings: string[];

    recommendations: string[];

}

/* ============================================================
 * RESOLVER
 * ============================================================
 */

export class SolvencyResolver {

    constructor(

        private readonly validator =

            new SolvencyValidator()

    ){}

    /**
     * =====================================================
     * RESOLUCIÓN PRINCIPAL
     * =====================================================
     */

    public resolve(

        context: SolvencyContext

    ): SolvencyDecision {

        const evaluation =

            this.validator.validate(

                context

            );

        return this.buildDecision(

            evaluation

        );

    }

    /**
     * =====================================================
     * DECISIÓN
     * =====================================================
     */

    private buildDecision(

        evaluation: SolvencyEvaluation

    ): SolvencyDecision {

        return {

            valid:

                evaluation.validation.valid,

            economic:

                this.exists(

                    evaluation,

                    "ECONOMIC"

                ),

            technical:

                this.exists(

                    evaluation,

                    "TECHNICAL"

                ),

            professional:

                this.exists(

                    evaluation,

                    "PROFESSIONAL"

                ),

            insurance:

                this.exists(

                    evaluation,

                    "INSURANCE"

                ),

            classification:

                this.exists(

                    evaluation,

                    "CLASSIFICATION"

                ),

            references:

                this.exists(

                    evaluation,

                    "REFERENCES"

                ),

            turnover:

                this.exists(

                    evaluation,

                    "TURNOVER"

                ),

            means:

                this.exists(

                    evaluation,

                    "EQUIPMENT"

                ),

            requirements:

                evaluation.report.requirements,

            warnings:

                evaluation.report.warnings,

            recommendations:

                evaluation.report.recommendations

        };

    }

    /**
     * =====================================================
     * EXISTE REQUISITO
     * =====================================================
     */

    private exists(

        evaluation: SolvencyEvaluation,

        type: string

    ): boolean {

        return evaluation

            .report

            .requirements

            .some(

                requirement =>

                    requirement.type === type &&

                    requirement.required

            );

    }

    /**
     * =====================================================
     * SOLO REQUISITOS OBLIGATORIOS
     * =====================================================
     */

    public mandatoryRequirements(

        context: SolvencyContext

    ): SolvencyRequirement[] {

        return this

            .resolve(context)

            .requirements

            .filter(

                requirement =>

                    requirement.required

            );

    }

    /**
     * =====================================================
     * RESUMEN
     * =====================================================
     */

    public summary(

        context: SolvencyContext

    ) {

        const decision =

            this.resolve(

                context

            );

        return {

            valid:

                decision.valid,

            totalRequirements:

                decision.requirements.length,

            mandatory:

                decision.requirements.filter(

                    requirement =>

                        requirement.required

                ).length,

            warnings:

                decision.warnings.length

        };

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export(

        context: SolvencyContext

    ): SolvencyDecision {

        return this.resolve(

            context

        );

    }

}
