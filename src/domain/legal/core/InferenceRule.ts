/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * InferenceRule
 * ------------------------------------------------------------
 * Define una regla jurídica ejecutable por el
 * Motor de Inferencia.
 *
 * Todas las reglas del sistema deberán adaptarse
 * a esta estructura independientemente de que
 * procedan de YAML, JSON, ontologías o futuras
 * fuentes de conocimiento.
 * ============================================================
 */

import { DecisionContext } from "./DecisionContext";

export interface InferenceRule {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Módulo funcional.
     *
     * Ejemplos:
     * CPV
     * PROCEDIMIENTO
     * SOLVENCIA
     * PLAZOS
     * PUBLICIDAD
     */
    module: string;

    /**
     * Nombre descriptivo.
     */
    name: string;

    /**
     * Versión de la regla.
     */
    version: string;

    /**
     * Prioridad.
     *
     * Cuanto mayor sea,
     * antes se ejecutará.
     */
    priority: number;

    /**
     * Determina si la regla puede ejecutarse.
     */
    condition(

        context: DecisionContext

    ): boolean;

    /**
     * Ejecuta la regla.
     */
    execute(

        context: DecisionContext

    ): RuleExecutionResult;

}

/* ========================================================= */

export interface RuleExecutionResult {

    /**
     * ¿La regla produjo resultado?
     */
    applied: boolean;

    /**
     * Resultado devuelto.
     */
    value?: unknown;

    /**
     * Mensaje interno.
     */
    message?: string;

    /**
     * Artículos utilizados.
     */
    legalReferences: LegalReference[];

}

/* ========================================================= */

export interface LegalReference {

    normativa: string;

    articulo: string;

    descripcion?: string;

}
