/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityEvaluator
 * ------------------------------------------------------------
 * Evalúa todas las reglas del Motor de Publicidad.
 *
 * No decide.
 *
 * Produce únicamente todas las decisiones candidatas.
 *
 * ============================================================
 */

import { PublicityContext } from "./PublicityContext";
import {
    PublicityRule,
    PublicityRuleResult
} from "./PublicityRule";

export class PublicityEvaluator {

    /**
     * =====================================================
     * Ejecutar reglas.
     * =====================================================
     */

    public evaluate(

        context: PublicityContext,

        rules: PublicityRule[]

    ): PublicityEvaluationResult {

        const ordered = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const results: PublicityRuleResult[] = [];

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

/* ========================================================= */

export interface PublicityEvaluationResult {

    /**
     * Resultados obtenidos.
     */

    results: PublicityRuleResult[];

    /**
     * Reglas ejecutadas.
     */

    executedRules: string[];

    /**
     * Reglas descartadas.
     */

    ignoredRules: string[];

}
