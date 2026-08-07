export type UUID = string;
export type Identifier = string;
export type ISODate = string;
export type Money = number;

export type ValidationStatus = "pending" | "validated" | "rejected" | "modified";

export interface TraceEntry {
  id: Identifier;
  timestamp: ISODate;
  actor?: Identifier;
  action: string;
  source?: string;
  ruleId?: Identifier;
  details?: Record<string, unknown>;
}

export interface HumanValidation {
  status: ValidationStatus;
  validatedBy?: Identifier;
  validatedAt?: ISODate;
  justification?: string;
}

export interface ResultEnvelope<T> {
  value: T;
  status: ValidationStatus;
  trace: TraceEntry[];
  validation?: HumanValidation;
}
