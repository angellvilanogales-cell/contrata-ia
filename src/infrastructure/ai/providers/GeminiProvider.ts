/******************************************************************************
 * GeminiProvider
 *
 * Implementación del proveedor Google Gemini.
 ******************************************************************************/

import {
    AIProvider,
    AIProviderRequest,
    AIProviderResponse
} from "../AIProvider";

export class GeminiProvider implements AIProvider {

    public readonly id = "gemini";

    public readonly name = "Google Gemini";

    public readonly supportsStreaming = true;

    constructor(

        private readonly apiKey: string,

        private readonly model: string = "gemini-2.5-pro"

    ) {}

    public async generate(

        request: AIProviderRequest

    ): Promise<AIProviderResponse> {

        const response = await fetch(

            `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    generationConfig: {

                        temperature:

                            request.temperature ?? 0.2,

                        maxOutputTokens:

                            request.maxTokens ?? 4096

                    },

                    systemInstruction:

                        request.systemPrompt

                            ? {

                                parts: [

                                    {

                                        text:

                                            request.systemPrompt

                                    }

                                ]

                            }

                            : undefined,

                    contents: [

                        {

                            role: "user",

                            parts: [

                                {

                                    text:

                                        request.prompt

                                }

                            ]

                        }

                    ]

                })

            }

        );

        if (

            !response.ok

        ) {

            throw new Error(

                `Gemini error ${response.status}`

            );

        }

        const json =

            await response.json();

        const candidate =

            json.candidates?.[0];

        const text =

            candidate?.content?.parts

                ?.map(

                    (p: any) => p.text ?? ""

                )

                .join("") ?? "";

        return {

            provider:

                this.id,

            model:

                this.model,

            text,

            inputTokens:

                json.usageMetadata

                    ?.promptTokenCount ?? 0,

            outputTokens:

                json.usageMetadata

                    ?.candidatesTokenCount ?? 0,

            finishReason:

                candidate?.finishReason ?? "STOP",

            raw:

                json

        };

    }

    public async healthCheck()

        : Promise<boolean> {

        try {

            await this.generate({

                prompt:

                    "Ping",

                maxTokens:

                    5

            });

            return true;

        }

        catch {

            return false;

        }

    }

}
