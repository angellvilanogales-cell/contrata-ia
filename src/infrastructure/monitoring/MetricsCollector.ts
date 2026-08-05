/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * METRICS COLLECTOR
 *
 ******************************************************************************/

export interface Metric {

    name: string;

    value: number;

    timestamp: string;

    tags?: Record<string, string>;

}

export class MetricsCollector {

    private readonly metrics: Metric[] = [];

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public record(

        name: string,

        value: number,

        tags?: Record<string, string>

    ): void {

        this.metrics.push(

            {

                name,

                value,

                timestamp:

                    new Date()

                        .toISOString(),

                tags

            }

        );

    }

    /**************************************************************************
     *
     * Consultas
     *
     **************************************************************************/

    public all()

        : readonly Metric[] {

        return this.metrics;

    }

    public byName(

        name: string

    ): Metric[] {

        return this.metrics.filter(

            metric =>

                metric.name === name

        );

    }

    public latest(

        name: string

    ): Metric | undefined {

        const values =

            this.byName(

                name

            );

        return values.at(

            -1

        );

    }

    public average(

        name: string

    ): number {

        const values =

            this.byName(

                name

            );

        if (

            values.length === 0

        ) {

            return 0;

        }

        return (

            values.reduce(

                (

                    total,

                    metric

                ) =>

                    total +

                    metric.value,

                0

            )

            /

            values.length

        );

    }

    public maximum(

        name: string

    ): number {

        const values =

            this.byName(

                name

            );

        if (

            values.length === 0

        ) {

            return 0;

        }

        return Math.max(

            ...values.map(

                metric =>

                    metric.value

            )

        );

    }

    public minimum(

        name: string

    ): number {

        const values =

            this.byName(

                name

            );

        if (

            values.length === 0

        ) {

            return 0;

        }

        return Math.min(

            ...values.map(

                metric =>

                    metric.value

            )

        );

    }

    /**************************************************************************
     *
     * Estadísticas
     *
     **************************************************************************/

    public diagnostics() {

        const names =

            [

                ...new Set(

                    this.metrics.map(

                        metric =>

                            metric.name

                    )

                )

            ];

        return {

            totalMetrics:

                this.metrics.length,

            metricTypes:

                names.length,

            metrics:

                names.map(

                    name =>

                        ({

                            name,

                            samples:

                                this.byName(

                                    name

                                ).length,

                            average:

                                this.average(

                                    name

                                ),

                            minimum:

                                this.minimum(

                                    name

                                ),

                            maximum:

                                this.maximum(

                                    name

                                )

                        })

                )

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
