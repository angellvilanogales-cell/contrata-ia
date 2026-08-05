/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeResult
 * ------------------------------------------------------------
 * Resultado completo del Motor de Garantías.
 * ============================================================
 */

import { GuaranteeDecision } from "./GuaranteeDecision";

export interface GuaranteeResult {

    /**
     * Ejecución correcta.
     */
    success: boolean;

    /**
     * Decisión definitiva.
     */
    selected?: GuaranteeDecision;

    /**
     * Decisiones candidatas.
     */
    candidates: GuaranteeDecision[];

    /**
     * Conflictos.
     */
    conflicts: GuaranteeConflict[];

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

export interface GuaranteeConflict {

    sourceRule: string;

    targetRule: string;

    description: string;

    resolved: boolean;

    resolution?: string;

}
