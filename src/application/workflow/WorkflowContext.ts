/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowContext
 * ------------------------------------------------------------
 * Estado compartido durante toda la ejecución del expediente.
 * Es el objeto que viaja entre todos los motores del sistema.
 * ============================================================
 */

import { Expediente } from "../../domain/expediente/Expediente";

import { ProcedureDecision } from "../../domain/legal/modules/procedimiento/ProcedureDecision";
import { PublicationDecision } from "../../domain/legal/modules/publicidad/PublicationDecision";
import { DeadlineDecision } from "../../domain/legal/modules/plazos/DeadlineDecision";
import { SolvencyDecision } from "../../domain/legal/modules/solvencia/SolvencyDecision";
import { GuaranteeDecision } from "../../domain/legal/modules/garantias/GuaranteeDecision";
import { CPVDecision } from "../../domain/legal/modules/cpv/CPVDecision";

export interface WorkflowContext {

    /**
     * Expediente completo.
     */
    expediente: Expediente;

    /**
     * Estado actual del Workflow.
     */
    currentState: string;

    /**
     * Motores ya ejecutados.
     */
    executedModules: string[];

    /**
     * Resultado Procedimiento.
     */
    procedure?: ProcedureDecision;

    /**
     * Resultado Publicidad.
     */
    publication?: PublicationDecision;

    /**
     * Resultado Plazos.
     */
    deadlines?: DeadlineDecision;

    /**
     * Resultado Solvencia.
     */
    solvency?: SolvencyDecision;

    /**
     * Resultado Garantías.
     */
    guarantees?: GuaranteeDecision;

    /**
     * Resultado CPV.
     */
    cpv?: CPVDecision;

    /**
     * Fecha inicio.
     */
    startedAt: Date;

    /**
     * Última modificación.
     */
    updatedAt: Date;

    /**
     * Datos auxiliares.
     */
    metadata?: Record<string, unknown>;

}
