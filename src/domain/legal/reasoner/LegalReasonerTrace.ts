/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReasonerTrace
 * ------------------------------------------------------------
 * Registro completo de ejecución del LegalReasoner.
 * Permite reconstruir todo el razonamiento jurídico seguido.
 * ============================================================
 */

import { LegalReasonerDecision } from "./LegalReasonerDecision";

export interface LegalReasonerTrace {

    timestamp: Date;

    engineVersion: string;

    executionTimeMs: number;

    totalRules: number;

    executedRules: number;

    appliedRules: number;

    finalDecision?: LegalReasonerDecision;

    inferenceDepth: number;

    steps: LegalReasonerTraceStep[];

}

export interface LegalReasonerTraceStep {

    ruleId: string;

    ruleName: string;

    priority: number;

    executed: boolean;

    applied: boolean;

    executionTimeMs: number;

    justification?: string;

}
