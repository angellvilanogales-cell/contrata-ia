/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureResolver
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

import { ProcedureDecision } from "./ProcedureDecision";
import { ProcedureRuleResult } from "./ProcedureRule";

export class ProcedureResolver {

    /**
     * =====================================================
     * Resolver procedimiento definitivo.
     * =====================================================
     */
    public resolve(

        results: ProcedureRuleResult[]

    ): ProcedureDecision | undefined {

        if (results.length === 0) {

            return undefined;

        }

        /**
         * Eliminamos resultados sin decisión.
         */

        const candidates = results

            .filter(r => r.decision !== undefined)

            .map(r => r.decision as ProcedureDecision);

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

        /**
         * Se devuelve el candidato con mayor confianza.
         */

        return candidates[0];

    }

    /**
     * =====================================================
     * Resolver múltiples decisiones.
     * =====================================================
     */

    public resolveAll(

        groups: ProcedureRuleResult[][]

    ): ProcedureDecision[] {

        const decisions: ProcedureDecision[] = [];

        for (const group of groups) {

            const decision = this.resolve(group);

            if (decision) {

                decisions.push(decision);

            }

        }

        return decisions;

    }

}
