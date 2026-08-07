import type { Identifier, ISODate, TraceEntry } from "../common/types";

export interface LegalReference {
  id: Identifier;
  citation: string;
  source: string;
  version?: string;
  locator?: string;
  effectiveFrom?: ISODate;
  effectiveTo?: ISODate;
}

export interface LegalRule {
  id: Identifier;
  name?: string;
  description?: string;
  references: LegalReference[];
  evaluate(context: unknown): boolean;
}

export interface LegalDecision<T = unknown> {
  value?: T;
  proposed: boolean;
  requiresHumanValidation: boolean;
  justification: string;
  ruleIds: Identifier[];
  references: LegalReference[];
  trace: TraceEntry[];
}

export interface LegalContext {
  [key: string]: unknown;
}
