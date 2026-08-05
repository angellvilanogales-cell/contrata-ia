/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeEvaluator
 * ------------------------------------------------------------
 * Evalúa todas las reglas del Motor de Garantías.
 *
 * No toma decisiones.
 * Produce únicamente las decisiones candidatas.
 *
 * ============================================================
 */

import { GuaranteeContext } from "./GuaranteeContext";
import {
    GuaranteeRule,
    GuaranteeRuleResult
} from "./GuaranteeRule";

export class GuaranteeEvaluator {

    /**
     * Ejecutar todas las reglas.
     */
    public evaluate(

        context: GuaranteeContext,

        rules: GuaranteeRule[]

    ): GuaranteeEvaluationResult {

        const ordered = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const results: GuaranteeRuleResult[] = [];

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

export interface GuaranteeEvaluationResult {

    results: GuaranteeRuleResult[];

    executedRules: string[];

    ignoredRules: string[];

}
