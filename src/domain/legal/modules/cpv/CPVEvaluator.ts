/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVEvaluator
 * ------------------------------------------------------------
 * Evalúa todas las reglas del Motor CPV.
 *
 * Produce todas las propuestas candidatas de códigos CPV.
 * ============================================================
 */

import { CPVContext } from "./CPVContext";
import {
    CPVRule,
    CPVRuleResult
} from "./CPVRule";

export class CPVEvaluator {

    /**
     * Ejecuta todas las reglas aplicables.
     */
    public evaluate(

        context: CPVContext,

        rules: CPVRule[]

    ): CPVEvaluationResult {

        const orderedRules = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const results: CPVRuleResult[] = [];

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

export interface CPVEvaluationResult {

    results: CPVRuleResult[];

    executedRules: string[];

    ignoredRules: string[];

}
