/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadlineEvaluator
 * ------------------------------------------------------------
 * Evalúa todas las reglas del Motor de Plazos.
 *
 * No decide.
 * Produce únicamente las decisiones candidatas.
 *
 * ============================================================
 */

import { DeadlineContext } from "./DeadlineContext";
import {
    DeadlineRule,
    DeadlineRuleResult
} from "./DeadlineRule";

export class DeadlineEvaluator {

    public evaluate(

        context: DeadlineContext,

        rules: DeadlineRule[]

    ): DeadlineEvaluationResult {

        const ordered = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const results: DeadlineRuleResult[] = [];

        const executedRules: string[] = [];

        const ignoredRules: string[] = [];

        for (const rule of ordered) {

            if (!rule.isApplicable(context)) {

                ignoredRules.push(rule.id);

                continue;

            }

            executedRules.push(rule.id);

            const result = rule.evaluate(context);

            if (result.applied) {

                results.push(result);

            }

        }

        return {

            results,

            executedRules,

            ignoredRules

        };

    }

}

export interface DeadlineEvaluationResult {

    results: DeadlineRuleResult[];

    executedRules: string[];

    ignoredRules: string[];

}
