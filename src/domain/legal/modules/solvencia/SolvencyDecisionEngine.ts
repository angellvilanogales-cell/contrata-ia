/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyDecisionEngine
 * ------------------------------------------------------------
 * Motor completo de decisión de Solvencia.
 *
 * Flujo:
 *
 * SolvencyContext
 *        ↓
 * Validator
 *        ↓
 * Evaluator
 *        ↓
 * Resolver
 *        ↓
 * SolvencyResult
 *
 * ============================================================
 */

import { SolvencyContext } from "./SolvencyContext";
import { SolvencyRule } from "./SolvencyRule";
import { SolvencyResult } from "./SolvencyResult";
import { SolvencyValidator } from "./SolvencyValidator";
import { SolvencyEvaluator } from "./SolvencyEvaluator";
import { SolvencyResolver } from "./SolvencyResolver";

export class SolvencyDecisionEngine {

    constructor(

        private readonly validator = new SolvencyValidator(),

        private readonly evaluator = new SolvencyEvaluator(),

        private readonly resolver = new SolvencyResolver()

    ) {}

    /**
     * =====================================================
     * Ejecutar motor completo.
     * =====================================================
     */

    public execute(

        context: SolvencyContext,

        rules: SolvencyRule[]

    ): SolvencyResult {

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
