/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT SESSION
 *
 * Gestión de sesiones completas de exportación.
 *
 ******************************************************************************/

import {

    ExportFormat

} from "./DocumentExporter";

import {

    ExportResult

} from "./ExportManager";

export enum ExportSessionStatus {

    CREATED = "CREATED",

    RUNNING = "RUNNING",

    COMPLETED = "COMPLETED",

    FAILED = "FAILED",

    CANCELLED = "CANCELLED"

}

export interface ExportSessionInformation {

    id: string;

    expedienteId: string;

    createdAt: string;

    startedAt?: string;

    finishedAt?: string;

    status: ExportSessionStatus;

    requestedFormats: ExportFormat[];

    completedFormats: ExportFormat[];

    failedFormats: ExportFormat[];

    results: ExportResult[];

}

export class ExportSession {

    private readonly information:

        ExportSessionInformation;

    constructor(

        expedienteId: string,

        formats: ExportFormat[]

    ) {

        this.information = {

            id:

                crypto.randomUUID(),

            expedienteId,

            createdAt:

                new Date()

                    .toISOString(),

            status:

                ExportSessionStatus.CREATED,

            requestedFormats:

                [...formats],

            completedFormats: [],

            failedFormats: [],

            results: []

        };

    }

    /**************************************************************************
     *
     * Ciclo de vida
     *
     **************************************************************************/

    public start(): void {

        this.information.status =

            ExportSessionStatus.RUNNING;

        this.information.startedAt =

            new Date()

                .toISOString();

    }

    public complete(): void {

        this.information.status =

            ExportSessionStatus.COMPLETED;

        this.information.finishedAt =

            new Date()

                .toISOString();

    }

    public fail(): void {

        this.information.status =

            ExportSessionStatus.FAILED;

        this.information.finishedAt =

            new Date()

                .toISOString();

    }

    public cancel(): void {

        this.information.status =

            ExportSessionStatus.CANCELLED;

        this.information.finishedAt =

            new Date()

                .toISOString();

    }

    /**************************************************************************
     *
     * Resultados
     *
     **************************************************************************/

    public addResult(

        result: ExportResult

    ): void {

        this.information.results.push(

            result

        );

        if (

            result.success

        ) {

            this.information.completedFormats.push(

                result.format

            );

        }

        else {

            this.information.failedFormats.push(

                result.format

            );

        }

    }

    /**************************************************************************
     *
     * Consultas
     *
     **************************************************************************/

    public getInfo()

        : ExportSessionInformation {

        return {

            ...this.information

        };

    }

    public progress()

        : number {

        if (

            this.information.requestedFormats.length === 0

        ) {

            return 100;

        }

        return (

            this.information.results.length /

            this.information.requestedFormats.length

        ) * 100;

    }

}
