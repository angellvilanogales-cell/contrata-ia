/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowTransition
 * ------------------------------------------------------------
 * Define todas las transiciones permitidas del expediente.
 *
 * Este archivo constituye la máquina de estados oficial.
 * Ningún Workflow podrá cambiar de estado si aquí no existe
 * una transición válida.
 * ============================================================
 */

import { WorkflowState } from "./WorkflowState";
import { WorkflowEvent } from "./WorkflowEvent";

export interface WorkflowTransition {

    /**
     * Estado origen.
     */
    from: WorkflowState;

    /**
     * Evento.
     */
    event: WorkflowEvent;

    /**
     * Estado destino.
     */
    to: WorkflowState;

    /**
     * ¿Requiere validación jurídica?
     */
    requiresValidation?: boolean;

}

/**
 * ============================================================
 * Transiciones oficiales
 * ============================================================
 */

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [

    {
        from: WorkflowState.CREATED,
        event: WorkflowEvent.DEFINE_NEED,
        to: WorkflowState.NEED_DEFINED
    },

    {
        from: WorkflowState.NEED_DEFINED,
        event: WorkflowEvent.DEFINE_OBJECT,
        to: WorkflowState.OBJECT_DEFINED
    },

    {
        from: WorkflowState.OBJECT_DEFINED,
        event: WorkflowEvent.SELECT_CPV,
        to: WorkflowState.CPV_SELECTED
    },

    {
        from: WorkflowState.CPV_SELECTED,
        event: WorkflowEvent.SELECT_PROCEDURE,
        to: WorkflowState.PROCEDURE_SELECTED
    },

    {
        from: WorkflowState.PROCEDURE_SELECTED,
        event: WorkflowEvent.CALCULATE_PUBLICATION,
        to: WorkflowState.PUBLICATION_DEFINED
    },

    {
        from: WorkflowState.PUBLICATION_DEFINED,
        event: WorkflowEvent.CALCULATE_DEADLINES,
        to: WorkflowState.DEADLINES_DEFINED
    },

    {
        from: WorkflowState.DEADLINES_DEFINED,
        event: WorkflowEvent.CALCULATE_SOLVENCY,
        to: WorkflowState.SOLVENCY_DEFINED
    },

    {
        from: WorkflowState.SOLVENCY_DEFINED,
        event: WorkflowEvent.CALCULATE_GUARANTEES,
        to: WorkflowState.GUARANTEES_DEFINED
    },

    {
        from: WorkflowState.GUARANTEES_DEFINED,
        event: WorkflowEvent.DEFINE_CRITERIA,
        to: WorkflowState.CRITERIA_DEFINED
    },

    {
        from: WorkflowState.CRITERIA_DEFINED,
        event: WorkflowEvent.GENERATE_DOCUMENTS,
        to: WorkflowState.DOCUMENTS_GENERATED
    },

    {
        from: WorkflowState.DOCUMENTS_GENERATED,
        event: WorkflowEvent.VALIDATE_LEGAL,
        to: WorkflowState.LEGAL_VALIDATED,
        requiresValidation: true
    },

    {
        from: WorkflowState.LEGAL_VALIDATED,
        event: WorkflowEvent.COMPLETE_EXPEDIENTE,
        to: WorkflowState.COMPLETED,
        requiresValidation: true
    }

];

/**
 * ============================================================
 * Obtiene la transición válida.
 * ============================================================
 */

export function getTransition(

    state: WorkflowState,

    event: WorkflowEvent

): WorkflowTransition | undefined {

    return WORKFLOW_TRANSITIONS.find(

        transition =>

            transition.from === state &&
            transition.event === event

    );

}

/**
 * ============================================================
 * Comprueba si la transición existe.
 * ============================================================
 */

export function canTransition(

    state: WorkflowState,

    event: WorkflowEvent

): boolean {

    return getTransition(

        state,

        event

    ) !== undefined;

}
