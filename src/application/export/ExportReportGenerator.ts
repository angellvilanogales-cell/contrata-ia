/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT REPORT GENERATOR
 *
 * Generador de informes de exportación.
 *
 ******************************************************************************/

import {

    ExportHistory,
    ExportHistoryRecord

} from "./ExportHistory";

export interface ExportReport {

    generatedAt: string;

    totalExports: number;

    successfulExports: number;

    failedExports: number;

    totalSize: number;

    averageDuration: number;

    formats: Record<string, number>;

    details: ExportHistoryRecord[];

}

export class ExportReportGenerator {

    constructor(

        private readonly history: ExportHistory

    ) {}

    /**************************************************************************
     *
     * Generación del informe
     *
     **************************************************************************/

    public generate(): ExportReport {

        const records =

            [...this.history.all()];

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

            generatedAt:

                new Date()

                    .toISOString(),

            totalExports:

                records.length,

            successfulExports:

                successful.length,

            failedExports:

                failed.length,

            totalSize,

            averageDuration,

            formats,

            details:

                records

        };

    }

}
