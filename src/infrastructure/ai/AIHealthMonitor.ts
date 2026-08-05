/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI HEALTH MONITOR
 *
 * Supervisión permanente del estado de la infraestructura IA.
 *
 ******************************************************************************/

import { AIObservability, AIHealthStatus } from "./AIObservability";

export interface AIHealthRecord{

    timestamp:string;

    status:AIHealthStatus;

    message:string;

}

export class AIHealthMonitor{

    private readonly history:AIHealthRecord[]=[];

    private monitoring=false;

    private timer?:NodeJS.Timeout;

    constructor(

        private readonly observability:AIObservability

    ){

    }

/*===========================================================================
=
= INICIO
=
===========================================================================*/

    public start(

        interval:number=30000

    ):void{

        if(

            this.monitoring

        ){

            return;

        }

        this.monitoring=true;

        this.timer=setInterval(

            ()=>{

                this.performHealthCheck();

            },

            interval

        );

    }

/*===========================================================================
=
= PARADA
=
===========================================================================*/

    public stop()

        :void{

        if(

            this.timer

        ){

            clearInterval(

                this.timer

            );

        }

        this.timer=undefined;

        this.monitoring=false;

    }

/*===========================================================================
=
= HEALTH CHECK
=
===========================================================================*/

    public performHealthCheck()

        :AIHealthRecord{

        const status=

            this.observability.healthStatus();

        const record:AIHealthRecord={

            timestamp:

                new Date()

                    .toISOString(),

            status,

            message:

                this.buildMessage(

                    status

                )

        };

        this.history.push(

            record

        );

        this.cleanup();

        return record;

    }

/*===========================================================================
=
= MENSAJE
=
===========================================================================*/

    private buildMessage(

        status:AIHealthStatus

    ):string{

        switch(

            status

        ){

            case AIHealthStatus.HEALTHY:

                return "Infrastructure operating normally.";

            case AIHealthStatus.DEGRADED:

                return "Infrastructure operating with degraded performance.";

            case AIHealthStatus.CRITICAL:

                return "Infrastructure requires immediate attention.";

            default:

                return "Unknown status.";

        }

    }

/*===========================================================================
=
= HISTORIAL
=
===========================================================================*/

    public historyReport()

        :ReadonlyArray<AIHealthRecord>{

        return Object.freeze(

            [

                ...this.history

            ]

        );

    }

/*===========================================================================
=
= ÚLTIMO REGISTRO
=
===========================================================================*/

    public latest()

        :AIHealthRecord|undefined{

        return this.history.at(

            -1

        );

    }

/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

    private cleanup()

        :void{

        if(

            this.history.length>

            1000

        ){

            this.history.splice(

                0,

                500

            );

        }

    }

/*===========================================================================
=
= RESET
=
===========================================================================*/

    public clear()

        :void{

        this.history.length=0;

    }

/*===========================================================================
=
= ESTADO
=
===========================================================================*/

    public isRunning()

        :boolean{

        return this.monitoring;

    }

/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

    public information(){

        return{

            monitoring:

                this.monitoring,

            checks:

                this.history.length,

            latest:

                this.latest(),

            status:

                this.observability.healthStatus()

        };

    }

}
