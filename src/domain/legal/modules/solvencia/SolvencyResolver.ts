/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyResolver
 * ------------------------------------------------------------
 * Selecciona la decisión definitiva entre todas las
 * decisiones candidatas obtenidas por el evaluador.
 *
 * ============================================================
 */

import { SolvencyDecision } from "./SolvencyDecision";
import { SolvencyRuleResult } from "./SolvencyRule";

export class SolvencyResolver {

    /**
     * =====================================================
     * Resolver decisión definitiva.
     * =====================================================
     */
    public resolve(

        results: SolvencyRuleResult[]

    ): SolvencyDecision | undefined {

        if (results.length === 0) {

            return undefined;

        }

        const candidates = results

            .filter(r => r.decision !== undefined)

            .map(r => r.decision as SolvencyDecision);

        if (candidates.length === 0) {

            return undefined;

        }

        /**
         * Se ordenan por confianza.
         */
        candidates.sort(

            (a, b) =>

                b.confidence - a.confidence

        );

        return candidates[0];

    }

    /**
     * =====================================================
     * Resolver múltiples grupos.
     * =====================================================
     */
    public resolveAll(

        groups: SolvencyRuleResult[][]

    ): SolvencyDecision[] {

        const decisions: SolvencyDecision[] = [];

        for (const group of groups) {

            const decision = this.resolve(group);

            if (decision) {

                decisions.push(decision);

            }

        }

        return decisions;

    }

}
