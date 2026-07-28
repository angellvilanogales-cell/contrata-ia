/**
 * ============================================================
 * CONTRATA IA
 * ContrataIAEngine
 * ============================================================
 *
 * Motor principal del sistema.
 *
 * Coordina todos los motores especializados y construye
 * el expediente administrativo completo.
 *
 * Flujo general:
 *
 * Usuario
 *      │
 *      ▼
 * Expediente
 *      │
 *      ▼
 * ProcedimientoEngine
 *      ▼
 * CPVEngine
 *      ▼
 * KnowledgeEngine
 *      ▼
 * DocumentEngine
 *      ▼
 * Expediente completo
 *
 * ============================================================
 */

import { Expediente } from "../domain/expediente/Expediente";
import { ProcedimientoEngine } from "./ProcedimientoEngine";
import { CPVEngine } from "./CPVEngine";
import { KnowledgeEngine } from "./KnowledgeEngine";
import { DocumentEngine } from "./DocumentEngine";

export class ContrataIAEngine {

    constructor(

        private readonly procedimientoEngine =
            new ProcedimientoEngine(),

        private readonly cpvEngine =
            new CPVEngine(),

        private readonly knowledgeEngine =
            new KnowledgeEngine(),

        private readonly documentEngine =
            new DocumentEngine()

    ) {}

    /**
     * Ejecuta el proceso completo.
     */
    public ejecutar(
        expediente: Expediente
    ): void {

        // ==================================================
        // 1. Procedimiento
        // ==================================================

        const procedimiento =
            this.procedimientoEngine.evaluar(
                expediente
            );

        // ==================================================
        // 2. CPV
        // ==================================================

        const cpv =
            this.cpvEngine.clasificar(
                expediente
            );

        // ==================================================
        // 3. Conocimiento Jurídico
        // ==================================================

        this.knowledgeEngine.buscarProcedimiento(
            procedimiento.decision.tipo
        );

        // ==================================================
        // 4. Documentación
        // ==================================================

        this.documentEngine.generarExpediente(
            expediente
        );

    }

}
