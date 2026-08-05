/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityDecisionEngine
 * ------------------------------------------------------------
 * Motor completo de decisión de Publicidad.
 *
 * Flujo:
 *
 * PublicityContext
 *        ↓
 * Validator
 *        ↓
 * Evaluator
 *        ↓
 * Resolver
 *        ↓
 * PublicityResult
 *
 * ============================================================
 */

import { PublicityContext } from "./PublicityContext";
import { PublicityRule } from "./PublicityRule";
import { PublicityResult } from "./PublicityResult";
import { PublicityValidator } from "./PublicityValidator";
import { PublicityEvaluator } from "./PublicityEvaluator";
import { PublicityResolver } from "./PublicityResolver";

export class PublicityDecisionEngine {

    constructor(

        private readonly validator = new PublicityValidator(),

        private readonly evaluator = new PublicityEvaluator(),

        private readonly resolver = new PublicityResolver()

    ) {}

    /**
     * =====================================================
     * Ejecutar motor.
     * =====================================================
     */

    public execute(

        context: PublicityContext,

        rules: PublicityRule[]

    ): PublicityResult {

        const validation =

            this.validator.validate(context);

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

        const evaluation =

            this.evaluator.evaluate(

                context,

                rules

            );

        const selected =

            this.resolver.resolve(

                evaluation.results

            );

        const candidates =

            evaluation.results

                .filter(

                    r => r.decision !== undefined

                )

                .map(

                    r => r.decision!

                );

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
