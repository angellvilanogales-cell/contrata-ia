/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureResult
 * ------------------------------------------------------------
 * Resultado completo generado por el Motor de
 * Procedimientos.
 *
 * Contiene todas las decisiones candidatas obtenidas,
 * la decisión finalmente seleccionada y los posibles
 * conflictos detectados.
 *
 * ============================================================
 */

import { ProcedureDecision } from "./ProcedureDecision";

export interface ProcedureResult {

    /**
     * ¿El análisis ha finalizado correctamente?
     */
    success: boolean;

    /**
     * Decisión finalmente seleccionada.
     */
    selected?: ProcedureDecision;

    /**
     * Todas las decisiones candidatas obtenidas.
     */
    candidates: ProcedureDecision[];

    /**
     * Conflictos detectados.
     */
    conflicts: ProcedureConflict[];

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

export interface ProcedureConflict {

    /**
     * Regla origen.
     */
    sourceRule: string;

    /**
     * Regla en conflicto.
     */
    targetRule: string;

    /**
     * Motivo.
     */
    description: string;

    /**
     * ¿Ha sido resuelto?
     */
    resolved: boolean;

    /**
     * Solución adoptada.
     */
    resolution?: string;

}
