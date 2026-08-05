/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * HEALTH REPORT
 *
 ******************************************************************************/

import {

    HealthChecker,
    HealthResult,
    HealthStatus

} from "./HealthCheck";

export interface HealthSummary {

    timestamp: string;

    duration: number;

    overallStatus: HealthStatus;

    totalChecks: number;

    healthy: number;

    warnings: number;

    errors: number;

    results: HealthResult[];

}

export class HealthReport {

    private readonly checkers: HealthChecker[] = [];

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public register(

        checker: HealthChecker

    ): void {

        this.checkers.push(

            checker

        );

    }

    /**************************************************************************
     *
     * Ejecución
     *
     **************************************************************************/

    public async run()

        : Promise<HealthSummary> {

        const started =

            Date.now();

        const results: HealthResult[] = [];

        for (

            const checker

            of this.checkers

        ) {

            results.push(

                await checker.check()

            );

        }

        const healthy =

            results.filter(

                r =>

                    r.status ===

                    HealthStatus.HEALTHY

            ).length;

        const warnings =

            results.filter(

                r =>

                    r.status ===

                    HealthStatus.WARNING

            ).length;

        const errors =

            results.filter(

                r =>

                    r.status ===

                    HealthStatus.ERROR

            ).length;

        let overall =

            HealthStatus.HEALTHY;

        if (

            errors > 0

        ) {

            overall =

                HealthStatus.ERROR;

        }

        else if (

            warnings > 0

        ) {

            overall =

                HealthStatus.WARNING;

        }

        return {

            timestamp:

                new Date()

                    .toISOString(),

            duration:

                Date.now() - started,

            overallStatus:

                overall,

            totalChecks:

                results.length,

            healthy,

            warnings,

            errors,

            results

        };

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public count()

        : number {

        return this.checkers.length;

    }

    public clear()

        : void {

        this.checkers.length = 0;

    }

    public components()

        : string[] {

        return this.checkers.map(

            checker =>

                checker.component

        );

    }

}
