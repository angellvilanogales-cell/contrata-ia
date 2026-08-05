/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DIAGNOSTICS SERVICE
 *
 ******************************************************************************/

import { HealthReport } from "./HealthReport";
import { MemoryMonitor } from "./MemoryMonitor";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { MetricsCollector } from "./MetricsCollector";
import { SystemStatus } from "./SystemStatus";

export interface DiagnosticsResult {

    generatedAt: string;

    system: unknown;

    performance: unknown;

    memory: unknown;

    metrics: unknown;

    recommendations: string[];

}

export class DiagnosticsService {

    constructor(

        private readonly healthReport: HealthReport,

        private readonly memoryMonitor: MemoryMonitor,

        private readonly performanceMonitor: PerformanceMonitor,

        private readonly metricsCollector: MetricsCollector,

        private readonly systemStatus: SystemStatus

    ) {

    }

    /**************************************************************************
     *
     * Diagnóstico completo
     *
     **************************************************************************/

    public async generate()

        : Promise<DiagnosticsResult> {

        const system =

            await this.systemStatus.snapshot();

        const performance =

            this.performanceMonitor.diagnostics();

        const memory =

            this.memoryMonitor.diagnostics();

        const metrics =

            this.metricsCollector.diagnostics();

        const recommendations =

            this.buildRecommendations(

                performance,

                memory,

                metrics

            );

        return {

            generatedAt:

                new Date()

                    .toISOString(),

            system,

            performance,

            memory,

            metrics,

            recommendations

        };

    }

    /**************************************************************************
     *
     * Informe texto
     *
     **************************************************************************/

    public async report()

        : Promise<string> {

        const result =

            await this.generate();

        return [

            "===============================",

            "DIAGNÓSTICO DEL SISTEMA",

            "===============================",

            "",

            "Estado general:",

            JSON.stringify(

                result.system,

                null,

                2

            ),

            "",

            "Rendimiento:",

            JSON.stringify(

                result.performance,

                null,

                2

            ),

            "",

            "Memoria:",

            JSON.stringify(

                result.memory,

                null,

                2

            ),

            "",

            "Métricas:",

            JSON.stringify(

                result.metrics,

                null,

                2

            ),

            "",

            "Recomendaciones:",

            ...result.recommendations.map(

                recommendation =>

                    "- " +

                    recommendation

            )

        ].join("\n");

    }

    /**************************************************************************
     *
     * Recomendaciones automáticas
     *
     **************************************************************************/

    private buildRecommendations(

        performance: any,

        memory: any,

        metrics: any

    ): string[] {

        const recommendations: string[] = [];

        if (

            performance.failed > 0

        ) {

            recommendations.push(

                "Existen operaciones fallidas que deberían revisarse."

            );

        }

        if (

            memory.maxHeap >

            512 * 1024 * 1024

        ) {

            recommendations.push(

                "El consumo máximo de memoria supera los 512 MB."

            );

        }

        if (

            metrics.totalMetrics === 0

        ) {

            recommendations.push(

                "Todavía no existen métricas registradas."

            );

        }

        if (

            recommendations.length === 0

        ) {

            recommendations.push(

                "No se detectan incidencias relevantes."

            );

        }

        return recommendations;

    }

}
