/**
 * ============================================================
 * CONTRATA-IA
 * LegalReasonerEngine
 * ============================================================
 */

import { LegalReasonerContext } from "./LegalReasonerContext";
import { LegalReasonerRule } from "./LegalReasonerRule";
import { LegalReasonerEvaluator } from "./LegalReasonerEvaluator";
import { LegalReasonerResolver } from "./LegalReasonerResolver";
import { LegalReasonerResult } from "./LegalReasonerResult";

export class LegalReasonerEngine {

    constructor(

        private evaluator = new LegalReasonerEvaluator(),

        private resolver = new LegalReasonerResolver()

    ) {}

    execute(

        context: LegalReasonerContext,

        rules: LegalReasonerRule[]

    ): LegalReasonerResult {

        const evaluation =

            this.evaluator.evaluate(

                context,

                rules

            );

        const selected =

            this.resolver.resolve(

                evaluation.results

            );

        return {

            success: selected !== undefined,

            selected,

            candidates:

                evaluation.results

                    .filter(r => r.decision)

                    .map(r => r.decision!),

            conflicts: [],

            warnings: [],

            errors: []

        };

    }

}
