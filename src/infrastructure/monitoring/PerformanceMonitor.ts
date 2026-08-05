/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PERFORMANCE MONITOR
 *
 ******************************************************************************/

export interface PerformanceMetric {

    operation: string;

    started: number;

    finished: number;

    duration: number;

    success: boolean;

    metadata?: Record<string, unknown>;

}

export class PerformanceMonitor {

    private readonly metrics: PerformanceMetric[] = [];

    /**************************************************************************
     *
     * Inicio de operación
     *
     **************************************************************************/

    public start(

        operation: string

    ): number {

        return Date.now();

    }

    /**************************************************************************
     *
     * Finalización
     *
     **************************************************************************/

    public stop(

        operation: string,

        started: number,

        success = true,

        metadata?: Record<string, unknown>

    ): PerformanceMetric {

        const finished =

            Date.now();

        const metric: PerformanceMetric = {

            operation,

            started,

            finished,

            duration:

                finished - started,

            success,

            metadata

        };

        this.metrics.push(

            metric

        );

        return metric;

    }

    /**************************************************************************
     *
     * Consultas
     *
     **************************************************************************/

    public all()

        : readonly PerformanceMetric[] {

        return this.metrics;

    }

    public byOperation(

        operation: string

    ): PerformanceMetric[] {

        return this.metrics.filter(

            metric =>

                metric.operation === operation

        );

    }

    public average(

        operation: string

    ): number {

        const metrics =

            this.byOperation(

                operation

            );

        if (

            metrics.length === 0

        ) {

            return 0;

        }

        const total =

            metrics.reduce(

                (

                    sum,

                    metric

                ) =>

                    sum +

                    metric.duration,

                0

            );

        return total /

               metrics.length;

    }

    public slowest()

        : PerformanceMetric | undefined {

        return this.metrics.reduce(

            (

                previous,

                current

            ) =>

                !previous ||

                current.duration >

                previous.duration

                    ? current

                    : previous,

            undefined as

            PerformanceMetric | undefined

        );

    }

    public fastest()

        : PerformanceMetric | undefined {

        return this.metrics.reduce(

            (

                previous,

                current

            ) =>

                !previous ||

                current.duration <

                previous.duration

                    ? current

                    : previous,

            undefined as

            PerformanceMetric | undefined

        );

    }

    /**************************************************************************
     *
     * Estadísticas
     *
     **************************************************************************/

    public diagnostics() {

        const successful =

            this.metrics.filter(

                metric =>

                    metric.success

            ).length;

        const failed =

            this.metrics.length -

            successful;

        return {

            total:

                this.metrics.length,

            successful,

            failed,

            slowest:

                this.slowest(),

            fastest:

                this.fastest()

        };

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public clear()

        : void {

        this.metrics.length = 0;

    }

}
