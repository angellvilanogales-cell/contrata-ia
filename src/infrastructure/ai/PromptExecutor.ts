/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PROMPT EXECUTOR
 *
 ******************************************************************************/

import { AIProvider } from "./AIProvider";
import {
    AIProviderRequest,
    AIProviderResponse
} from "./AIProvider";

import { RetryPolicy } from "./RetryPolicy";
import { CircuitBreaker } from "./CircuitBreaker";
import { AICache } from "./AICache";

/*===========================================================================
=
= OPCIONES
=
===========================================================================*/

export interface PromptExecutionOptions{

    useCache:boolean;

    useRetry:boolean;

    useCircuitBreaker:boolean;

}

/*===========================================================================
=
= EJECUTOR
=
===========================================================================*/

export class PromptExecutor{

    constructor(

        private readonly retryPolicy:RetryPolicy,

        private readonly circuitBreaker:CircuitBreaker,

        private readonly cache:AICache

    ){

    }

/*===========================================================================
=
= EJECUCIÓN
=
===========================================================================*/

    public async execute(

        provider:AIProvider,

        request:AIProviderRequest,

        options?:Partial<PromptExecutionOptions>

    ):Promise<AIProviderResponse>{

        const configuration:PromptExecutionOptions={

            useCache:

                options?.useCache??true,

            useRetry:

                options?.useRetry??true,

            useCircuitBreaker:

                options?.useCircuitBreaker??true

        };

        if(

            configuration.useCache

        ){

            const cached=

                this.cache.get(

                    request

                );

            if(

                cached

            ){

                return cached;

            }

        }

        let response:AIProviderResponse;

        const execution=

            ()=>provider.generate(

                request

            );

        if(

            configuration.useRetry &&

            configuration.useCircuitBreaker

        ){

            response=

                await this.circuitBreaker.execute(

                    ()=>this.retryPolicy.execute(

                        execution

                    )

                );

        }

        else if(

            configuration.useRetry

        ){

            response=

                await this.retryPolicy.execute(

                    execution

                );

        }

        else if(

            configuration.useCircuitBreaker

        ){

            response=

                await this.circuitBreaker.execute(

                    execution

                );

        }

        else{

            response=

                await execution();

        }

        if(

            configuration.useCache

        ){

            this.cache.put(

                request,

                response

            );

        }

        return response;

    }

/*===========================================================================
=
= STREAMING
=
===========================================================================*/

    public async executeStreaming(

        provider:AIProvider,

        request:AIProviderRequest

    ):Promise<ReadableStream<string>>{

        if(

            !provider.stream

        ){

            throw new Error(

                "Streaming not supported."

            );

        }

        return await provider.stream(

            request

        );

    }

/*===========================================================================
=
= VALIDACIÓN
=
===========================================================================*/

    public validate(

        provider:AIProvider

    ):boolean{

        return(

            provider!==undefined &&

            provider!==null

        );

    }

/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

    public information(){

        return{

            retry:

                this.retryPolicy

                    .configurationReport(),

            circuit:

                this.circuitBreaker

                    .configurationReport(),

            cache:

                this.cache

                    .statistics()

        };

    }

}
