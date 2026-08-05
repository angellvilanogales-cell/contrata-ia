/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CIRCUIT BREAKER
 *
 * Protección frente a proveedores IA inestables.
 *
 ******************************************************************************/

export enum CircuitState{

    CLOSED="CLOSED",

    OPEN="OPEN",

    HALF_OPEN="HALF_OPEN"

}

export interface CircuitBreakerConfiguration{

    failureThreshold:number;

    successThreshold:number;

    timeout:number;

}

export interface CircuitBreakerStatistics{

    executions:number;

    failures:number;

    successes:number;

    rejected:number;

    state:CircuitState;

}

export class CircuitBreaker{

    private readonly configuration:CircuitBreakerConfiguration;

    private state:CircuitState=

        CircuitState.CLOSED;

    private failures=0;

    private successes=0;

    private lastFailureTime=0;

    private readonly statistics:CircuitBreakerStatistics={

        executions:0,

        failures:0,

        successes:0,

        rejected:0,

        state:CircuitState.CLOSED

    };

    constructor(

        configuration?:Partial<CircuitBreakerConfiguration>

    ){

        this.configuration={

            failureThreshold:

                configuration?.failureThreshold??5,

            successThreshold:

                configuration?.successThreshold??2,

            timeout:

                configuration?.timeout??30000

        };

    }

/*===========================================================================
=
= EJECUCIÓN PROTEGIDA
=
===========================================================================*/

    public async execute<T>(

        operation:()=>Promise<T>

    ):Promise<T>{

        this.statistics.executions++;

        if(

            this.state===CircuitState.OPEN

        ){

            if(

                !this.canRetry()

            ){

                this.statistics.rejected++;

                throw new Error(

                    "Circuit Breaker OPEN"

                );

            }

            this.state=

                CircuitState.HALF_OPEN;

        }

        try{

            const result=

                await operation();

            this.onSuccess();

            return result;

        }

        catch(

            error

        ){

            this.onFailure();

            throw error;

        }

    }

/*===========================================================================
=
= ÉXITO
=
===========================================================================*/

    private onSuccess()

        :void{

        this.successes++;

        this.statistics.successes++;

        if(

            this.state===CircuitState.HALF_OPEN

        ){

            if(

                this.successes>=

                this.configuration.successThreshold

            ){

                this.close();

            }

        }

        else{

            this.failures=0;

        }

    }

/*===========================================================================
=
= FALLO
=
===========================================================================*/

    private onFailure()

        :void{

        this.failures++;

        this.statistics.failures++;

        this.lastFailureTime=

            Date.now();

        if(

            this.failures>=

            this.configuration.failureThreshold

        ){

            this.open();

        }

    }

/*===========================================================================
=
= APERTURA
=
===========================================================================*/

    private open()

        :void{

        this.state=

            CircuitState.OPEN;

        this.statistics.state=

            CircuitState.OPEN;

    }

/*===========================================================================
=
= CIERRE
=
===========================================================================*/

    private close()

        :void{

        this.state=

            CircuitState.CLOSED;

        this.statistics.state=

            CircuitState.CLOSED;

        this.failures=0;

        this.successes=0;

    }

/*===========================================================================
=
= REINTENTO
=
===========================================================================*/

    private canRetry()

        :boolean{

        return(

            Date.now()-

            this.lastFailureTime

        )>

        this.configuration.timeout;

    }

/*===========================================================================
=
= RESET
=
===========================================================================*/

    public reset()

        :void{

        this.close();

        this.statistics.executions=0;

        this.statistics.failures=0;

        this.statistics.successes=0;

        this.statistics.rejected=0;

    }

/*===========================================================================
=
= CONSULTAS
=
===========================================================================*/

    public currentState()

        :CircuitState{

        return this.state;

    }

    public isOpen()

        :boolean{

        return this.state===

            CircuitState.OPEN;

    }

    public isClosed()

        :boolean{

        return this.state===

            CircuitState.CLOSED;

    }

    public isHalfOpen()

        :boolean{

        return this.state===

            CircuitState.HALF_OPEN;

    }

/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

    public statisticsReport()

        :CircuitBreakerStatistics{

        return{

            ...this.statistics,

            state:this.state

        };

    }

    public configurationReport()

        :CircuitBreakerConfiguration{

        return{

            ...this.configuration

        };

    }

}
