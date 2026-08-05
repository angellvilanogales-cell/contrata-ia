/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReasonerResult
 * ============================================================
 */

import { LegalReasonerDecision } from "./LegalReasonerDecision";

export interface LegalReasonerResult {

    /**
     * Ejecución correcta.
     */
    success: boolean;

    /**
     * Decisión definitiva.
     */
    selected?: LegalReasonerDecision;

    /**
     * Todas las decisiones.
     */
    candidates: LegalReasonerDecision[];

    /**
     * Conflictos.
     */
    conflicts: LegalReasonerConflict[];

    /**
     * Advertencias.
     */
    warnings: string[];

    /**
     * Errores.
     */
    errors: string[];

}

export interface LegalReasonerConflict {

    sourceRule: string;

    targetRule: string;

    description: string;

    resolved: boolean;

    resolution?: string;

}
