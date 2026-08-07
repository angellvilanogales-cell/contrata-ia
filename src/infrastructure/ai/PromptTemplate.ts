export interface PromptTemplate {
  id: string;
  template: string;
  version?: string;
  metadata?: Record<string, unknown>;
}
