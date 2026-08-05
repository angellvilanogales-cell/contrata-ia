/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVResolver
 * ------------------------------------------------------------
 * Selecciona el CPV definitivo entre todas las propuestas.
 * ============================================================
 */

import { CPVDecision } from "./CPVDecision";
import { CPVRuleResult } from "./CPVRule";

export class CPVResolver {

    /**
     * Obtiene la mejor decisión.
     */
    public resolve(

        results: CPVRuleResult[]

    ): CPVDecision | undefined {

        if (results.length === 0) {

            return undefined;

        }

        const candidates = results

            .filter(r => r.decision !== undefined)

            .map(r => r.decision as CPVDecision);

        if (candidates.length === 0) {

            return undefined;

        }

        candidates.sort(

            (a, b) =>

                b.score - a.score ||

                b.confidence - a.confidence

        );

        return candidates[0];

    }

    /**
     * Resuelve múltiples grupos.
     */
    public resolveAll(

        groups: CPVRuleResult[][]

    ): CPVDecision[] {

        const decisions: CPVDecision[] = [];

        for (const group of groups) {

            const decision = this.resolve(group);

            if (decision) {

                decisions.push(decision);

            }

        }

        return decisions;

    }

}
