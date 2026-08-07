import type { Identifier, ISODate, TraceEntry } from "../common/types";
import type { LegalReference } from "./LegalReference";

export type { LegalReference } from "./LegalReference";

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

export interface LegalVersion {
  id: Identifier;
  effectiveFrom?: ISODate;
  effectiveTo?: ISODate;
}
