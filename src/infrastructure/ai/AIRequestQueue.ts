/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI REQUEST QUEUE
 *
 * Cola inteligente de ejecución.
 *
 ******************************************************************************/

import { UUID } from "../../domain/common/types";

/*===========================================================================
=
= PRIORIDAD
=
===========================================================================*/

export enum AIRequestPriority{

    LOW=1,

    NORMAL=5,

    HIGH=10,

    CRITICAL=100

}

/*===========================================================================
=
= ESTADO
=
===========================================================================*/

export enum AIQueueStatus{

    QUEUED="QUEUED",

    RUNNING="RUNNING",

    COMPLETED="COMPLETED",

    FAILED="FAILED",

    CANCELLED="CANCELLED"

}

/*===========================================================================
=
= PETICIÓN
=
===========================================================================*/

export interface AIQueueRequest<T=unknown>{

    id:UUID;

    created:string;

    priority:AIRequestPriority;

    status:AIQueueStatus;

    payload:T;

}

/*===========================================================================
=
= RESULTADO
=
===========================================================================*/

export interface AIQueueResult<T=unknown>{

    requestId:UUID;

    success:boolean;

    value?:T;

    error?:unknown;

}

/*===========================================================================
=
= EJECUTOR
=
===========================================================================*/

export type AIQueueExecutor=

    (request:AIQueueRequest)=>Promise<AIQueueResult>;

/*===========================================================================
=
= COLA
=
===========================================================================*/

export class AIRequestQueue{

    private readonly queue:

        AIQueueRequest[]=[];

    private readonly running=

        new Map<UUID,Promise<AIQueueResult>>();

    private maximumConcurrency=5;

    private currentConcurrency=0;

    private paused=false;

    private cancelled=false;

    private executor?:AIQueueExecutor;

    constructor(

        concurrency=5

    ){

        this.maximumConcurrency=

            concurrency;

    }

/*===========================================================================
=
= REGISTRO DEL EJECUTOR
=
===========================================================================*/

    public registerExecutor(

        executor:AIQueueExecutor

    ):void{

        this.executor=executor;

    }

/*===========================================================================
=
= INSERTAR
=
===========================================================================*/

    public enqueue(

        request:AIQueueRequest

    ):void{

        this.queue.push(

            request

        );

        this.sort();

    }

/*===========================================================================
=
= ORDENACIÓN
=
===========================================================================*/

    private sort()

        :void{

        this.queue.sort(

            (

                a,

                b

            )=>

                b.priority-a.priority

        );

    }

/*===========================================================================
=
= EJECUCIÓN
=
===========================================================================*/

    public async execute()

        :Promise<void>{

        if(

            !this.executor

        ){

            throw new Error(

                "Executor not registered."

            );

        }

        while(

            this.queue.length>0

        ){

            if(

                this.cancelled

            ){

                break;

            }

            if(

                this.paused

            ){

                await this.sleep(

                    100

                );

                continue;

            }

            if(

                this.currentConcurrency>=

                this.maximumConcurrency

            ){

                await this.sleep(

                    25

                );

                continue;

            }

            const request=

                this.queue.shift()!;

            this.dispatch(

                request

            );

        }

        while(

            this.running.size>0

        ){

            await this.sleep(

                25

            );

        }

    }

/*===========================================================================
=
= DISPATCH
=
===========================================================================*/

    private async dispatch(

        request:AIQueueRequest

    ):Promise<void>{

        this.currentConcurrency++;

        request.status=

            AIQueueStatus.RUNNING;

        const promise=

            this.executor!(

                request

            );

        this.running.set(

            request.id,

            promise

        );

        try{

            const result=

                await promise;

            request.status=

                result.success

                ?AIQueueStatus.COMPLETED

                :AIQueueStatus.FAILED;

        }

        finally{

            this.running.delete(

                request.id

            );

            this.currentConcurrency--;

        }

    }

/*===========================================================================
=
= PAUSA
=
===========================================================================*/

    public pause()

        :void{

        this.paused=true;

    }

    public resume()

        :void{

        this.paused=false;

    }

/*===========================================================================
=
= CANCELACIÓN
=
===========================================================================*/

    public cancel()

        :void{

        this.cancelled=true;

        this.queue.length=0;

    }

/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

    public clear()

        :void{

        this.queue.length=0;

    }

/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

    public setConcurrency(

        concurrency:number

    ):void{

        this.maximumConcurrency=

            Math.max(

                1,

                concurrency

            );

    }

/*===========================================================================
=
= CONSULTAS
=
===========================================================================*/

    public queued()

        :number{

        return this.queue.length;

    }

    public runningCount()

        :number{

        return this.running.size;

    }

    public idle()

        :boolean{

        return(

            this.queue.length===0

            &&

            this.running.size===0

        );

    }

/*===========================================================================
=
= UTILIDAD
=
===========================================================================*/

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

}
