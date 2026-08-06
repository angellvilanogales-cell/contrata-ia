/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT SCHEDULER
 *
 * Procesador automático de la cola de exportaciones.
 *
 ******************************************************************************/

import { ExportQueue } from "./ExportQueue";
import { ExportService } from "./ExportService";

export class ExportScheduler {

    private readonly exportService =
        new ExportService();

    private running = false;

    constructor(

        private readonly queue: ExportQueue

    ) {}

    /**************************************************************************
     *
     * Inicio
     *
     **************************************************************************/

    public async start(): Promise<void> {

        if (

            this.running

        ) {

            return;

        }

        this.running = true;

        while (

            this.running

        ) {

            const task =

                this.queue.dequeue();

            if (

                !task

            ) {

                await this.sleep(

                    500

                );

                continue;

            }

            try {

                await this.exportService
                    .exportMultiple(

                        task.formats,

                        task.expediente

                    );

            }

            catch (

                error

            ) {

                console.error(

                    "ExportScheduler",

                    error

                );

            }

        }

    }

    /**************************************************************************
     *
     * Parada
     *
     **************************************************************************/

    public stop(): void {

        this.running = false;

    }

    public isRunning(): boolean {

        return this.running;

    }

    /**************************************************************************
     *
     * Utilidades
     *
     **************************************************************************/

    private sleep(

        milliseconds: number

    ): Promise<void> {

        return new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    milliseconds

                )

        );

    }

}
