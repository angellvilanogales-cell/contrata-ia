/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * HEALTH CHECK
 *
 ******************************************************************************/

export enum HealthStatus {

    HEALTHY = "HEALTHY",

    WARNING = "WARNING",

    ERROR = "ERROR"

}

export interface HealthResult {

    component: string;

    status: HealthStatus;

    message: string;

    timestamp: string;

    duration: number;

    details?: Record<string, unknown>;

}

export interface HealthChecker {

    readonly component: string;

    check(): Promise<HealthResult>;

}

export abstract class AbstractHealthCheck

    implements HealthChecker {

    public abstract readonly component: string;

    public async check()

        : Promise<HealthResult> {

        const started =

            Date.now();

        try {

            const details =

                await this.execute();

            return {

                component:

                    this.component,

                status:

                    HealthStatus.HEALTHY,

                message:

                    "OK",

                timestamp:

                    new Date()

                        .toISOString(),

                duration:

                    Date.now() - started,

                details

            };

        }

        catch (

            error

        ) {

            return {

                component:

                    this.component,

                status:

                    HealthStatus.ERROR,

                message:

                    error instanceof Error

                        ? error.message

                        : "Unknown error",

                timestamp:

                    new Date()

                        .toISOString(),

                duration:

                    Date.now() - started

            };

        }

    }

    protected abstract execute()

        : Promise<Record<string, unknown>>;

}
