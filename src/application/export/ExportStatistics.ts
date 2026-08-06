/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT STATISTICS
 *
 * Estadísticas del sistema de exportación.
 *
 ******************************************************************************/

import {

    ExportHistory,
    ExportHistoryRecord

} from "./ExportHistory";

export interface ExportStatisticsData {

    totalExports: number;

    successfulExports: number;

    failedExports: number;

    successRate: number;

    averageDuration: number;

    totalSize: number;

    formats: Record<string, number>;

}

export class ExportStatistics {

    constructor(

        private readonly history: ExportHistory

    ) {}

    /**************************************************************************
     *
     * Estadísticas completas
     *
     **************************************************************************/

    public calculate()

        : ExportStatisticsData {

        const records =

            this.history.all();

        const successful =

            records.filter(

                record =>

                    record.success

            );

        const failed =

            records.filter(

                record =>

                    !record.success

            );

        const totalSize =

            records.reduce(

                (

                    total,

                    record

                ) =>

                    total +

                    (

                        record.size ??

                        0

                    ),

                0

            );

        const averageDuration =

            records.length === 0

                ? 0

                : records.reduce(

                    (

                        total,

                        record

                    ) =>

                        total +

                        record.durationMilliseconds,

                    0

                ) /

                records.length;

        const formats:

            Record<string, number> = {};

        for (

            const record

            of records

        ) {

            formats[

                record.format

            ] =

                (

                    formats[

                        record.format

                    ] ??

                    0

                ) + 1;

        }

        return {

            totalExports:

                records.length,

            successfulExports:

                successful.length,

            failedExports:

                failed.length,

            successRate:

                records.length === 0

                    ? 100

                    : (

                        successful.length *

                        100

                    ) /

                    records.length,

            averageDuration,

            totalSize,

            formats

        };

    }

    /**************************************************************************
     *
     * Últimas exportaciones
     *
     **************************************************************************/

    public latest(

        count = 10

    ): ReadonlyArray<ExportHistoryRecord> {

        return [

            ...this.history.all()

        ]

        .sort(

            (

                a,

                b

            ) =>

                b.generatedAt.localeCompare(

                    a.generatedAt

                )

        )

        .slice(

            0,

            count

        );

    }

}
