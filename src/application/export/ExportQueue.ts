/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT QUEUE
 *
 * Cola de exportaciones.
 *
 ******************************************************************************/

import {

    ExportFormat

} from "./DocumentExporter";

export interface ExportTask {

    id: string;

    expedienteId: string;

    expediente: unknown;

    formats: ExportFormat[];

    createdAt: string;

    priority: number;

}

export class ExportQueue {

    private readonly queue:

        ExportTask[] = [];

    /**************************************************************************
     *
     * Añadir tarea
     *
     **************************************************************************/

    public enqueue(

        task: ExportTask

    ): void {

        this.queue.push(

            task

        );

        this.queue.sort(

            (

                a,

                b

            ) =>

                b.priority -

                a.priority

        );

    }

    /**************************************************************************
     *
     * Obtener siguiente
     *
     **************************************************************************/

    public dequeue()

        : ExportTask | undefined {

        return this.queue.shift();

    }

    /**************************************************************************
     *
     * Consultas
     *
     **************************************************************************/

    public peek()

        : ExportTask | undefined {

        return this.queue[0];

    }

    public all()

        : ReadonlyArray<ExportTask> {

        return this.queue;

    }

    public isEmpty()

        : boolean {

        return this.queue.length === 0;

    }

    public count()

        : number {

        return this.queue.length;

    }

    public clear()

        : void {

        this.queue.length = 0;

    }

    /**************************************************************************
     *
     * Buscar
     *
     **************************************************************************/

    public find(

        id: string

    ): ExportTask | undefined {

        return this.queue.find(

            task =>

                task.id === id

        );

    }

    public remove(

        id: string

    ): boolean {

        const index =

            this.queue.findIndex(

                task =>

                    task.id === id

            );

        if (

            index < 0

        ) {

            return false;

        }

        this.queue.splice(

            index,

            1

        );

        return true;

    }

}
