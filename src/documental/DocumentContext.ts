export interface DocumentContext {
  expedienteId?: string;
  title?: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
