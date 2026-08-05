/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadlineDecisionEngine
 * ------------------------------------------------------------
 * Motor completo de decisión de plazos.
 *
 * Flujo:
 *
 * DeadlineContext
 *        ↓
 * Validator
 *        ↓
 * Evaluator
 *        ↓
 * Resolver
 *        ↓
 * DeadlineResult
 *
 * ============================================================
 */

import { DeadlineContext } from "./DeadlineContext";
import { DeadlineRule } from "./DeadlineRule";
import { DeadlineResult } from "./DeadlineResult";
import { DeadlineValidator } from "./DeadlineValidator";
import { DeadlineEvaluator } from "./DeadlineEvaluator";
import { DeadlineResolver } from "./DeadlineResolver";

export class DeadlineDecisionEngine {

    constructor(

        private readonly validator = new DeadlineValidator(),

        private readonly evaluator = new DeadlineEvaluator(),

        private readonly resolver = new DeadlineResolver()

    ) {}

    /**
     * Ejecuta el motor completo.
     */
    public execute(

        context: DeadlineContext,

        rules: DeadlineRule[]

    ): DeadlineResult {

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
