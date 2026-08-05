/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeRule
 * ------------------------------------------------------------
 * Regla jurídica del Motor de Garantías.
 * ============================================================
 */

import { GuaranteeContext } from "./GuaranteeContext";
import { GuaranteeDecision } from "./GuaranteeDecision";

export interface GuaranteeRule {

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
     * Módulo.
     */
    module: "GARANTIAS";

    /**
     * ¿La regla es aplicable?
     */
    isApplicable(

        context: GuaranteeContext

    ): boolean;

    /**
     * Ejecutar regla.
     */
    evaluate(

        context: GuaranteeContext

    ): GuaranteeRuleResult;

}

/* ========================================================= */

export interface GuaranteeRuleResult {

    /**
     * ¿Produce resultado?
     */
    applied: boolean;

    /**
     * Decisión jurídica.
     */
    decision?: GuaranteeDecision;

    /**
     * Justificación.
     */
    justification: string;

    /**
     * Referencias legales.
     */
    legalReferences: GuaranteeLegalReference[];

}

/* ========================================================= */

export interface GuaranteeLegalReference {

    normativa: string;

    articulo: string;

    descripcion: string;

}
