import type { HumanValidation, Identifier, TraceEntry, ValidationStatus } from "../common/types";

export interface ContractContext {
  type?: string;
  cpv?: string | string[];
  estimatedValue?: number;
  budget?: number;
  price?: number;
  duration?: number;
  lots?: unknown;
  [key: string]: unknown;
}

export interface ResolverContext {
  contract: ContractContext;
  expediente?: Record<string, unknown>;
  knowledge?: Record<string, unknown>;
  trace?: TraceEntry[];
  [key: string]: unknown;
}

export interface ResolverEvidence {
  source?: string;
  ruleId?: Identifier;
  explanation?: string;
  data?: Record<string, unknown>;
}

export interface ResolverDecision<T> {
  value?: T;
  proposedValue?: T;
  status: ValidationStatus;
  requiresHumanValidation: boolean;
  justification: string;
  evidence: ResolverEvidence[];
  trace: TraceEntry[];
  validation?: HumanValidation;
  metadata?: Record<string, unknown>;
}

export interface RuleExecution {
  ruleId: Identifier;
  matched: boolean;
  explanation?: string;
  source?: string;
  data?: Record<string, unknown>;
}

export interface KnowledgePack {
  id: Identifier;
  [key: string]: unknown;
}

export interface KnowledgeMatch {
  pack: KnowledgePack;
  score?: number;
  source?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
