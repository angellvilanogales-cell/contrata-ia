/**
 * ============================================================
 * CONTRATA-IA
 * DeadlineResult
 * ============================================================
 */

import { DeadlineDecision } from "./DeadlineDecision";

export interface DeadlineResult{

    success:boolean;

    selected?:DeadlineDecision;

    candidates:DeadlineDecision[];

    conflicts:DeadlineConflict[];

    warnings:string[];

    errors:string[];

}

export interface DeadlineConflict{

    sourceRule:string;

    targetRule:string;

    description:string;

    resolved:boolean;

    resolution?:string;

}
