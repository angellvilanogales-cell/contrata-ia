/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionContext
 * ------------------------------------------------------------
 * Contexto único utilizado por todos los catálogos del
 * Knowledge Engine.
 *
 * Filosofía:
 *
 * Ningún catálogo recibirá parámetros sueltos
 * (presupuesto, CPV, tipo de contrato...).
 *
 * Todos recibirán un único objeto DecisionContext,
 * que representa el estado completo del expediente en el
 * momento de tomar una decisión.
 *
 * De esta forma todos los catálogos comparten la misma
 * interfaz y el sistema es fácilmente ampliable.
 * ============================================================
 */

import { ContractFile } from "../contract-file/ContractFile";

/**
 * Información adicional utilizada durante la resolución
 * de reglas del Knowledge Engine.
 */
export interface DecisionMetadata {

    /**
     * Usuario que ejecuta la consulta.
     */
    user?: string;

    /**
     * Fecha de la decisión.
     */
    timestamp?: Date;

    /**
     * Idioma.
     */
    language?: string;

    /**
     * Versión del motor.
     */
    engineVersion?: string;

}

/**
 * Estado interno del expediente.
 */
export interface DecisionState {

    /**
     * Identificador del paso del flujo.
     */
    step?: string;

    /**
     * Documento actualmente en generación.
     */
    currentDocument?: string;

    /**
     * Indica si el expediente ya ha sido validado.
     */
    validated?: boolean;

}

/**
 * Contexto único recibido por cualquier catálogo
 * del Knowledge Engine.
 */
export interface DecisionContext {

    /**
     * Expediente completo.
     */
    contract: ContractFile;

    /**
     * Estado actual del flujo.
     */
    state: DecisionState;

    /**
     * Información técnica adicional.
     */
    metadata: DecisionMetadata;

}
