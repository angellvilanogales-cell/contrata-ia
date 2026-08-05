/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LegalReasonerContext
 * ============================================================
 */

import { ProcedureDecision } from "../modules/procedimiento/ProcedureDecision";
import { PublicationDecision } from "../modules/publicidad/PublicationDecision";
import { DeadlineDecision } from "../modules/plazos/DeadlineDecision";
import { SolvencyDecision } from "../modules/solvencia/SolvencyDecision";
import { GuaranteeDecision } from "../modules/garantias/GuaranteeDecision";
import { CPVDecision } from "../modules/cpv/CPVDecision";

export interface LegalReasonerContext {

    expedienteId: string;

    procedure?: ProcedureDecision;

    publication?: PublicationDecision;

    deadlines?: DeadlineDecision;

    solvency?: SolvencyDecision;

    guarantees?: GuaranteeDecision;

    cpv?: CPVDecision;

    metadata?: Record<string, unknown>;

}
