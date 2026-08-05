/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureDecisionEngine
 * ------------------------------------------------------------
 * Motor completo de decisión del procedimiento.
 *
 * Flujo:
 *
 * ProcedureContext
 *        ↓
 * Validator
 *        ↓
 * Evaluator
 *        ↓
 * Resolver
 *        ↓
 * ProcedureResult
 *
 * ============================================================
 */

import { ProcedureContext } from "./ProcedureContext";
import { ProcedureRule } from "./ProcedureRule";
import { ProcedureResult } from "./ProcedureResult";
import { ProcedureValidator } from "./ProcedureValidator";
import { ProcedureEvaluator } from "./ProcedureEvaluator";
import { ProcedureResolver } from "./ProcedureResolver";

export class ProcedureDecisionEngine {

    constructor(

        private readonly validator = new ProcedureValidator(),

        private readonly evaluator = new ProcedureEvaluator(),

        private readonly resolver = new ProcedureResolver()

    ) {}

    /**
     * =====================================================
     * Ejecutar Motor.
     * =====================================================
     */

    public execute(

        context: ProcedureContext,

        rules: ProcedureRule[]

    ): ProcedureResult {

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
