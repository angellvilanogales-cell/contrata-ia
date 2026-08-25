export type CanonicalComponentId =
  | "configuration"
  | "events"
  | "rules"
  | "inference"
  | "knowledge"
  | "legalReasoning"
  | "cpv"
  | "procedure"
  | "expediente"
  | "documents"
  | "export"
  | "ai";

export interface ApplicationConfiguration {
  readonly nodeEnv: string;
  readonly logLevel: string;
  readonly aiEnabled: boolean;
}

export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
  readonly payload: unknown;
}

export type DomainEventHandler = (event: DomainEvent) => void | Promise<void>;

export interface EventBusPort {
  publish(event: DomainEvent): void | Promise<void>;
  subscribe(type: string, handler: DomainEventHandler): () => void;
}

export interface RuleEvaluationRequest {
  readonly facts: Readonly<Record<string, unknown>>;
}

export interface RuleEvaluationResult {
  readonly valid: boolean;
  readonly ruleIds: readonly string[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export interface RuleEnginePort {
  evaluate(request: RuleEvaluationRequest): RuleEvaluationResult | Promise<RuleEvaluationResult>;
}

export interface InferenceRequest {
  readonly facts: Readonly<Record<string, unknown>>;
  readonly ruleIds?: readonly string[];
}

export interface InferenceResult {
  readonly conclusions: readonly unknown[];
  readonly trace: readonly string[];
}

export interface InferenceEnginePort {
  infer(request: InferenceRequest): InferenceResult | Promise<InferenceResult>;
}

export interface KnowledgeQuery {
  readonly text: string;
  readonly tags?: readonly string[];
}

export interface KnowledgeEvidence {
  readonly id: string;
  readonly source: string;
  readonly content: unknown;
}

export interface KnowledgeEnginePort {
  query(query: KnowledgeQuery): readonly KnowledgeEvidence[] | Promise<readonly KnowledgeEvidence[]>;
}

export interface LegalReasoningRequest {
  readonly facts: Readonly<Record<string, unknown>>;
  readonly evidence: readonly KnowledgeEvidence[];
}

export interface LegalReasoningResult {
  readonly proposal: unknown;
  readonly justification: readonly string[];
  readonly sourceIds: readonly string[];
  readonly requiresHumanValidation: true;
}

export interface LegalReasonerPort {
  reason(request: LegalReasoningRequest): LegalReasoningResult | Promise<LegalReasoningResult>;
}

export interface CPVProposal {
  readonly code: string;
  readonly label: string;
  readonly confidence?: number;
  readonly justification?: string;
}

export interface CPVEnginePort {
  propose(description: string): readonly CPVProposal[] | Promise<readonly CPVProposal[]>;
}

export interface ProcedureProposal {
  readonly procedure: string;
  readonly justification: readonly string[];
  readonly sourceIds: readonly string[];
  readonly requiresHumanValidation: true;
}

export interface ProcedureResolverPort {
  resolve(context: Readonly<Record<string, unknown>>): ProcedureProposal | Promise<ProcedureProposal>;
}

export interface GeneratedDocument {
  readonly type: string;
  readonly title: string;
  readonly content: unknown;
  readonly warnings: readonly string[];
}

export interface DocumentGeneratorPort {
  generate(type: string, context: Readonly<Record<string, unknown>>): GeneratedDocument | Promise<GeneratedDocument>;
}

export interface ExportedDocument {
  readonly format: string;
  readonly fileName: string;
  readonly data: Uint8Array | string;
}

export interface DocumentExporterPort {
  export(document: GeneratedDocument, format: string): ExportedDocument | Promise<ExportedDocument>;
}

export interface AICompletionRequest {
  readonly purpose: string;
  readonly prompt: string;
  readonly grounding?: readonly KnowledgeEvidence[];
}

export interface AICompletionResult {
  readonly text: string;
  readonly provider: string;
}

export interface AIServicePort {
  complete(request: AICompletionRequest): AICompletionResult | Promise<AICompletionResult>;
}

export interface CanonicalComponentDescriptor {
  readonly id: CanonicalComponentId;
  readonly contract: string;
  readonly canonicalPath: string;
  readonly legacyPaths: readonly string[];
}

export interface CanonicalArchitectureSnapshot {
  readonly architectureVersion: string;
  readonly runtimeEntrypoint: string;
  readonly components: readonly CanonicalComponentDescriptor[];
}
