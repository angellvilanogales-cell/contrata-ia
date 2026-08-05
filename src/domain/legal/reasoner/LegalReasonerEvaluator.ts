/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReasonerEvaluator
 * ------------------------------------------------------------
 * Evalúa todas las reglas del LegalReasoner.
 * No decide.
 * Produce únicamente las conclusiones candidatas.
 * ============================================================
 */

import { LegalReasonerContext } from "./LegalReasonerContext";
import {
    LegalReasonerRule,
    LegalReasonerRuleResult
} from "./LegalReasonerRule";

export class LegalReasonerEvaluator {

    public evaluate(

        context: LegalReasonerContext,

        rules: LegalReasonerRule[]

    ): LegalReasonerEvaluationResult {

        const orderedRules = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const results: LegalReasonerRuleResult[] = [];

        const executedRules: string[] = [];

        const ignoredRules: string[] = [];

        for (const rule of orderedRules) {

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

export interface LegalReasonerEvaluationResult {

    results: LegalReasonerRuleResult[];

    executedRules: string[];

    ignoredRules: string[];

}
