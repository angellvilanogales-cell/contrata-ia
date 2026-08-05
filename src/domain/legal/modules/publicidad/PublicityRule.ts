/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityRule
 * ------------------------------------------------------------
 * Regla jurídica utilizada por el Motor de Publicidad.
 *
 * Todas las reglas deberán implementar esta interfaz,
 * independientemente de que procedan de YAML, JSON o de
 * cualquier otra fuente de conocimiento.
 *
 * ============================================================
 */

import { PublicityContext } from "./PublicityContext";
import { PublicityDecision } from "./PublicityDecision";

export interface PublicityRule {

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
     * Versión.
     */
    version: string;

    /**
     * Módulo jurídico.
     */
    module: "PUBLICIDAD";

    /**
     * ¿Puede aplicarse?
     */
    isApplicable(

        context: PublicityContext

    ): boolean;

    /**
     * Ejecutar regla.
     */
    evaluate(

        context: PublicityContext

    ): PublicityRuleResult;

}

/* ========================================================= */

export interface PublicityRuleResult {

    /**
     * ¿La regla produce resultado?
     */
    applied: boolean;

    /**
     * Decisión obtenida.
     */
    decision?: PublicityDecision;

    /**
     * Justificación.
     */
    justification: string;

    /**
     * Referencias jurídicas.
     */
    legalReferences: PublicityLegalReference[];

}

/* ========================================================= */

export interface PublicityLegalReference {

    normativa: string;

    articulo: string;

    descripcion: string;

}
