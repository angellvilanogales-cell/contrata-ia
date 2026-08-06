/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT PROGRESS TRACKER
 *
 * Seguimiento del progreso de las exportaciones.
 *
 ******************************************************************************/

export interface ExportProgress {

    sessionId: string;

    totalTasks: number;

    completedTasks: number;

    failedTasks: number;

    currentTask?: string;

    percentage: number;

    startedAt: string;

    updatedAt: string;

}

export class ExportProgressTracker {

    private progress: ExportProgress;

    constructor(

        sessionId: string,

        totalTasks: number

    ) {

        this.progress = {

            sessionId,

            totalTasks,

            completedTasks: 0,

            failedTasks: 0,

            percentage: 0,

            startedAt:

                new Date().toISOString(),

            updatedAt:

                new Date().toISOString()

        };

    }

    /**************************************************************************
     *
     * Inicio de tarea
     *
     **************************************************************************/

    public startTask(

        task: string

    ): void {

        this.progress.currentTask =

            task;

        this.touch();

    }

    /**************************************************************************
     *
     * Tarea completada
     *
     **************************************************************************/

    public completeTask(): void {

        this.progress.completedTasks++;

        this.calculate();

    }

    /**************************************************************************
     *
     * Tarea fallida
     *
     **************************************************************************/

    public failTask(): void {

        this.progress.failedTasks++;

        this.calculate();

    }

    /**************************************************************************
     *
     * Actualización
     *
     **************************************************************************/

    private calculate(): void {

        const processed =

            this.progress.completedTasks +

            this.progress.failedTasks;

        this.progress.percentage =

            this.progress.totalTasks === 0

                ? 100

                : Math.round(

                    processed *

                    100 /

                    this.progress.totalTasks

                );

        this.touch();

    }

    private touch(): void {

        this.progress.updatedAt =

            new Date()

                .toISOString();

    }

    /**************************************************************************
     *
     * Consulta
     *
     **************************************************************************/

    public getProgress()

        : ExportProgress {

        return {

            ...this.progress

        };

    }

    public finished()

        : boolean {

        return (

            this.progress.completedTasks +

            this.progress.failedTasks

        ) >=

        this.progress.totalTasks;

    }

}
