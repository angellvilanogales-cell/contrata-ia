/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI PROVIDER
 *
 * Interfaz común para todos los proveedores de Inteligencia Artificial.
 *
 ******************************************************************************/

export enum AIProviderType {

    OPENAI = "OPENAI",

    GEMINI = "GEMINI",

    ANTHROPIC = "ANTHROPIC",

    OLLAMA = "OLLAMA",

    LOCAL = "LOCAL"

}

export interface AIModel {

    id: string;

    name: string;

    contextWindow: number;

    supportsStreaming: boolean;

    supportsFunctions: boolean;

    supportsVision: boolean;

}

export interface AIUsage {

    promptTokens: number;

    completionTokens: number;

    totalTokens: number;

}

export interface AIMessage {

    role: "system" | "user" | "assistant";

    content: string;

}

export interface AIRequest {

    model: string;

    messages: AIMessage[];

    temperature?: number;

    topP?: number;

    maxTokens?: number;

    frequencyPenalty?: number;

    presencePenalty?: number;

    stream?: boolean;

}

export interface AIResponse {

    provider: AIProviderType;

    model: string;

    text: string;

    finishReason?: string;

    usage?: AIUsage;

    raw?: unknown;

}

export interface AIHealth {

    provider: AIProviderType;

    available: boolean;

    latencyMilliseconds: number;

    message: string;

}

export interface AIProvider {

    readonly provider: AIProviderType;

    readonly name: string;

    readonly version: string;

    generate(

        request: AIRequest

    ): Promise<AIResponse>;

    healthCheck()

        : Promise<AIHealth>;

    listModels()

        : Promise<AIModel[]>;

    dispose()

        : Promise<void>;

}
