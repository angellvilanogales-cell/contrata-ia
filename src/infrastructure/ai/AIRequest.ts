export interface AIRequest {
  id?: string;
  prompt: string;
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}
