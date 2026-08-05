/**
 * ============================================================
 * CONTRATA-IA
 * DeadlineRule
 * ============================================================
 */

import { DeadlineContext } from "./DeadlineContext";
import { DeadlineDecision } from "./DeadlineDecision";

export interface DeadlineRule {

    id:string;

    name:string;

    priority:number;

    version:string;

    module:"PLAZOS";

    isApplicable(

        context:DeadlineContext

    ):boolean;

    evaluate(

        context:DeadlineContext

    ):DeadlineRuleResult;

}

export interface DeadlineRuleResult{

    applied:boolean;

    decision?:DeadlineDecision;

    justification:string;

    legalReferences:DeadlineLegalReference[];

}

export interface DeadlineLegalReference{

    normativa:string;

    articulo:string;

    descripcion:string;

}
