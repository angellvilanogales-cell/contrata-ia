/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DocumentGenerationContext
 * ------------------------------------------------------------
 * Contexto único utilizado durante la generación documental.
 *
 * Todos los motores documentales trabajarán con esta clase.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../expediente/ExpedienteContext";
import { DocumentType } from "./DocumentType";

export interface DocumentGenerationContext {

    /**
     * Expediente completo.
     */
    expediente: ExpedienteContext;

    /**
     * Documento que se está generando.
     */
    documentType: DocumentType;

    /**
     * Parámetros adicionales.
     */
    parameters?: Record<string, unknown>;

}
