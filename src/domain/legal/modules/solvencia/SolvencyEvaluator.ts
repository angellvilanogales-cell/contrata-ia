/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyEvaluator
 * ------------------------------------------------------------
 * Evalúa todas las reglas del Motor de Solvencia.
 *
 * No toma decisiones.
 * Produce únicamente todas las decisiones candidatas.
 *
 * ============================================================
 */

import { SolvencyContext } from "./SolvencyContext";
import {
    SolvencyRule,
    SolvencyRuleResult
} from "./SolvencyRule";

export class SolvencyEvaluator {

    /**
     * =====================================================
     * Ejecutar todas las reglas.
     * =====================================================
     */
    public evaluate(

        context: SolvencyContext,

        rules: SolvencyRule[]

    ): SolvencyEvaluationResult {

        const orderedRules = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const results: SolvencyRuleResult[] = [];

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

/* ========================================================= */

export interface SolvencyEvaluationResult {

    /**
     * Resultados producidos.
     */
    results: SolvencyRuleResult[];

    /**
     * Reglas ejecutadas.
     */
    executedRules: string[];

    /**
     * Reglas descartadas.
     */
    ignoredRules: string[];

}
