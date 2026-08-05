/******************************************************************************
 * ANTHROPIC PROVIDER
 *
 * Adaptador para Anthropic Claude.
 ******************************************************************************/

import {
    AIProvider,
    AIRequest,
    AIResponse,
    AIProviderMetadata
} from "../AIProvider";

export class AnthropicProvider implements AIProvider {

    public readonly metadata: AIProviderMetadata = {

        id: "anthropic",

        name: "Anthropic Claude",

        version: "1.0.0",

        supportsStreaming: true,

        supportsJsonMode: true,

        supportsTools: true
    };

    private readonly apiKey: string;

    private readonly model: string;

    private readonly endpoint =
        "https://api.anthropic.com/v1/messages";

    constructor(

        apiKey: string,

        model = "claude-sonnet-4"

    ) {

        this.apiKey = apiKey;

        this.model = model;

    }

    public async generate(

        request: AIRequest

    ): Promise<AIResponse> {

        const body = {

            model: this.model,

            max_tokens: request.maxTokens ?? 4096,

            temperature: request.temperature ?? 0,

            messages: [

                {

                    role: "user",

                    content: request.prompt

                }

            ]
        };

        const response = await fetch(

            this.endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "x-api-key": this.apiKey,

                    "anthropic-version": "2023-06-01"

                },

                body: JSON.stringify(body)

            }

        );

        if (!response.ok) {

            throw new Error(

                `Anthropic error ${response.status}`

            );

        }

        const json: any =

            await response.json();

        return {

            provider: "anthropic",

            model: this.model,

            text:

                json.content?.[0]?.text ?? "",

            raw: json,

            usage: {

                promptTokens:

                    json.usage?.input_tokens ?? 0,

                completionTokens:

                    json.usage?.output_tokens ?? 0

            }
        };

    }

}
