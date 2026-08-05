/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * LOCAL LLM ADAPTER
 *
 * Adaptador genérico para modelos de IA ejecutados localmente.
 *
 * Este adaptador permite integrar:
 *
 * - LM Studio
 * - llama.cpp
 * - GPT4All
 * - KoboldCPP
 * - Text Generation WebUI
 * - Servidores OpenAI-Compatible
 *
 ******************************************************************************/

import {

    AIProvider,
    AIProviderType,
    AIRequest,
    AIResponse,
    AIHealthStatus,
    AIUsage

} from "./AIProvider";

export interface LocalLLMConfiguration{

    endpoint:string;

    apiKey?:string;

    timeoutMilliseconds?:number;

    providerName?:string;

}

export class LocalLLMAdapter implements AIProvider{

    public readonly provider=

        AIProviderType.LOCAL;

    public readonly name=

        "Local LLM";

    public readonly version=

        "1.0.0";

    private readonly configuration:

        LocalLLMConfiguration;

    constructor(

        configuration:LocalLLMConfiguration

    ){

        this.configuration={

            timeoutMilliseconds:60000,

            providerName:"LOCAL",

            ...configuration

        };

    }

    /**************************************************************************
     * GENERATE
     **************************************************************************/

    public async generate(

        request:AIRequest

    ):Promise<AIResponse>{

        const response=

            await fetch(

                this.configuration.endpoint,

                {

                    method:"POST",

                    headers:this.buildHeaders(),

                    body:JSON.stringify({

                        model:

                            request.model,

                        messages:

                            request.messages,

                        temperature:

                            request.temperature,

                        max_tokens:

                            request.maxTokens,

                        top_p:

                            request.topP,

                        frequency_penalty:

                            request.frequencyPenalty,

                        presence_penalty:

                            request.presencePenalty,

                        stream:false

                    })

                }

            );

        if(

            !response.ok

        ){

            throw new Error(

                `Local LLM Error (${response.status})`

            );

        }

        const json=

            await response.json();

        const usage:AIUsage|undefined=

            json.usage

            ?{

                promptTokens:

                    json.usage.prompt_tokens ??0,

                completionTokens:

                    json.usage.completion_tokens ??0,

                totalTokens:

                    json.usage.total_tokens ??0

            }

            :undefined;

        return{

            provider:

                AIProviderType.LOCAL,

            model:

                json.model

                ??request.model,

            text:

                json.choices?.[0]?.message?.content

                ??

                json.response

                ??

                "",

            finishReason:

                json.choices?.[0]?.finish_reason

                ??

                json.finish_reason,

            usage,

            raw:json

        };

    }

    /**************************************************************************
     * HEALTH CHECK
     **************************************************************************/

    public async healthCheck()

        :Promise<AIHealthStatus>{

        const started=

            Date.now();

        try{

            const response=

                await fetch(

                    this.configuration.endpoint,

                    {

                        method:"OPTIONS"

                    }

                );

            return{

                available:

                    response.ok,

                provider:

                    AIProviderType.LOCAL,

                latencyMilliseconds:

                    Date.now()-started,

                message:

                    response.ok

                    ?"OK"

                    :`HTTP ${response.status}`

            };

        }

        catch(error){

            return{

                available:false,

                provider:

                    AIProviderType.LOCAL,

                latencyMilliseconds:

                    Date.now()-started,

                message:

                    error instanceof Error

                    ?error.message

                    :"Unknown error"

            };

        }

    }

    /**************************************************************************
     * LIST MODELS
     **************************************************************************/

    public async listModels()

        :Promise<string[]>{

        try{

            const response=

                await fetch(

                    this.configuration.endpoint.replace(

                        "/chat/completions",

                        "/models"

                    ),

                    {

                        headers:this.buildHeaders()

                    }

                );

            if(

                !response.ok

            ){

                return[];

            }

            const json=

                await response.json();

            return(

                json.data

                ??

                []

            ).map(

                (m:any)=>m.id

            );

        }

        catch{

            return[];

        }

    }

    /**************************************************************************
     * HEADERS
     **************************************************************************/

    private buildHeaders()

        :Record<string,string>{

        const headers:Record<string,string>={

            "Content-Type":

                "application/json"

        };

        if(

            this.configuration.apiKey

        ){

            headers.Authorization=

                `Bearer ${this.configuration.apiKey}`;

        }

        return headers;

    }

    /**************************************************************************
     * INFORMACIÓN
     **************************************************************************/

    public getEndpoint()

        :string{

        return this.configuration.endpoint;

    }

    public getProviderName()

        :string{

        return this.configuration.providerName

            ??"LOCAL";

    }

    /**************************************************************************
     * DISPOSE
     **************************************************************************/

    public async dispose()

        :Promise<void>{

        return;

    }

}
