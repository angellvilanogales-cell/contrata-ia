/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVDecisionEngine
 * ------------------------------------------------------------
 * Motor completo de clasificación CPV.
 *
 * Flujo:
 *
 * CPVContext
 *        ↓
 * Validator
 *        ↓
 * Evaluator
 *        ↓
 * Resolver
 *        ↓
 * CPVResult
 *
 * ============================================================
 */

import { CPVContext } from "./CPVContext";
import { CPVRule } from "./CPVRule";
import { CPVResult } from "./CPVResult";
import { CPVValidator } from "./CPVValidator";
import { CPVEvaluator } from "./CPVEvaluator";
import { CPVResolver } from "./CPVResolver";

export class CPVDecisionEngine {

    constructor(

        private readonly validator = new CPVValidator(),

        private readonly evaluator = new CPVEvaluator(),

        private readonly resolver = new CPVResolver()

    ) {}

    public execute(

        context: CPVContext,

        rules: CPVRule[]

    ): CPVResult {

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

            .filter(r => r.decision)

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
