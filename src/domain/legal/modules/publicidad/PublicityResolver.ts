/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityResolver
 * ------------------------------------------------------------
 * Selecciona la decisión definitiva entre todas las
 * decisiones candidatas obtenidas por el evaluador.
 *
 * Aquí NO se ejecutan reglas.
 *
 * Aquí únicamente se resuelven prioridades.
 *
 * ============================================================
 */

import { PublicityDecision } from "./PublicityDecision";
import { PublicityRuleResult } from "./PublicityRule";

export class PublicityResolver {

    /**
     * =====================================================
     * Resolver decisión definitiva.
     * =====================================================
     */
    public resolve(

        results: PublicityRuleResult[]

    ): PublicityDecision | undefined {

        if (results.length === 0) {

            return undefined;

        }

        const candidates = results

            .filter(r => r.decision !== undefined)

            .map(r => r.decision as PublicityDecision);

        if (candidates.length === 0) {

            return undefined;

        }

        /**
         * Ordenar por nivel de confianza.
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

        groups: PublicityRuleResult[][]

    ): PublicityDecision[] {

        const decisions: PublicityDecision[] = [];

        for (const group of groups) {

            const decision = this.resolve(group);

            if (decision) {

                decisions.push(decision);

            }

        }

        return decisions;

    }

}
