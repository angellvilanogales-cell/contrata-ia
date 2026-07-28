/**
 * ============================================================
 * CONTRATA IA
 * ExpedienteEngine
 * ============================================================
 *
 * Orquestador principal del sistema experto.
 *
 * Ejecuta secuencialmente todos los motores sobre
 * un mismo ExpedienteContext.
 *
 * Cada motor enriquece el contexto con nueva
 * información jurídica.
 *
 * ============================================================
 */

import { ExpedienteContext } from "../domain/expediente/ExpedienteContext";

import { KnowledgeManager } from "../domain/conocimiento/KnowledgeManager";

import { CPVEngine } from "./CPVEngine";
import { ProcedimientoEngine } from "./ProcedimientoEngine";
import { SolvenciaEngine } from "./SolvenciaEngine";
import { PublicidadEngine } from "./PublicidadEngine";

export class ExpedienteEngine {

    private readonly cpvEngine: CPVEngine;

    private readonly procedimientoEngine: ProcedimientoEngine;

    private readonly solvenciaEngine: SolvenciaEngine;

    private readonly publicidadEngine: PublicidadEngine;

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

        this.publicidadEngine =

            new PublicidadEngine();

    }

    /**
     * Ejecuta completamente el sistema experto.
     */
    public generar(

        contexto: ExpedienteContext

    ): ExpedienteContext {

        //
        // 1
        // Identificación CPV
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
        // 4
        // Publicidad
        //
        this.publicidadEngine.ejecutar(

            contexto

        );

        //
        // Próximos motores
        //
        // PlazosEngine
        // LotesEngine
        // GarantiasEngine
        // CriteriosEngine
        // RecursosEngine
        // PenalidadesEngine
        // RevisionPreciosEngine
        // ModificacionesEngine
        // EjecucionEngine
        // RecepcionEngine
        // LiquidacionEngine
        //

        return contexto;

    }

}
