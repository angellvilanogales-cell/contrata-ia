/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * OPENAI PROVIDER
 *
 * Adaptador oficial para OpenAI.
 *
 ******************************************************************************/

import {

    AIProvider,
    AIProviderType,
    AIRequest,
    AIResponse,
    AIHealth,
    AIModel,
    AIUsage

} from "./AIProvider";

export interface OpenAIConfiguration{

    apiKey:string;

    endpoint?:string;

    organization?:string;

    timeout?:number;

    defaultModel?:string;

}

export class OpenAIProvider implements AIProvider{

    public readonly provider=

        AIProviderType.OPENAI;

    public readonly name=

        "OpenAI";

    public readonly version=

        "1.0.0";

    private readonly configuration:

        OpenAIConfiguration;

    constructor(

        configuration:OpenAIConfiguration

    ){

        this.configuration={

            endpoint:

                "https://api.openai.com/v1/chat/completions",

            timeout:60000,

            defaultModel:"gpt-5.5",

            ...configuration

        };

    }

    /**********************************************************************
     * GENERATE
     **********************************************************************/

    public async generate(

        request:AIRequest

    ):Promise<AIResponse>{

        const controller=

            new AbortController();

        const timeout=

            setTimeout(

                ()=>controller.abort(),

                this.configuration.timeout

            );

        try{

            const response=

                await fetch(

                    this.configuration.endpoint!,

                    {

                        method:"POST",

                        signal:controller.signal,

                        headers:this.buildHeaders(),

                        body:JSON.stringify({

                            model:

                                request.model

                                ??

                                this.configuration.defaultModel,

                            messages:

                                request.messages,

                            temperature:

                                request.temperature,

                            top_p:

                                request.topP,

                            max_completion_tokens:

                                request.maxTokens,

                            frequency_penalty:

                                request.frequencyPenalty,

                            presence_penalty:

                                request.presencePenalty,

                            stream:

                                request.stream

                                ??false

                        })

                    }

                );

            if(

                !response.ok

            ){

                const body=

                    await response.text();

                throw new Error(

                    `OpenAI Error ${response.status}: ${body}`

                );

            }

            const json:any=

                await response.json();

            const usage:AIUsage|undefined=

                json.usage

                ?{

                    promptTokens:

                        json.usage.prompt_tokens,

                    completionTokens:

                        json.usage.completion_tokens,

                    totalTokens:

                        json.usage.total_tokens

                }

                :undefined;

            return{

                provider:

                    AIProviderType.OPENAI,

                model:

                    json.model,

                text:

                    json.choices?.[0]?.message?.content

                    ??

                    "",

                finishReason:

                    json.choices?.[0]?.finish_reason,

                usage,

                raw:json

            };

        }

        finally{

            clearTimeout(

                timeout

            );

        }

    }

    /**********************************************************************
     * HEALTH
     **********************************************************************/

    public async healthCheck()

        :Promise<AIHealth>{

        const started=

            Date.now();

        try{

            const response=

                await fetch(

                    "https://api.openai.com/v1/models",

                    {

                        headers:

                            this.buildHeaders()

                    }

                );

            return{

                provider:

                    AIProviderType.OPENAI,

                available:

                    response.ok,

                latencyMilliseconds:

                    Date.now()-started,

                message:

                    response.ok

                    ?"OK"

                    :`HTTP ${response.status}`

            };

        }

        catch(

            error

        ){

            return{

                provider:

                    AIProviderType.OPENAI,

                available:false,

                latencyMilliseconds:

                    Date.now()-started,

                message:

                    error instanceof Error

                    ?error.message

                    :"Unknown error"

            };

        }

    }

    /**********************************************************************
     * MODELS
     **********************************************************************/

    public async listModels()

        :Promise<AIModel[]>{

        const response=

            await fetch(

                "https://api.openai.com/v1/models",

                {

                    headers:

                        this.buildHeaders()

                }

            );

        if(

            !response.ok

        ){

            return[];

        }

        const json:any=

            await response.json();

        return(

            json.data

            ??

            []

        ).map(

            (model:any):AIModel=>({

                id:model.id,

                name:model.id,

                contextWindow:128000,

                supportsStreaming:true,

                supportsFunctions:true,

                supportsVision:true

            })

        );

    }

    /**********************************************************************
     * HEADERS
     **********************************************************************/

    private buildHeaders()

        :Record<string,string>{

        const headers:Record<string,string>={

            "Authorization":

                `Bearer ${this.configuration.apiKey}`,

            "Content-Type":

                "application/json"

        };

        if(

            this.configuration.organization

        ){

            headers["OpenAI-Organization"]=

                this.configuration.organization;

        }

        return headers;

    }

    /**********************************************************************
     * CONFIGURATION
     **********************************************************************/

    public getConfiguration()

        :Readonly<OpenAIConfiguration>{

        return Object.freeze(

            this.configuration

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
