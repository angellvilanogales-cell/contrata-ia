export interface AIResponse {
  id?: string;
  text: string;
  model?: string;
  usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
  metadata?: Record<string, unknown>;
}
