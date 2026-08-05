/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVResult
 * ------------------------------------------------------------
 * Resultado del Motor CPV.
 * ============================================================
 */

import { CPVDecision } from "./CPVDecision";

export interface CPVResult {

    /**
     * ¿Se ejecutó correctamente?
     */
    success: boolean;

    /**
     * Decisión definitiva.
     */
    selected?: CPVDecision;

    /**
     * Todas las propuestas.
     */
    candidates: CPVDecision[];

    /**
     * Conflictos detectados.
     */
    conflicts: CPVConflict[];

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

export interface CPVConflict {

    sourceRule: string;

    targetRule: string;

    description: string;

    resolved: boolean;

    resolution?: string;

}
