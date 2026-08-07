import { UUID, ISODate, Percentage } from "../../domain/common/types";
import { ContractContext } from "./ContractContext";
import { LegalReference } from "../../domain/legal/LegalReference";

export enum GenerationStatus {
  NOT_STARTED = "NOT_STARTED",
  INITIALIZING = "INITIALIZING",
  ANALYZING = "ANALYZING",
  APPLYING_RULES = "APPLYING_RULES",
  LEGAL_REASONING = "LEGAL_REASONING",
  GENERATING_DOCUMENTS = "GENERATING_DOCUMENTS",
  VALIDATING = "VALIDATING",
  EXPORTING = "EXPORTING",
  COMPLETED = "COMPLETED",
  COMPLETED_WITH_WARNINGS = "COMPLETED_WITH_WARNINGS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export enum SeverityLevel {
  INFO = "INFO",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum ResultType {
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR"
}

export interface GeneratedFile {
  id: UUID;
  code: string;
  name: string;
  description: string;
  version: string;
  fileName: string;
  extension: string;
  mimeType: string;
  size: number;
  generatedAt: ISODate;
  generatedBy: string;
  hash: string;
  digitallySigned: boolean;
  downloadUrl?: string;
}

export interface GenerationWarning {
  id: UUID;
  code: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  affectedModule: string;
  recommendation: string;
  legalReferences: LegalReference[];
  blocking: boolean;
}

export interface GenerationError {
  id: UUID;
  code: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  affectedModule: string;
  exception?: string;
  stackTrace?: string;
  legalReferences: LegalReference[];
  recoverable: boolean;
}

export interface GenerationMessage {
  id: UUID;
  timestamp: ISODate;
  module: string;
  level: SeverityLevel;
  message: string;
}

export interface LegalRecommendation {
  id: UUID;
  title: string;
  description: string;
  priority: number;
  legalBasis: LegalReference[];
  accepted: boolean;
}

export interface LegalDecision {
  id: UUID;
  area: string;
  decision: string;
  justification: string;
  appliedRules: string[];
  legalReferences: LegalReference[];
  confidence: Percentage;
}

export interface LegalReasoning {
  id: UUID;
  title: string;
  explanation: string;
  legalReferences: LegalReference[];
  reasoningSteps: string[];
  conclusion: string;
}

export interface ValidationResult {
  valid: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  errors: number;
  executionTime: number;
  checks: string[];
}

export interface AIRecommendationResult {
  id: UUID;
  category: string;
  title: string;
  description: string;
  accepted: boolean;
  priority: number;
}

export interface AIRiskResult {
  id: UUID;
  title: string;
  description: string;
  severity: SeverityLevel;
  resolved: boolean;
  mitigation: string;
}

export interface AIOptimizationResult {
  id: UUID;
  module: string;
  proposal: string;
  expectedImprovement: string;
  applied: boolean;
}

export interface AIResult {
  enabled: boolean;
  model: string;
  version: string;
  confidence: Percentage;
  executionTime: number;
  recommendations: AIRecommendationResult[];
  risks: AIRiskResult[];
  optimizations: AIOptimizationResult[];
  observations: string[];
}

export interface GenerationStatistics {
  totalDocuments: number;
  totalWarnings: number;
  totalErrors: number;
  totalRecommendations: number;
  totalRulesExecuted: number;
  totalInferences: number;
  totalLegalReferences: number;
  totalGeneratedPages: number;
  totalEstimatedWords: number;
  totalExecutionMilliseconds: number;
}

export interface PerformanceMetrics {
  initializationMilliseconds: number;
  ruleEngineMilliseconds: number;
  inferenceMilliseconds: number;
  legalReasonerMilliseconds: number;
  documentGeneratorMilliseconds: number;
  validationMilliseconds: number;
  exportMilliseconds: number;
  totalMilliseconds: number;
  peakMemoryMB: number;
  averageCpuLoad: number;
}

export interface ExportFormat {
  format: string;
  generated: boolean;
  fileName: string;
  size: number;
}

export interface ExportInformation {
  exportDate: ISODate;
  exportedBy: string;
  destination: string;
  formats: ExportFormat[];
  compressed: boolean;
  encrypted: boolean;
}

export interface WorkflowResult {
  workflowId: UUID;
  currentStage: string;
  completedStages: string[];
  skippedStages: string[];
  failedStages: string[];
  successful: boolean;
}

export interface PipelineStep {
  order: number;
  name: string;
  successful: boolean;
  executionMilliseconds: number;
  observations: string[];
}

export interface PipelineResult {
  pipelineId: UUID;
  executedSteps: PipelineStep[];
  successfulSteps: number;
  failedSteps: number;
  executionTime: number;
}

export interface GenerationAudit {
  generationId: UUID;
  startedAt: ISODate;
  finishedAt: ISODate;
  generatedBy: string;
  applicationVersion: string;
  engineVersion: string;
  contractGeneratorVersion: string;
  legalReasonerVersion: string;
  workflowVersion: string;
  documentGeneratorVersion: string;
}

export interface GenerationResult {
  status: GenerationStatus;
  resultType: ResultType;
  successful: boolean;
  context: ContractContext;
  generatedFiles: GeneratedFile[];
  validation: ValidationResult;
  warnings: GenerationWarning[];
  errors: GenerationError[];
  messages: GenerationMessage[];
  legalDecisions: LegalDecision[];
  legalReasoning: LegalReasoning[];
  legalRecommendations: LegalRecommendation[];
  artificialIntelligence: AIResult;
  statistics: GenerationStatistics;
  performance: PerformanceMetrics;
  exportInformation: ExportInformation;
  workflow: WorkflowResult;
  pipeline: PipelineResult;
  audit: GenerationAudit;
}

const emptyValidation = (): ValidationResult => ({
  valid: true,
  totalChecks: 0,
  passedChecks: 0,
  failedChecks: 0,
  warnings: 0,
  errors: 0,
  executionTime: 0,
  checks: []
});

const emptyAI = (): AIResult => ({
  enabled: false,
  model: "",
  version: "",
  confidence: 0,
  executionTime: 0,
  recommendations: [],
  risks: [],
  optimizations: [],
  observations: []
});

export class GenerationResultModel implements GenerationResult {
  public status = GenerationStatus.NOT_STARTED;
  public resultType = ResultType.SUCCESS;
  public successful = false;
  public context!: ContractContext;
  public generatedFiles: GeneratedFile[] = [];
  public validation = emptyValidation();
  public warnings: GenerationWarning[] = [];
  public errors: GenerationError[] = [];
  public messages: GenerationMessage[] = [];
  public legalDecisions: LegalDecision[] = [];
  public legalReasoning: LegalReasoning[] = [];
  public legalRecommendations: LegalRecommendation[] = [];
  public artificialIntelligence = emptyAI();
  public statistics: GenerationStatistics = {
    totalDocuments: 0, totalWarnings: 0, totalErrors: 0, totalRecommendations: 0,
    totalRulesExecuted: 0, totalInferences: 0, totalLegalReferences: 0,
    totalGeneratedPages: 0, totalEstimatedWords: 0, totalExecutionMilliseconds: 0
  };
  public performance: PerformanceMetrics = {
    initializationMilliseconds: 0, ruleEngineMilliseconds: 0, inferenceMilliseconds: 0,
    legalReasonerMilliseconds: 0, documentGeneratorMilliseconds: 0, validationMilliseconds: 0,
    exportMilliseconds: 0, totalMilliseconds: 0, peakMemoryMB: 0, averageCpuLoad: 0
  };
  public exportInformation: ExportInformation = {
    exportDate: new Date().toISOString(), exportedBy: "", destination: "", formats: [], compressed: false, encrypted: false
  };
  public workflow: WorkflowResult = {
    workflowId: crypto.randomUUID(), currentStage: "", completedStages: [], skippedStages: [], failedStages: [], successful: false
  };
  public pipeline: PipelineResult = {
    pipelineId: crypto.randomUUID(), executedSteps: [], successfulSteps: 0, failedSteps: 0, executionTime: 0
  };
  public audit: GenerationAudit = {
    generationId: crypto.randomUUID(), startedAt: new Date().toISOString(), finishedAt: "",
    generatedBy: "Contrata-IA", applicationVersion: "0.1.0", engineVersion: "1.0.0",
    contractGeneratorVersion: "1.0.0", legalReasonerVersion: "1.0.0", workflowVersion: "1.0.0", documentGeneratorVersion: "1.0.0"
  };

