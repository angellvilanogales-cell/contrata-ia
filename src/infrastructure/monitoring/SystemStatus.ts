/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * SYSTEM STATUS
 *
 ******************************************************************************/

import { MemoryMonitor } from "./MemoryMonitor";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { HealthReport } from "./HealthReport";

export interface SystemStatusSnapshot {

    timestamp: string;

    healthy: boolean;

    memory: unknown;

    performance: unknown;

    health: unknown;

}

export class SystemStatus {

    constructor(

        private readonly memoryMonitor: MemoryMonitor,

        private readonly performanceMonitor: PerformanceMonitor,

        private readonly healthReport: HealthReport

    ) {}

    /**************************************************************************
     *
     * Estado completo
     *
     **************************************************************************/

    public async snapshot()

        : Promise<SystemStatusSnapshot> {

        const health =

            await this.healthReport.run();

        this.memoryMonitor.capture();

        return {

            timestamp:

                new Date()

                    .toISOString(),

            healthy:

                health.overallStatus ===

                "HEALTHY",

            memory:

                this.memoryMonitor.diagnostics(),

            performance:

                this.performanceMonitor.diagnostics(),

            health

        };

    }

    /**************************************************************************
     *
     * Resumen
     *
     **************************************************************************/

    public async summary()

        : Promise<string> {

        const snapshot =

            await this.snapshot();

        return [

            "===== SYSTEM STATUS =====",

            `Timestamp: ${snapshot.timestamp}`,

            `Healthy: ${snapshot.healthy}`,

            "",

            "Memory:",

            JSON.stringify(

                snapshot.memory,

                null,

                2

            ),

            "",

            "Performance:",

            JSON.stringify(

                snapshot.performance,

                null,

                2

            ),

            "",

            "Health:",

            JSON.stringify(

                snapshot.health,

                null,

                2

            )

        ].join("\n");

    }

}
