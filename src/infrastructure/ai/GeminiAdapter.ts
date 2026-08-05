/******************************************************************************
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * GEMINI ADAPTER
 *
 * Adaptador para Google Gemini.
 ******************************************************************************/

import {
    AIProvider,
    AIProviderType,
    AIRequest,
    AIResponse,
    AIHealthStatus,
    AIUsage
} from "./AIProvider";

export interface GeminiConfiguration {

    apiKey: string;

    baseUrl?: string;

    timeoutMilliseconds?: number;

}

export class GeminiAdapter implements AIProvider {

    public readonly provider = AIProviderType.GEMINI;

    public readonly name = "Google Gemini";

    public readonly version = "1.0.0";

    private readonly configuration: GeminiConfiguration;

    constructor(configuration: GeminiConfiguration) {

        this.configuration = {

            baseUrl:
                "https://generativelanguage.googleapis.com/v1beta",

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

            `${this.configuration.baseUrl}/models/${request.model}:generateContent?key=${this.configuration.apiKey}`;

        const body = {

            contents: [

                {

                    role: "user",

                    parts: request.messages.map(message => ({

                        text:

                            `[${message.role}] ${message.content}`

                    }))

                }

            ],

            generationConfig: {

                temperature:

                    request.temperature,

                topP:

                    request.topP,

                maxOutputTokens:

                    request.maxTokens

            }

        };

        const response = await fetch(

            endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json"

                },

                body: JSON.stringify(body)

            }

        );

        if (!response.ok) {

            throw new Error(

                `Gemini Error (${response.status})`

            );

        }

        const json = await response.json();

        const text =

            json.candidates?.[0]

                ?.content

                ?.parts

                ?.map(

                    (p: any) => p.text

                )

                ?.join("")

            ?? "";

        const usage: AIUsage | undefined =

            json.usageMetadata

                ? {

                    promptTokens:

                        json.usageMetadata.promptTokenCount ?? 0,

                    completionTokens:

                        json.usageMetadata.candidatesTokenCount ?? 0,

                    totalTokens:

                        json.usageMetadata.totalTokenCount ?? 0

                }

                : undefined;

        return {

            provider:

                AIProviderType.GEMINI,

            model:

                request.model,

            text,

            finishReason:

                json.candidates?.[0]?.finishReason,

            usage,

            raw:

                json

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

                `${this.configuration.baseUrl}/models?key=${this.configuration.apiKey}`

            );

            return {

                available:

                    response.ok,

                provider:

                    AIProviderType.GEMINI,

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

                provider:

                    AIProviderType.GEMINI,

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

            `${this.configuration.baseUrl}/models?key=${this.configuration.apiKey}`

        );

        if (!response.ok) {

            throw new Error(

                "Unable to retrieve Gemini models."

            );

        }

        const json = await response.json();

        return (

            json.models ?? []

        ).map(

            (model: any) =>

                model.name

        );

    }

    /**********************************************************************
     * DISPOSE
     **********************************************************************/

    public async dispose()

        : Promise<void> {

        return;

    }

}
