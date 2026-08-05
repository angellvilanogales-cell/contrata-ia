/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI OBSERVABILITY
 *
 * Observabilidad y monitorización centralizada.
 *
 ******************************************************************************/

import { AIStatistics } from "./AIStatistics";
import { AICache } from "./AICache";
import { AIRequestQueue } from "./AIRequestQueue";
import { CircuitBreaker } from "./CircuitBreaker";
import { RetryPolicy } from "./RetryPolicy";

/*===========================================================================
=
= HEALTH STATUS
=
===========================================================================*/

export enum AIHealthStatus{

    HEALTHY="HEALTHY",

    DEGRADED="DEGRADED",

    CRITICAL="CRITICAL"

}

/*===========================================================================
=
= SNAPSHOT
=
===========================================================================*/

export interface AIObservabilitySnapshot{

    timestamp:string;

    status:AIHealthStatus;

    queueSize:number;

    runningRequests:number;

    cacheEntries:number;

    cacheHitRate:number;

    retryExecutions:number;

    retryFailures:number;

    circuitState:string;

    totalExecutions:number;

    successfulExecutions:number;

    failedExecutions:number;

    averageExecutionTime:number;

    totalTokens:number;

    totalCost:number;

}

/*===========================================================================
=
= OBSERVABILITY
=
===========================================================================*/

export class AIObservability{

    constructor(

        private readonly statistics:AIStatistics,

        private readonly cache:AICache,

        private readonly queue:AIRequestQueue,

        private readonly retry:RetryPolicy,

        private readonly circuit:CircuitBreaker

    ){

    }

/*===========================================================================
=
= SNAPSHOT
=
===========================================================================*/

    public snapshot()

        :AIObservabilitySnapshot{

        const stats=

            this.statistics.summary();

        const cache=

            this.cache.statistics();

        const retry=

            this.retry.statisticsReport();

        const circuit=

            this.circuit.statisticsReport();

        return{

            timestamp:

                new Date()

                    .toISOString(),

            status:

                this.healthStatus(),

            queueSize:

                this.queue.queued(),

            runningRequests:

                this.queue.runningCount(),

            cacheEntries:

                cache.entries,

            cacheHitRate:

                cache.hitRate,

            retryExecutions:

                retry.executions,

            retryFailures:

                retry.failures,

            circuitState:

                circuit.state,

            totalExecutions:

                stats.executions,

            successfulExecutions:

                stats.successful,

            failedExecutions:

                stats.failed,

            averageExecutionTime:

                stats.averageDuration,

            totalTokens:

                stats.totalTokens,

            totalCost:

                stats.totalCost

        };

    }

/*===========================================================================
=
= HEALTH
=
===========================================================================*/

    public healthStatus()

        :AIHealthStatus{

        const stats=

            this.statistics.summary();

        if(

            stats.executions===0

        ){

            return AIHealthStatus.HEALTHY;

        }

        const successRate=

            stats.successful/

            stats.executions;

        if(

            successRate>=0.95

        ){

            return AIHealthStatus.HEALTHY;

        }

        if(

            successRate>=0.75

        ){

            return AIHealthStatus.DEGRADED;

        }

        return AIHealthStatus.CRITICAL;

    }

/*===========================================================================
=
= INFORME
=
===========================================================================*/

    public report(){

        return{

            snapshot:

                this.snapshot(),

            statistics:

                this.statistics.summary(),

            cache:

                this.cache.statistics(),

            retry:

                this.retry.statisticsReport(),

            circuit:

                this.circuit.statisticsReport()

        };

    }

/*===========================================================================
=
= EXPORTACIÓN JSON
=
===========================================================================*/

    public export()

        :string{

        return JSON.stringify(

            this.report(),

            null,

            2

        );

    }

/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

    public reset()

        :void{

        this.statistics.clear();

        this.cache.resetStatistics();

        this.retry.reset();

        this.circuit.reset();

    }

}
