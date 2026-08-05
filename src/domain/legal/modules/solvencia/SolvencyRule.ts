/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyRule
 * ------------------------------------------------------------
 * Regla jurídica utilizada por el Motor de Solvencia.
 *
 * Todas las reglas de solvencia deberán implementar esta
 * interfaz, independientemente del origen de las reglas.
 *
 * ============================================================
 */

import { SolvencyContext } from "./SolvencyContext";
import { SolvencyDecision } from "./SolvencyDecision";

export interface SolvencyRule {

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
    module: "SOLVENCIA";

    /**
     * Determina si la regla puede ejecutarse.
     */
    isApplicable(

        context: SolvencyContext

    ): boolean;

    /**
     * Ejecuta la regla.
     */
    evaluate(

        context: SolvencyContext

    ): SolvencyRuleResult;

}

/* ========================================================= */

export interface SolvencyRuleResult {

    /**
     * ¿La regla produce resultado?
     */
    applied: boolean;

    /**
     * Decisión obtenida.
     */
    decision?: SolvencyDecision;

    /**
     * Justificación jurídica.
     */
    justification: string;

    /**
     * Referencias normativas.
     */
    legalReferences: SolvencyLegalReference[];

}

/* ========================================================= */

export interface SolvencyLegalReference {

    /**
     * Norma aplicada.
     */
    normativa: string;

    /**
     * Artículo.
     */
    articulo: string;

    /**
     * Descripción.
     */
    descripcion: string;

}
