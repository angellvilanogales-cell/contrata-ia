/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReasonerRule
 * ------------------------------------------------------------
 * Regla de inferencia jurídica de alto nivel.
 *
 * Este motor ya no aplica artículos individuales, sino
 * conocimiento jurídico agregado procedente de los distintos
 * motores del sistema.
 * ============================================================
 */

import { LegalReasonerContext } from "./LegalReasonerContext";
import { LegalReasonerDecision } from "./LegalReasonerDecision";

export interface LegalReasonerRule {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Prioridad.
     */
    priority: number;

    /**
     * Versión.
     */
    version: string;

    /**
     * ¿Puede ejecutarse?
     */
    isApplicable(

        context: LegalReasonerContext

    ): boolean;

    /**
     * Ejecuta la regla.
     */
    evaluate(

        context: LegalReasonerContext

    ): LegalReasonerRuleResult;

}

/* ========================================================= */

export interface LegalReasonerRuleResult {

    applied: boolean;

    decision?: LegalReasonerDecision;

    justification: string;

    references: string[];

}
