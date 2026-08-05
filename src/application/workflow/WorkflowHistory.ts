/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowHistory
 * ------------------------------------------------------------
 * Historial completo del Workflow.
 * ============================================================
 */

import { WorkflowState } from "./WorkflowState";
import { WorkflowEvent } from "./WorkflowEvent";

export interface WorkflowHistory {

    expedienteId: string;

    entries: WorkflowHistoryEntry[];

}

export interface WorkflowHistoryEntry {

    timestamp: Date;

    previousState: WorkflowState;

    event: WorkflowEvent;

    nextState: WorkflowState;

    user?: string;

    executionTimeMs?: number;

    success: boolean;

    message?: string;

}
