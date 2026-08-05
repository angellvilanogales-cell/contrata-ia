/******************************************************************************
 * ProviderFactory
 *
 * Fábrica centralizada de proveedores IA.
 ******************************************************************************/

import { AIProvider } from "../AIProvider";

import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OllamaProvider } from "./OllamaProvider";

export interface ProviderConfiguration {

    provider:

        "openai"

        | "anthropic"

        | "gemini"

        | "ollama";

    apiKey?: string;

    model?: string;

    baseUrl?: string;

}

export class ProviderFactory {

    public static create(

        configuration: ProviderConfiguration

    ): AIProvider {

        switch (

            configuration.provider

        ) {

            case "openai":

                return new OpenAIProvider(

                    ProviderFactory.requireApiKey(

                        configuration

                    ),

                    configuration.model

                );

            case "anthropic":

                return new AnthropicProvider(

                    ProviderFactory.requireApiKey(

                        configuration

                    ),

                    configuration.model

                );

            case "gemini":

                return new GeminiProvider(

                    ProviderFactory.requireApiKey(

                        configuration

                    ),

                    configuration.model

                );

            case "ollama":

                return new OllamaProvider(

                    configuration.baseUrl,

                    configuration.model

                );

            default:

                throw new Error(

                    `Unknown AI provider: ${configuration.provider}`

                );

        }

    }

    public static availableProviders(): string[] {

        return [

            "openai",

            "anthropic",

            "gemini",

            "ollama"

        ];

    }

    private static requireApiKey(

        configuration: ProviderConfiguration

    ): string {

        if (

            !configuration.apiKey ||

            configuration.apiKey.trim() === ""

        ) {

            throw new Error(

                `Provider '${configuration.provider}' requires an API key.`

            );

        }

        return configuration.apiKey;

    }

}
