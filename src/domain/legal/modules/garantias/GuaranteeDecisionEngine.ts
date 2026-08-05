/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeDecisionEngine
 * ------------------------------------------------------------
 * Motor completo de decisión de Garantías.
 *
 * Flujo:
 *
 * GuaranteeContext
 *        ↓
 * Validator
 *        ↓
 * Evaluator
 *        ↓
 * Resolver
 *        ↓
 * GuaranteeResult
 *
 * ============================================================
 */

import { GuaranteeContext } from "./GuaranteeContext";
import { GuaranteeRule } from "./GuaranteeRule";
import { GuaranteeResult } from "./GuaranteeResult";
import { GuaranteeValidator } from "./GuaranteeValidator";
import { GuaranteeEvaluator } from "./GuaranteeEvaluator";
import { GuaranteeResolver } from "./GuaranteeResolver";

export class GuaranteeDecisionEngine {

    constructor(

        private readonly validator = new GuaranteeValidator(),

        private readonly evaluator = new GuaranteeEvaluator(),

        private readonly resolver = new GuaranteeResolver()

    ) {}

    /**
     * Ejecutar motor completo.
     */
    public execute(

        context: GuaranteeContext,

        rules: GuaranteeRule[]

    ): GuaranteeResult {

        const validation = this.validator.validate(context);

        if (!validation.valid) {

            return {

                success: false,

                selected: undefined,

                candidates: [],

                conflicts: [],

                warnings: validation.warnings,

                errors: validation.errors

            };

        }

        const evaluation = this.evaluator.evaluate(

            context,

            rules

        );

        const selected = this.resolver.resolve(

            evaluation.results

        );

        const candidates = evaluation.results

            .filter(r => r.decision !== undefined)

            .map(r => r.decision!);

        return {

            success: selected !== undefined,

            selected,

            candidates,

            conflicts: [],

            warnings: validation.warnings,

            errors: validation.errors

        };

    }

}
