/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT HISTORY
 *
 * Historial de exportaciones realizadas.
 *
 ******************************************************************************/

import {

    ExportFormat,
    ExportResult

} from "./DocumentExporter";

export interface ExportHistoryRecord {

    id: string;

    expedienteId: string;

    format: ExportFormat;

    fileName: string;

    filePath: string;

    generatedAt: string;

    generatedBy: string;

    success: boolean;

    durationMilliseconds: number;

    size?: number;

    errors?: string[];

}

export class ExportHistory {

    private readonly records:

        ExportHistoryRecord[] = [];

    /**************************************************************************
     *
     * Registrar exportación
     *
     **************************************************************************/

    public add(

        record: ExportHistoryRecord

    ): void {

        this.records.push(

            record

        );

    }

    /**************************************************************************
     *
     * Crear registro desde resultado
     *
     **************************************************************************/

    public createRecord(

        expedienteId: string,

        generatedBy: string,

        result: ExportResult,

        durationMilliseconds: number

    ): ExportHistoryRecord {

        return {

            id:

                crypto.randomUUID(),

            expedienteId,

            format:

                result.format,

            fileName:

                result.fileName,

            filePath:

                result.filePath,

            generatedAt:

                result.generatedAt,

            generatedBy,

            success:

                result.success,

            durationMilliseconds,

            size:

                result.size,

            errors:

                result.errors

        };

    }

    /**************************************************************************
     *
     * Consultas
     *
     **************************************************************************/

    public all()

        : ReadonlyArray<ExportHistoryRecord> {

        return this.records;

    }

    public findByExpediente(

        expedienteId: string

    ): ReadonlyArray<ExportHistoryRecord> {

        return this.records.filter(

            record =>

                record.expedienteId ===

                expedienteId

        );

    }

    public findByFormat(

        format: ExportFormat

    ): ReadonlyArray<ExportHistoryRecord> {

        return this.records.filter(

            record =>

                record.format ===

                format

        );

    }

    public successful()

        : ReadonlyArray<ExportHistoryRecord> {

        return this.records.filter(

            record =>

                record.success

        );

    }

    public failed()

        : ReadonlyArray<ExportHistoryRecord> {

        return this.records.filter(

            record =>

                !record.success

        );

    }

    /**************************************************************************
     *
     * Estadísticas
     *
     **************************************************************************/

    public count()

        : number {

        return this.records.length;

    }

    public clear()

        : void {

        this.records.length = 0;

    }

}
