/******************************************************************************
 * AnthropicProvider
 *
 * Implementación del proveedor Claude (Anthropic).
 ******************************************************************************/

import {
    AIProvider,
    AIProviderRequest,
    AIProviderResponse
} from "../AIProvider";

export class AnthropicProvider implements AIProvider {

    public readonly id = "anthropic";

    public readonly name = "Anthropic Claude";

    public readonly supportsStreaming = true;

    constructor(

        private readonly apiKey: string,

        private readonly model: string = "claude-sonnet-4"

    ) {}

    public async generate(

        request: AIProviderRequest

    ): Promise<AIProviderResponse> {

        const response = await fetch(

            "https://api.anthropic.com/v1/messages",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "x-api-key": this.apiKey,

                    "anthropic-version": "2023-06-01"

                },

                body: JSON.stringify({

                    model: this.model,

                    max_tokens: request.maxTokens ?? 4096,

                    temperature: request.temperature ?? 0.2,

                    system: request.systemPrompt,

                    messages: [

                        {

                            role: "user",

                            content: request.prompt

                        }

                    ]

                })

            }

        );

        if (!response.ok) {

            throw new Error(

                `Anthropic error ${response.status}`

            );

        }

        const json = await response.json();

        return {

            provider: this.id,

            model: this.model,

            text:

                json.content?.[0]?.text ?? "",

            inputTokens:

                json.usage?.input_tokens ?? 0,

            outputTokens:

                json.usage?.output_tokens ?? 0,

            finishReason:

                json.stop_reason ?? "stop",

            raw: json

        };

    }

    public async healthCheck(): Promise<boolean> {

        try {

            await this.generate({

                prompt: "Ping",

                maxTokens: 5

            });

            return true;

        }

        catch {

            return false;

        }

    }

}
