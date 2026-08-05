/******************************************************************************
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * OLLAMA ADAPTER
 *
 * Adaptador para servidores Ollama.
 *
 * Compatible con cualquier modelo local:
 *
 *  - llama3
 *  - mistral
 *  - deepseek
 *  - qwen
 *  - codellama
 *  - etc.
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

export interface OllamaConfiguration{

    baseUrl?:string;

    timeoutMilliseconds?:number;

}

export class OllamaAdapter implements AIProvider{

    public readonly provider=

        AIProviderType.OLLAMA;

    public readonly name=

        "Ollama";

    public readonly version=

        "1.0.0";

    private readonly configuration:

        OllamaConfiguration;

    constructor(

        configuration?:OllamaConfiguration

    ){

        this.configuration={

            baseUrl:

                "http://localhost:11434",

            timeoutMilliseconds:

                60000,

            ...configuration

        };

    }

    /**********************************************************************
     * GENERATE
     **********************************************************************/

    public async generate(

        request:AIRequest

    ):Promise<AIResponse>{

        const endpoint=

            `${this.configuration.baseUrl}/api/chat`;

        const response=

            await fetch(

                endpoint,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":

                            "application/json"

                    },

                    body:JSON.stringify({

                        model:

                            request.model,

                        messages:

                            request.messages,

                        stream:false,

                        options:{

                            temperature:

                                request.temperature,

                            top_p:

                                request.topP

                        }

                    })

                }

            );

        if(

            !response.ok

        ){

            throw new Error(

                `Ollama Error (${response.status})`

            );

        }

        const json=

            await response.json();

        const usage:AIUsage={

            promptTokens:

                json.prompt_eval_count ?? 0,

            completionTokens:

                json.eval_count ?? 0,

            totalTokens:

                (

                    json.prompt_eval_count ??0

                )

                +

                (

                    json.eval_count ??0

                )

        };

        return{

            provider:

                AIProviderType.OLLAMA,

            model:

                json.model,

            text:

                json.message?.content

                ?? "",

            finishReason:

                json.done_reason,

            usage,

            raw:

                json

        };

    }

    /**********************************************************************
     * HEALTH CHECK
     **********************************************************************/

    public async healthCheck()

        :Promise<AIHealthStatus>{

        const started=

            Date.now();

        try{

            const response=

                await fetch(

                    `${this.configuration.baseUrl}/api/tags`

                );

            return{

                available:

                    response.ok,

                provider:

                    AIProviderType.OLLAMA,

                latencyMilliseconds:

                    Date.now()-started,

                message:

                    response.ok

                    ? "OK"

                    : `HTTP ${response.status}`

            };

        }

        catch(error){

            return{

                available:false,

                provider:

                    AIProviderType.OLLAMA,

                latencyMilliseconds:

                    Date.now()-started,

                message:

                    error instanceof Error

                    ? error.message

                    : "Unknown error"

            };

        }

    }

    /**********************************************************************
     * LIST MODELS
     **********************************************************************/

    public async listModels()

        :Promise<string[]>{

        const response=

            await fetch(

                `${this.configuration.baseUrl}/api/tags`

            );

        if(

            !response.ok

        ){

            throw new Error(

                "Unable to retrieve Ollama models."

            );

        }

        const json=

            await response.json();

        return(

            json.models ?? []

        ).map(

            (m:any)=>

                m.name

        );

    }

    /**********************************************************************
     * PULL MODEL
     **********************************************************************/

    public async pullModel(

        model:string

    ):Promise<void>{

        await fetch(

            `${this.configuration.baseUrl}/api/pull`,

            {

                method:"POST",

                headers:{

                    "Content-Type":

                        "application/json"

                },

                body:JSON.stringify({

                    name:model,

                    stream:false

                })

            }

        );

    }

    /**********************************************************************
     * DELETE MODEL
     **********************************************************************/

    public async deleteModel(

        model:string

    ):Promise<void>{

        await fetch(

            `${this.configuration.baseUrl}/api/delete`,

            {

                method:"DELETE",

                headers:{

                    "Content-Type":

                        "application/json"

                },

                body:JSON.stringify({

                    name:model

                })

            }

        );

    }

    /**********************************************************************
     * DISPOSE
     **********************************************************************/

    public async dispose()

        :Promise<void>{

        return;

    }

}
