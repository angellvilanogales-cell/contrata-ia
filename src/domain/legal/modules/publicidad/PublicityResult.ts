/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicityResult
 * ------------------------------------------------------------
 * Resultado completo del Motor de Publicidad.
 *
 * Contiene la decisión seleccionada, las decisiones
 * candidatas, conflictos, advertencias y errores.
 *
 * ============================================================
 */

import { PublicityDecision } from "./PublicityDecision";

export interface PublicityResult {

    /**
     * ¿La ejecución ha sido correcta?
     */
    success: boolean;

    /**
     * Decisión finalmente seleccionada.
     */
    selected?: PublicityDecision;

    /**
     * Todas las decisiones candidatas.
     */
    candidates: PublicityDecision[];

    /**
     * Conflictos detectados.
     */
    conflicts: PublicityConflict[];

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

export interface PublicityConflict {

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
     * ¿Resuelto?
     */
    resolved: boolean;

    /**
     * Resolución aplicada.
     */
    resolution?: string;

}
