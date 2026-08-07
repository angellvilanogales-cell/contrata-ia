import type { TraceEntry } from "../common/types";

export class AuditService {
  private readonly entries: TraceEntry[] = [];
  public log(action: string, details?: string, data?: unknown): void {
    this.entries.push({
      id: `${Date.now()}-${this.entries.length}`,
      timestamp: new Date().toISOString(),
      action,
      details: { message: details, data }
    });
  }
  public entriesSnapshot(): readonly TraceEntry[] { return [...this.entries]; }
}
