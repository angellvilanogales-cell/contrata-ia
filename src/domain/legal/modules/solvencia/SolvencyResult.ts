/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyResult
 * ------------------------------------------------------------
 * Resultado completo del Motor de Solvencia.
 *
 * ============================================================
 */

import { SolvencyDecision } from "./SolvencyDecision";

export interface SolvencyResult {

    /**
     * ¿La ejecución ha finalizado correctamente?
     */
    success: boolean;

    /**
     * Decisión seleccionada.
     */
    selected?: SolvencyDecision;

    /**
     * Todas las decisiones candidatas.
     */
    candidates: SolvencyDecision[];

    /**
     * Conflictos detectados.
     */
    conflicts: SolvencyConflict[];

    /**
     * Advertencias.
     */
    warnings: string[];

    /**
     * Errores.
     */
    errors: string[];

}

/* ========================================================= */

export interface SolvencyConflict {

    /**
     * Regla origen.
     */
    sourceRule: string;

    /**
     * Regla en conflicto.
     */
    targetRule: string;

    /**
     * Descripción.
     */
    description: string;

    /**
     * ¿Se resolvió?
     */
    resolved: boolean;

    /**
     * Resolución aplicada.
     */
    resolution?: string;

}
