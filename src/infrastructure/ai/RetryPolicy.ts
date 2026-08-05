/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * RETRY POLICY
 *
 * Política reutilizable de reintentos para proveedores IA.
 *
 ******************************************************************************/

export interface RetryConfiguration{

    maximumRetries:number;

    initialDelay:number;

    maximumDelay:number;

    exponentialBackoff:boolean;

    retryOnTimeout:boolean;

    retryOnNetworkError:boolean;

}

export interface RetryStatistics{

    executions:number;

    retries:number;

    failures:number;

    successes:number;

}

export class RetryPolicy{

    private readonly configuration:RetryConfiguration;

    private readonly statistics:RetryStatistics={

        executions:0,

        retries:0,

        failures:0,

        successes:0

    };

    constructor(

        configuration?:Partial<RetryConfiguration>

    ){

        this.configuration={

            maximumRetries:

                configuration?.maximumRetries??3,

            initialDelay:

                configuration?.initialDelay??1000,

            maximumDelay:

                configuration?.maximumDelay??10000,

            exponentialBackoff:

                configuration?.exponentialBackoff??true,

            retryOnTimeout:

                configuration?.retryOnTimeout??true,

            retryOnNetworkError:

                configuration?.retryOnNetworkError??true

        };

    }

    public async execute<T>(

        operation:()=>Promise<T>

    ):Promise<T>{

        this.statistics.executions++;

        let lastError:unknown;

        for(

            let attempt=1;

            attempt<=this.configuration.maximumRetries;

            attempt++

        ){

            try{

                const result=

                    await operation();

                this.statistics.successes++;

                return result;

            }

            catch(

                error

            ){

                lastError=error;

                if(

                    attempt===

                    this.configuration.maximumRetries

                ){

                    break;

                }

                if(

                    !this.shouldRetry(

                        error

                    )

                ){

                    break;

                }

                this.statistics.retries++;

                await this.sleep(

                    this.calculateDelay(

                        attempt

                    )

                );

            }

        }

        this.statistics.failures++;

        throw lastError;

    }

    private shouldRetry(

        error:unknown

    ):boolean{

        if(

            !(error instanceof Error)

        ){

            return false;

        }

        const message=

            error.message.toLowerCase();

        if(

            message.includes(

                "timeout"

            )

        ){

            return this.configuration.retryOnTimeout;

        }

        if(

            message.includes(

                "network"

            )

            ||

            message.includes(

                "connection"

            )

        ){

            return this.configuration.retryOnNetworkError;

        }

        return true;

    }

    private calculateDelay(

        attempt:number

    ):number{

        if(

            !this.configuration.exponentialBackoff

        ){

            return this.configuration.initialDelay;

        }

        const delay=

            this.configuration.initialDelay*

            Math.pow(

                2,

                attempt-1

            );

        return Math.min(

            delay,

            this.configuration.maximumDelay

        );

    }

    private sleep(

        milliseconds:number

    ):Promise<void>{

        return new Promise(

            resolve=>

                setTimeout(

                    resolve,

                    milliseconds

                )

        );

    }

    public statisticsReport()

        :RetryStatistics{

        return{

            ...this.statistics

        };

    }

    public reset()

        :void{

        this.statistics.executions=0;

        this.statistics.retries=0;

        this.statistics.failures=0;

        this.statistics.successes=0;

    }

    public configurationReport()

        :RetryConfiguration{

        return{

            ...this.configuration

        };

    }

}
