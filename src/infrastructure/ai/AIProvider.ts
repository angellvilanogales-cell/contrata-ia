/******************************************************************************
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI PROVIDER
 *
 * Contrato común para cualquier proveedor de Inteligencia Artificial.
 *
 * Todos los adaptadores (OpenAI, Gemini, Ollama, Local...)
 * deberán implementar esta interfaz.
 ******************************************************************************/

export enum AIProviderType {

    OPENAI = "OPENAI",

    GEMINI = "GEMINI",

    OLLAMA = "OLLAMA",

    LOCAL = "LOCAL"

}

export enum AIRole {

    SYSTEM = "system",

    USER = "user",

    ASSISTANT = "assistant"

}

export interface AIMessage {

    role: AIRole;

    content: string;

}

export interface AIRequest {

    model: string;

    messages: AIMessage[];

    temperature?: number;

    maxTokens?: number;

    topP?: number;

    frequencyPenalty?: number;

    presencePenalty?: number;

    metadata?: Record<string, unknown>;

}

export interface AIUsage {

    promptTokens: number;

    completionTokens: number;

    totalTokens: number;

}

export interface AIResponse {

    provider: AIProviderType;

    model: string;

    text: string;

    finishReason?: string;

    usage?: AIUsage;

    raw?: unknown;

}

export interface AIHealthStatus {

    available: boolean;

    provider: AIProviderType;

    latencyMilliseconds?: number;

    message?: string;

}

export interface AIProvider {

    readonly provider: AIProviderType;

    readonly name: string;

    readonly version: string;

    /**
     * Genera una respuesta utilizando el proveedor.
     */
    generate(
        request: AIRequest
    ): Promise<AIResponse>;

    /**
     * Comprueba que el proveedor está disponible.
     */
    healthCheck(): Promise<AIHealthStatus>;

    /**
     * Devuelve los modelos soportados.
     */
    listModels(): Promise<string[]>;

    /**
     * Cancela operaciones pendientes.
     */
    dispose(): Promise<void>;

}
