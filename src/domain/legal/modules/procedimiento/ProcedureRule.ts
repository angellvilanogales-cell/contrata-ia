/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureRule
 * ------------------------------------------------------------
 * Regla jurídica utilizada por el Motor de Procedimientos.
 *
 * Todas las reglas del procedimiento deberán implementar
 * esta interfaz independientemente de que procedan de
 * YAML, JSON o futuras fuentes de conocimiento.
 *
 * ============================================================
 */

import { ProcedureContext } from "./ProcedureContext";
import { ProcedureDecision } from "./ProcedureDecision";

export interface ProcedureRule {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre descriptivo.
     */
    name: string;

    /**
     * Prioridad.
     */
    priority: number;

    /**
     * Versión de la regla.
     */
    version: string;

    /**
     * Módulo jurídico.
     */
    module: "PROCEDIMIENTO";

    /**
     * Determina si la regla puede evaluarse.
     */
    isApplicable(

        context: ProcedureContext

    ): boolean;

    /**
     * Evalúa la regla.
     */
    evaluate(

        context: ProcedureContext

    ): ProcedureRuleResult;

}

/* ========================================================= */

export interface ProcedureRuleResult {

    /**
     * ¿La regla ha producido resultado?
     */
    applied: boolean;

    /**
     * Decisión obtenida.
     */
    decision?: ProcedureDecision;

    /**
     * Justificación jurídica.
     */
    justification: string;

    /**
     * Referencias normativas utilizadas.
     */
    legalReferences: LegalReference[];

}

/* ========================================================= */

export interface LegalReference {

    normativa: string;

    articulo: string;

    descripcion: string;

}
