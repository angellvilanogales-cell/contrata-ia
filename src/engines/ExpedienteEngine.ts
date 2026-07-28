/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteEngine
 * ============================================================
 *
 * Motor principal del sistema experto.
 *
 * Coordina la ejecución de todos los motores
 * especializados sobre un mismo ExpedienteContext.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

import { KnowledgeManager } from "../domain/conocimiento/KnowledgeManager";

import { CPVEngine } from "./CPVEngine";
import { ProcedimientoEngine } from "./ProcedimientoEngine";
import { SolvenciaEngine } from "./SolvenciaEngine";

export class ExpedienteEngine {

    private readonly cpvEngine: CPVEngine;

    private readonly procedimientoEngine: ProcedimientoEngine;

    private readonly solvenciaEngine: SolvenciaEngine;

    constructor(

        knowledgeManager: KnowledgeManager

    ) {

        this.cpvEngine =

            new CPVEngine(

                knowledgeManager

            );

        this.procedimientoEngine =

            new ProcedimientoEngine();

        this.solvenciaEngine =

            new SolvenciaEngine();

    }

    /**
     * Ejecuta completamente el sistema experto.
     */
    public generar(

        contexto: ExpedienteContext

    ): ExpedienteContext {

        //
        // 1
        // Código CPV
        //
        this.cpvEngine.ejecutar(

            contexto

        );

        //
        // 2
        // Procedimiento
        //
        this.procedimientoEngine.ejecutar(

            contexto

        );

        //
        // 3
        // Solvencia
        //
        this.solvenciaEngine.ejecutar(

            contexto

        );

        //
        // Próximamente
        //
        // PublicidadEngine
        // PlazosEngine
        // LotesEngine
        // CriteriosEngine
        // GarantiasEngine
        // RecursosEngine
        // PenalidadesEngine
        // ModificacionesEngine
        //

        return contexto;

    }

}
