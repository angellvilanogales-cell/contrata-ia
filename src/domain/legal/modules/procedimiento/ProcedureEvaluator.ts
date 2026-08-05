/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureEvaluator
 * ------------------------------------------------------------
 * Evalúa todas las reglas del procedimiento y devuelve
 * las decisiones candidatas ordenadas por prioridad.
 *
 * No decide cuál es la correcta.
 *
 * Esa responsabilidad corresponde al ProcedureResolver.
 *
 * ============================================================
 */

import { ProcedureContext } from "./ProcedureContext";
import {
    ProcedureRule,
    ProcedureRuleResult
} from "./ProcedureRule";

export class ProcedureEvaluator {

    /**
     * =====================================================
     * Ejecutar reglas.
     * =====================================================
     */
    public evaluate(

        context: ProcedureContext,

        rules: ProcedureRule[]

    ): ProcedureEvaluationResult {

        const ordered = [...rules].sort(

            (a, b) => b.priority - a.priority

        );

        const results: ProcedureRuleResult[] = [];

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

export interface ProcedureEvaluationResult {

    /**
     * Resultados obtenidos.
     */
    results: ProcedureRuleResult[];

    /**
     * Reglas ejecutadas.
     */
    executedRules: string[];

    /**
     * Reglas descartadas.
     */
    ignoredRules: string[];

}
