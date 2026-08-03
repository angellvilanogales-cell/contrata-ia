/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyValidator
 * ------------------------------------------------------------
 * Validador global del subsistema de Solvencia.
 *
 * Coordina todas las reglas de solvencia.
 *
 * No contiene reglas.
 * Solo las ejecuta.
 *
 * ============================================================
 */

import {

    SolvencyContext,
    SolvencyEvaluation,
    SolvencyRequirement,
    SolvencyValidation,
    SolvencyReport

} from "./SolvencyTypes";

import {

    EconomicSolvencyRule

} from "./EconomicSolvencyRule";

import {

    TechnicalSolvencyRule

} from "./TechnicalSolvencyRule";

import {

    ProfessionalSolvencyRule

} from "./ProfessionalSolvencyRule";

import {

    InsuranceRule

} from "./InsuranceRule";

import {

    ClassificationRule

} from "./ClassificationRule";

import {

    MeansRule

} from "./MeansRule";

import {

    ReferencesRule

} from "./ReferencesRule";

import {

    TurnoverRule

} from "./TurnoverRule";

export class SolvencyValidator {

    private readonly economic =

        new EconomicSolvencyRule();

    private readonly technical =

        new TechnicalSolvencyRule();

    private readonly professional =

        new ProfessionalSolvencyRule();

    private readonly insurance =

        new InsuranceRule();

    private readonly classification =

        new ClassificationRule();

    private readonly means =

        new MeansRule();

    private readonly references =

        new ReferencesRule();

    private readonly turnover =

        new TurnoverRule();

    /**
     * =====================================================
     * VALIDACIÓN GLOBAL
     * =====================================================
     */

    public validate(

        context: SolvencyContext

    ): SolvencyEvaluation {

        const requirements =

            this.collectRequirements(

                context

            );

        const validation =

            this.buildValidation(

                requirements

            );

        const report =

            this.buildReport(

                requirements,

                validation

            );

        return {

            context,

            report,

            validation

        };

    }

    /**
     * =====================================================
     * REGLAS
     * =====================================================
     */

    private collectRequirements(

        context: SolvencyContext

    ): SolvencyRequirement[] {

        return [

            this.economic.evaluate(

                context

            ),

            this.technical.evaluate(

                context

            ),

            this.professional.evaluate(

                context

            ),

            this.insurance.evaluate(

                context

            ),

            this.classification.evaluate(

                context

            ),

            this.means.evaluate(

                context

            ),

            this.references.evaluate(

                context

            ),

            this.turnover.evaluate(

                context

            )

        ];

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private buildValidation(

        requirements: SolvencyRequirement[]

    ): SolvencyValidation {

        const errors:string[]=[];

        const warnings:string[]=[];

        for(

            const requirement

            of requirements

        ){

            if(

                !requirement.required

            ){

                continue;

            }

            if(

                requirement.level==="HIGH"

            ){

                warnings.push(

                    requirement.justification

                );

            }

        }

        return{

            valid:

                errors.length===0,

            errors,

            warnings

        };

    }

    /**
     * =====================================================
     * INFORME
     * =====================================================
     */

    private buildReport(

        requirements:SolvencyRequirement[],

        validation:SolvencyValidation

    ):SolvencyReport{

        return{

            generatedAt:

                new Date(),

            requirements,

            warnings:

                validation.warnings,

            recommendations:

                this.buildRecommendations(

                    requirements

                )

        };

    }

    /**
     * =====================================================
     * RECOMENDACIONES
     * =====================================================
     */

    private buildRecommendations(

        requirements:SolvencyRequirement[]

    ):string[]{

        const recommendations:string[]=[];

        for(

            const requirement

            of requirements

        ){

            if(

                !requirement.required

            ){

                continue;

            }

            recommendations.push(

                requirement.justification

            );

        }

        return recommendations;

    }

    /**
     * =====================================================
     * UTILIDADES
     * =====================================================
     */

    public summary(

        context:SolvencyContext

    ){

        const evaluation=

            this.validate(

                context

            );

        return{

            requirements:

                evaluation.report.requirements.length,

            warnings:

                evaluation.report.warnings.length,

            valid:

                evaluation.validation.valid

        };

    }

}
