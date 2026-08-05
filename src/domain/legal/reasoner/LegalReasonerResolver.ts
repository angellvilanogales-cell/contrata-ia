/**
 * ============================================================
 * CONTRATA-IA
 * LegalReasonerResolver
 * ============================================================
 */

import { LegalReasonerDecision } from "./LegalReasonerDecision";
import { LegalReasonerRuleResult } from "./LegalReasonerRule";

export class LegalReasonerResolver {

    resolve(

        results: LegalReasonerRuleResult[]

    ): LegalReasonerDecision | undefined {

        if (results.length === 0) {

            return undefined;

        }

        const candidates = results

            .filter(r => r.decision)

            .map(r => r.decision!);

        candidates.sort(

            (a, b) =>

                b.confidence - a.confidence

        );

        return candidates[0];

    }

}