  public addGeneratedFile(file: GeneratedFile): void { this.generatedFiles.push(file); this.recalculateStatistics(); }
  public getGeneratedFile(code: string): GeneratedFile | undefined { return this.generatedFiles.find(file => file.code === code); }
  public hasGeneratedFile(code: string): boolean { return this.getGeneratedFile(code) !== undefined; }
  public removeGeneratedFile(code: string): void { this.generatedFiles = this.generatedFiles.filter(file => file.code !== code); this.recalculateStatistics(); }
  public addWarning(warning: GenerationWarning): void { this.warnings.push(warning); this.recalculateStatistics(); }
  public addError(error: GenerationError): void { this.errors.push(error); this.resultType = ResultType.ERROR; this.successful = false; this.status = GenerationStatus.FAILED; this.recalculateStatistics(); }
  public addMessage(level: SeverityLevel | string, module: string, message: string): void {
    const normalized = Object.values(SeverityLevel).includes(level as SeverityLevel) ? level as SeverityLevel : SeverityLevel.INFO;
    this.messages.push({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), module, level: normalized, message });
  }
  public addLegalDecision(decision: LegalDecision): void { this.legalDecisions.push(decision); this.recalculateStatistics(); }
  public addLegalReasoning(reasoning: LegalReasoning): void { this.legalReasoning.push(reasoning); }
  public addLegalRecommendation(recommendation: LegalRecommendation): void { this.legalRecommendations.push(recommendation); this.recalculateStatistics(); }
  public getDocumentCount(): number { return this.generatedFiles.length; }
  public getErrorCount(): number { return this.errors.length; }
  public getWarningCount(): number { return this.warnings.length; }
  public getMessageCount(): number { return this.messages.length; }
  public setAIResult(result: AIResult): void { this.artificialIntelligence = result; }
  public addAIRecommendation(recommendation: AIRecommendationResult): void { this.artificialIntelligence.recommendations.push(recommendation); }
  public addAIRisk(risk: AIRiskResult): void { this.artificialIntelligence.risks.push(risk); }
  public addAIOptimization(optimization: AIOptimizationResult): void { this.artificialIntelligence.optimizations.push(optimization); }
  public getCriticalAIRisks(): number { return this.artificialIntelligence.risks.filter(risk => risk.severity === SeverityLevel.CRITICAL && !risk.resolved).length; }
  public updatePerformance(metrics: Partial<PerformanceMetrics>): void { this.performance = { ...this.performance, ...metrics }; }
  public recalculateStatistics(): void {
    this.statistics.totalDocuments = this.generatedFiles.length;
    this.statistics.totalWarnings = this.warnings.length;
    this.statistics.totalErrors = this.errors.length;
    this.statistics.totalRecommendations = this.legalRecommendations.length + this.artificialIntelligence.recommendations.length;
    this.statistics.totalLegalReferences = this.legalDecisions.reduce((sum, decision) => sum + decision.legalReferences.length, 0);
  }
  public startGeneration(): void { this.status = GenerationStatus.INITIALIZING; this.audit.startedAt = new Date().toISOString(); }
  public finishGeneration(): void { this.status = this.errors.length ? GenerationStatus.FAILED : (this.warnings.length ? GenerationStatus.COMPLETED_WITH_WARNINGS : GenerationStatus.COMPLETED); this.successful = this.errors.length === 0; this.resultType = this.warnings.length ? ResultType.WARNING : ResultType.SUCCESS; this.audit.finishedAt = new Date().toISOString(); }
  public updateWorkflow(workflow: WorkflowResult): void { this.workflow = workflow; }
  public completeWorkflowStage(stage: string): void { this.workflow.completedStages.push(stage); this.workflow.currentStage = stage; }
  public skipWorkflowStage(stage: string): void { this.workflow.skippedStages.push(stage); }
  public failWorkflowStage(stage: string): void { this.workflow.failedStages.push(stage); this.workflow.successful = false; this.workflow.failedStages.push(stage); }
  public addPipelineStep(step: PipelineStep): void { this.pipeline.executedSteps.push(step); step.successful ? this.pipeline.successfulSteps++ : this.pipeline.failedSteps++; }
  public getPipelineSuccessPercentage(): number { const total = this.pipeline.executedSteps.length; return total ? (this.pipeline.successfulSteps / total) * 100 : 0; }
  public addExportFormat(format: ExportFormat): void { this.exportInformation.formats.push(format); }
  public getExportFormats(): ExportFormat[] { return [...this.exportInformation.formats]; }
  public markCompressed(): void { this.exportInformation.compressed = true; }
  public markEncrypted(): void { this.exportInformation.encrypted = true; }
  public hasBlockingErrors(): boolean { return this.errors.some(error => error.recoverable === false || error.severity === SeverityLevel.CRITICAL); }
  public hasBlockingWarnings(): boolean { return this.warnings.some(warning => warning.blocking); }
  public getWorkflowSummary(): Record<string, unknown> { return { currentStage: this.workflow.currentStage, completed: this.workflow.completedStages.length, skipped: this.workflow.skippedStages.length, failed: this.workflow.failedStages.length }; }
  public startAudit(user: string, applicationVersion: string, engineVersion: string): void { this.audit.generatedBy = user; this.audit.applicationVersion = applicationVersion; this.audit.engineVersion = engineVersion; this.audit.startedAt = new Date().toISOString(); }
  public finishAudit(): void { this.audit.finishedAt = new Date().toISOString(); }
  public getExecutionTime(): number { return this.performance.totalMilliseconds; }
  public hasErrors(): boolean { return this.errors.length > 0; }
  public isSuccessful(): boolean { return this.successful && !this.hasBlockingErrors(); }
  public getExportableFiles(): GeneratedFile[] { return this.generatedFiles.filter(file => file.size >= 0); }
  public getTotalGeneratedSize(): number { return this.generatedFiles.reduce((sum, file) => sum + file.size, 0); }
  public getStatisticsSummary(): Record<string, number> { return { documents: this.statistics.totalDocuments, warnings: this.statistics.totalWarnings, errors: this.statistics.totalErrors, recommendations: this.statistics.totalRecommendations }; }
  public toJSON(): string { return JSON.stringify(this); }
  public static fromJSON(json: string): GenerationResultModel { const result = new GenerationResultModel(); result.loadFromPersistence(JSON.parse(json) as Partial<GenerationResult>); return result; }
  public clone(): GenerationResultModel { return GenerationResultModel.fromJSON(this.toJSON()); }
  public touchExport(): void { this.exportInformation.exportDate = new Date().toISOString(); }
  public toPersistenceObject(): Record<string, unknown> { return JSON.parse(this.toJSON()) as Record<string, unknown>; }
  public loadFromPersistence(object: Partial<GenerationResult>): void { Object.assign(this, object); this.recalculateStatistics(); }
  public getLogContext(): Record<string, unknown> { return { generationId: this.audit.generationId, status: this.status, errors: this.errors.length, warnings: this.warnings.length }; }
  public reset(): void { const context = this.context; Object.assign(this, new GenerationResultModel()); if (context) this.context = context; }
  public hasPendingExports(): boolean { return this.generatedFiles.some(file => file.downloadUrl === undefined); }
  public getCompletionPercentage(): number { switch (this.status) { case GenerationStatus.COMPLETED: case GenerationStatus.COMPLETED_WITH_WARNINGS: return 100; case GenerationStatus.FAILED: return 0; default: return 50; } }
  public toApiResponse(): Record<string, unknown> { return { success: this.isSuccessful(), status: this.status, documents: this.getDocumentCount(), warnings: this.getWarningCount(), errors: this.getErrorCount() }; }
  public getDashboardInformation(): Record<string, unknown> { return { ...this.toApiResponse(), completion: this.getCompletionPercentage(), pipeline: this.getPipelineSuccessPercentage() }; }
  public getExportSummary(): Record<string, unknown> { return { exported: this.exportInformation.formats.filter(format => format.generated).length, formats: this.getExportFormats() }; }
  public canBePublished(): boolean { return this.isSuccessful() && !this.hasBlockingWarnings() && !this.hasPendingExports(); }
  public clearMessages(): void { this.messages = []; }
  public clearWarnings(): void { this.warnings = []; this.recalculateStatistics(); }
}
