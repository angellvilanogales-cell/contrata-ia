/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT DIAGNOSTICS
 *
 * Diagnóstico del sistema de exportación.
 *
 ******************************************************************************/

import { ExportManager } from "./ExportManager";
import { ExportQueue } from "./ExportQueue";

export interface ExportDiagnosticsResult {

    timestamp: string;

    availableFormats: string[];

    registeredExporters: number;

    queueLength: number;

    queueEmpty: boolean;

    schedulerRunning: boolean;

    healthy: boolean;

    warnings: string[];

}

export class ExportDiagnostics {

    constructor(

        private readonly manager: ExportManager,

        private readonly queue: ExportQueue

    ) {}

    /**************************************************************************
     *
     * Ejecutar diagnóstico
     *
     **************************************************************************/

    public run(

        schedulerRunning: boolean

    ): ExportDiagnosticsResult {

        const warnings: string[] = [];

        const formats =

            this.manager.availableFormats();

        if (

            formats.length === 0

        ) {

            warnings.push(

                "No existen exportadores registrados."

            );

        }

        if (

            this.queue.count() > 100

        ) {

            warnings.push(

                "La cola de exportación contiene más de 100 tareas."

            );

        }

        if (

            !schedulerRunning

        ) {

            warnings.push(

                "El ExportScheduler no está ejecutándose."

            );

        }

        return {

            timestamp:

                new Date().toISOString(),

            availableFormats:

                formats,

            registeredExporters:

                this.manager.count(),

            queueLength:

                this.queue.count(),

            queueEmpty:

                this.queue.isEmpty(),

            schedulerRunning,

            healthy:

                warnings.length === 0,

            warnings

        };

    }

}
