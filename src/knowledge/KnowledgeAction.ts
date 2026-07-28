/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeAction
 * ============================================================
 *
 * Acción que debe ejecutarse cuando una regla jurídica
 * resulta aplicable.
 *
 * Las acciones representan las consecuencias de aplicar
 * una regla derivada de la LCSP.
 * ============================================================
 */

export enum ActionType {

    GENERAR_DOCUMENTO,

    ESTABLECER_PROCEDIMIENTO,

    PROPONER_CPV,

    SOLICITAR_INFORMACION,

    ACTIVAR_REGLA,

    MOSTRAR_ADVERTENCIA,

    ESTABLECER_VALOR,

    GENERAR_MOTIVACION

}

export interface KnowledgeAction {

    /**
     * Tipo de acción.
     */
    type: ActionType;

    /**
     * Campo afectado.
     */
    target: string;

    /**
     * Valor que debe asignarse.
     */
    value?: unknown;

    /**
     * Descripción de la acción.
     */
    description: string;

}
