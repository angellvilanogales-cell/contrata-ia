/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadlineResolver
 * ------------------------------------------------------------
 * Selecciona la decisión definitiva entre todas las
 * decisiones candidatas obtenidas por el evaluador.
 *
 * ============================================================
 */

import { DeadlineDecision } from "./DeadlineDecision";
import { DeadlineRuleResult } from "./DeadlineRule";

export class DeadlineResolver {

    public resolve(

        results: DeadlineRuleResult[]

    ): DeadlineDecision | undefined {

        if (results.length === 0) {

            return undefined;

        }

        const candidates = results

            .filter(r => r.decision !== undefined)

            .map(r => r.decision as DeadlineDecision);

        if (candidates.length === 0) {

            return undefined;

        }

        candidates.sort(

            (a, b) =>

                b.confidence - a.confidence

        );

        return candidates[0];

    }

    public resolveAll(

        groups: DeadlineRuleResult[][]

    ): DeadlineDecision[] {

        const decisions: DeadlineDecision[] = [];

        for (const group of groups) {

            const decision = this.resolve(group);

            if (decision) {

                decisions.push(decision);

            }

        }

        return decisions;

    }

}
