/**
 * ============================================================
 * CONTRATA IA
 * BaseEngine
 * ============================================================
 *
 * Clase base para todos los motores jurídicos.
 *
 * Centraliza el acceso al conocimiento y al motor
 * de inferencia para evitar duplicidad de código.
 *
 * ============================================================
 */

import { KnowledgeEngine } from "./KnowledgeEngine";
import { InferenceEngine } from "../domain/conocimiento/InferenceEngine";

export abstract class BaseEngine {

    constructor(

        protected readonly knowledge: KnowledgeEngine,

        protected readonly inference: InferenceEngine

    ) {}

    /**
     * Obtiene una colección de reglas.
     */
    protected async obtenerReglas(

        nombre: string

    ): Promise<any[]> {

        switch (nombre) {

            case "PROCEDIMIENTO":
                return this.knowledge.obtenerReglasProcedimiento();

            case "PUBLICIDAD":
                return this.knowledge.obtenerReglasPublicidad();

            case "SOLVENCIA":
                return this.knowledge.obtenerReglasSolvencia();

            case "LOTES":
                return this.knowledge.obtenerReglasLotes();

            default:
                return [];

        }

    }

}
