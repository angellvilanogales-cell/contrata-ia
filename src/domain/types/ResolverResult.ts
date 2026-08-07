import type { LegalReference } from "../legal/types";
import type { HumanValidation, TraceEntry } from "../common/types";

export interface ResolverResult<T = unknown> {
  value?: T;
  proposed?: T;
  justification?: string;
  references?: LegalReference[];
  trace?: TraceEntry[];
  validation?: HumanValidation;
  requiresHumanValidation?: boolean;
  [key: string]: unknown;
}
