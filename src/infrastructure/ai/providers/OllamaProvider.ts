/******************************************************************************
 * OllamaProvider
 *
 * Implementación del proveedor local Ollama.
 *
 * Permite ejecutar modelos LLM completamente offline.
 ******************************************************************************/

import {
    AIProvider,
    AIProviderRequest,
    AIProviderResponse
} from "../AIProvider";

export class OllamaProvider implements AIProvider {

    public readonly id = "ollama";

    public readonly name = "Ollama";

    public readonly supportsStreaming = true;

    constructor(

        private readonly baseUrl: string = "http://localhost:11434",

        private readonly model: string = "llama3.1"

    ) {}

    public async generate(

        request: AIProviderRequest

    ): Promise<AIProviderResponse> {

        const prompt = this.buildPrompt(request);

        const response = await fetch(

            `${this.baseUrl}/api/generate`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    model: this.model,

                    prompt,

                    stream: false,

                    options: {

                        temperature:

                            request.temperature ?? 0.2,

                        num_predict:

                            request.maxTokens ?? 4096

                    }

                })

            }

        );

        if (

            !response.ok

        ) {

            throw new Error(

                `Ollama error ${response.status}`

            );

        }

        const json = await response.json();

        return {

            provider: this.id,

            model: this.model,

            text: json.response ?? "",

            inputTokens:

                json.prompt_eval_count ?? 0,

            outputTokens:

                json.eval_count ?? 0,

            finishReason:

                json.done_reason ?? "stop",

            raw: json

        };

    }

    public async healthCheck()

        : Promise<boolean> {

        try {

            const response = await fetch(

                `${this.baseUrl}/api/tags`

            );

            return response.ok;

        }

        catch {

            return false;

        }

    }

    private buildPrompt(

        request: AIProviderRequest

    ): string {

        if (

            request.systemPrompt

        ) {

            return [

                "SYSTEM",

                request.systemPrompt,

                "",

                "USER",

                request.prompt

            ].join("\n");

        }

        return request.prompt;

    }

}
