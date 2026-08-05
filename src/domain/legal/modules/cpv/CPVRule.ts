/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVRule
 * ------------------------------------------------------------
 * Regla jurídica del Motor CPV.
 *
 * Cada regla propone uno o varios CPV candidatos.
 * ============================================================
 */

import { CPVContext } from "./CPVContext";
import { CPVDecision } from "./CPVDecision";

export interface CPVRule {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre de la regla.
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
    module: "CPV";

    /**
     * ¿Es aplicable?
     */
    isApplicable(

        context: CPVContext

    ): boolean;

    /**
     * Ejecutar regla.
     */
    evaluate(

        context: CPVContext

    ): CPVRuleResult;

}

/* ========================================================= */

export interface CPVRuleResult {

    applied: boolean;

    decision?: CPVDecision;

    justification: string;

    legalReferences: CPVLegalReference[];

}

/* ========================================================= */

export interface CPVLegalReference {

    normativa: string;

    articulo: string;

    descripcion: string;

}
