/******************************************************************************
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * OPENAI ADAPTER
 *
 * Adaptador para OpenAI.
 *
 * Implementa el contrato AIProvider.
 ******************************************************************************/

import {
    AIProvider,
    AIProviderType,
    AIRequest,
    AIResponse,
    AIHealthStatus,
    AIUsage
} from "./AIProvider";

export interface OpenAIConfiguration {

    apiKey: string;

    baseUrl?: string;

    organization?: string;

    project?: string;

    timeoutMilliseconds?: number;

}

export class OpenAIAdapter implements AIProvider {

    public readonly provider = AIProviderType.OPENAI;

    public readonly name = "OpenAI";

    public readonly version = "1.0.0";

    private readonly configuration: OpenAIConfiguration;

    constructor(
        configuration: OpenAIConfiguration
    ) {

        this.configuration = {

            baseUrl: "https://api.openai.com/v1",

            timeoutMilliseconds: 60000,

            ...configuration

        };

    }

    /**********************************************************************
     * GENERATE
     **********************************************************************/

    public async generate(
        request: AIRequest
    ): Promise<AIResponse> {

        const endpoint =
            `${this.configuration.baseUrl}/chat/completions`;

        const response =
            await fetch(endpoint, {

                method: "POST",

                headers: this.buildHeaders(),

                body: JSON.stringify({

                    model: request.model,

                    messages: request.messages,

                    temperature: request.temperature,

                    max_tokens: request.maxTokens,

                    top_p: request.topP,

                    frequency_penalty:
                        request.frequencyPenalty,

                    presence_penalty:
                        request.presencePenalty

                })

            });

        if (!response.ok) {

            throw new Error(

                `OpenAI Error (${response.status})`

            );

        }

        const json = await response.json();

        const usage: AIUsage | undefined =

            json.usage
                ? {

                    promptTokens:
                        json.usage.prompt_tokens,

                    completionTokens:
                        json.usage.completion_tokens,

                    totalTokens:
                        json.usage.total_tokens

                }

                : undefined;

        return {

            provider: AIProviderType.OPENAI,

            model: json.model,

            text:
                json.choices?.[0]?.message?.content
                ?? "",

            finishReason:
                json.choices?.[0]?.finish_reason,

            usage,

            raw: json

        };

    }

    /**********************************************************************
     * HEALTH CHECK
     **********************************************************************/

    public async healthCheck()

        : Promise<AIHealthStatus> {

        const started = Date.now();

        try {

            const response = await fetch(

                `${this.configuration.baseUrl}/models`,

                {

                    headers: this.buildHeaders()

                }

            );

            return {

                available: response.ok,

                provider: AIProviderType.OPENAI,

                latencyMilliseconds:

                    Date.now() - started,

                message:

                    response.ok

                        ? "OK"

                        : `HTTP ${response.status}`

            };

        }

        catch (error) {

            return {

                available: false,

                provider: AIProviderType.OPENAI,

                latencyMilliseconds:

                    Date.now() - started,

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

        : Promise<string[]> {

        const response = await fetch(

            `${this.configuration.baseUrl}/models`,

            {

                headers: this.buildHeaders()

            }

        );

        if (!response.ok) {

            throw new Error(

                "Unable to retrieve models."

            );

        }

        const json = await response.json();

        return json.data.map(

            (m: any) => m.id

        );

    }

    /**********************************************************************
     * HEADERS
     **********************************************************************/

    private buildHeaders()

        : Record<string, string> {

        const headers: Record<string, string> = {

            Authorization:

                `Bearer ${this.configuration.apiKey}`,

            "Content-Type":

                "application/json"

        };

        if (

            this.configuration.organization

        ) {

            headers["OpenAI-Organization"] =

                this.configuration.organization;

        }

        if (

            this.configuration.project

        ) {

            headers["OpenAI-Project"] =

                this.configuration.project;

        }

        return headers;

    }

    /**********************************************************************
     * DISPOSE
     **********************************************************************/

    public async dispose()

        : Promise<void> {

        return;

    }

}
