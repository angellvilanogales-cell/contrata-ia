/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowState
 * ------------------------------------------------------------
 * Estados posibles del expediente.
 * Todos los expedientes deben encontrarse siempre en uno
 * de estos estados.
 * ============================================================
 */

export enum WorkflowState {

    /**
     * Expediente recién creado.
     */
    CREATED = "CREATED",

    /**
     * Definición de necesidad.
     */
    NEED_DEFINED = "NEED_DEFINED",

    /**
     * Objeto contractual definido.
     */
    OBJECT_DEFINED = "OBJECT_DEFINED",

    /**
     * CPV seleccionado.
     */
    CPV_SELECTED = "CPV_SELECTED",

    /**
     * Procedimiento seleccionado.
     */
    PROCEDURE_SELECTED = "PROCEDURE_SELECTED",

    /**
     * Publicidad calculada.
     */
    PUBLICATION_DEFINED = "PUBLICATION_DEFINED",

    /**
     * Plazos calculados.
     */
    DEADLINES_DEFINED = "DEADLINES_DEFINED",

    /**
     * Solvencia calculada.
     */
    SOLVENCY_DEFINED = "SOLVENCY_DEFINED",

    /**
     * Garantías calculadas.
     */
    GUARANTEES_DEFINED = "GUARANTEES_DEFINED",

    /**
     * Criterios definidos.
     */
    CRITERIA_DEFINED = "CRITERIA_DEFINED",

    /**
     * Documentación generada.
     */
    DOCUMENTS_GENERATED = "DOCUMENTS_GENERATED",

    /**
     * Validación jurídica.
     */
    LEGAL_VALIDATED = "LEGAL_VALIDATED",

    /**
     * Expediente completo.
     */
    COMPLETED = "COMPLETED"

}

/**
 * Estados finales.
 */
export const FINAL_STATES: WorkflowState[] = [

    WorkflowState.COMPLETED

];

/**
 * Estados iniciales.
 */
export const INITIAL_STATE = WorkflowState.CREATED;
