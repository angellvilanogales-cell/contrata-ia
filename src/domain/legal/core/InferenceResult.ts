/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * InferenceResult
 * ------------------------------------------------------------
 * Resultado completo obtenido tras ejecutar el
 * Motor de Inferencia.
 *
 * Este objeto será posteriormente procesado por
 * el LegalReasoner.
 * ============================================================
 */

import {

    RuleExecutionResult,
    LegalReference

} from "./InferenceRule";

/* ========================================================= */

export interface InferenceResult {

    /**
     * ¿La inferencia terminó correctamente?
     */
    success: boolean;

    /**
     * Resultados producidos por las reglas.
     */
    executions: RuleExecution[];

    /**
     * Referencias jurídicas utilizadas.
     */
    references: LegalReference[];

    /**
     * Advertencias detectadas.
     */
    warnings: string[];

    /**
     * Errores detectados.
     */
    errors: string[];

}

/* ========================================================= */

export interface RuleExecution {

    /**
     * Regla ejecutada.
     */
    ruleId: string;

    /**
     * Módulo al que pertenece.
     */
    module: string;

    /**
     * Resultado producido.
     */
    result: RuleExecutionResult;

}
