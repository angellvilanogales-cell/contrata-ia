/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * WorkflowEvent
 * ------------------------------------------------------------
 * Eventos que provocan transiciones entre estados
 * del Workflow del expediente.
 * ============================================================
 */

export enum WorkflowEvent {

    /**
     * Creación del expediente.
     */
    CREATE_EXPEDIENTE = "CREATE_EXPEDIENTE",

    /**
     * Necesidad validada.
     */
    DEFINE_NEED = "DEFINE_NEED",

    /**
     * Objeto contractual definido.
     */
    DEFINE_OBJECT = "DEFINE_OBJECT",

    /**
     * Selección del CPV.
     */
    SELECT_CPV = "SELECT_CPV",

    /**
     * Determinación del procedimiento.
     */
    SELECT_PROCEDURE = "SELECT_PROCEDURE",

    /**
     * Cálculo de publicidad.
     */
    CALCULATE_PUBLICATION = "CALCULATE_PUBLICATION",

    /**
     * Cálculo de plazos.
     */
    CALCULATE_DEADLINES = "CALCULATE_DEADLINES",

    /**
     * Cálculo de solvencia.
     */
    CALCULATE_SOLVENCY = "CALCULATE_SOLVENCY",

    /**
     * Cálculo de garantías.
     */
    CALCULATE_GUARANTEES = "CALCULATE_GUARANTEES",

    /**
     * Definición de criterios.
     */
    DEFINE_CRITERIA = "DEFINE_CRITERIA",

    /**
     * Generación documental.
     */
    GENERATE_DOCUMENTS = "GENERATE_DOCUMENTS",

    /**
     * Validación jurídica.
     */
    VALIDATE_LEGAL = "VALIDATE_LEGAL",

    /**
     * Finalización del expediente.
     */
    COMPLETE_EXPEDIENTE = "COMPLETE_EXPEDIENTE",

    /**
     * Retroceder un paso.
     */
    ROLLBACK = "ROLLBACK",

    /**
     * Recalcular el expediente.
     */
    RECALCULATE = "RECALCULATE"

}

/**
 * Eventos automáticos ejecutados por el sistema.
 */
export const AUTOMATIC_EVENTS: WorkflowEvent[] = [

    WorkflowEvent.CALCULATE_PUBLICATION,
    WorkflowEvent.CALCULATE_DEADLINES,
    WorkflowEvent.CALCULATE_SOLVENCY,
    WorkflowEvent.CALCULATE_GUARANTEES

];

/**
 * Eventos iniciados por el usuario.
 */
export const USER_EVENTS: WorkflowEvent[] = [

    WorkflowEvent.CREATE_EXPEDIENTE,
    WorkflowEvent.DEFINE_NEED,
    WorkflowEvent.DEFINE_OBJECT,
    WorkflowEvent.SELECT_CPV,
    WorkflowEvent.SELECT_PROCEDURE,
    WorkflowEvent.DEFINE_CRITERIA,
    WorkflowEvent.GENERATE_DOCUMENTS,
    WorkflowEvent.VALIDATE_LEGAL,
    WorkflowEvent.COMPLETE_EXPEDIENTE

];
