import type { IntakeCase } from "../../intake/lb6/IntakeModel";

export interface IntakeCaseRepository {
  loadAll(): readonly IntakeCase[];
  save(caseValue: IntakeCase): void;
  delete?(caseId: string): void;
  backup?(): string;
}

export interface SecurityAuditEvent {
  readonly timestamp: string;
  readonly actor: string;
  readonly action: string;
  readonly caseId?: string;
  readonly revision?: number;
  readonly outcome: "SUCCESS" | "DENIED" | "ERROR";
  readonly detail?: string;
}

export interface SecurityAuditPort {
  record(event: SecurityAuditEvent): void;
}

export const NULL_AUDIT_PORT: SecurityAuditPort = { record: () => undefined };
