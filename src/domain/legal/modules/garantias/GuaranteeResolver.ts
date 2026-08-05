/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeResolver
 * ------------------------------------------------------------
 * Selecciona la decisión definitiva entre todas las
 * decisiones candidatas.
 *
 * ============================================================
 */

import { GuaranteeDecision } from "./GuaranteeDecision";
import { GuaranteeRuleResult } from "./GuaranteeRule";

export class GuaranteeResolver {

    /**
     * Resolver decisión definitiva.
     */
    public resolve(

        results: GuaranteeRuleResult[]

    ): GuaranteeDecision | undefined {

        if (results.length === 0) {

            return undefined;

        }

        const candidates = results

            .filter(r => r.decision !== undefined)

            .map(r => r.decision as GuaranteeDecision);

        if (candidates.length === 0) {

            return undefined;

        }

        candidates.sort(

            (a, b) =>

                b.confidence - a.confidence

        );

        return candidates[0];

    }

    /**
     * Resolver varios grupos.
     */
    public resolveAll(

        groups: GuaranteeRuleResult[][]

    ): GuaranteeDecision[] {

        const decisions: GuaranteeDecision[] = [];

        for (const group of groups) {

            const decision = this.resolve(group);

            if (decision) {

                decisions.push(decision);

            }

        }

        return decisions;

    }

}
