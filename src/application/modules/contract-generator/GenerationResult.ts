/**
 * =============================================================================
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 * -----------------------------------------------------------------------------
 * Archivo:
 * GenerationResult.ts
 *
 * Módulo:
 * Contract Generator
 *
 * Este archivo representa TODO lo que devuelve el sistema una vez finalizada
 * la generación de un expediente.
 *
 * El objetivo es disponer de un único objeto de salida utilizado por:
 *
 *  • ContractGenerator
 *  • Workflow
 *  • API
 *  • Interfaz Web
 *  • Exportadores
 *  • Validadores
 *  • IA
 *
 * Nunca deberán devolverse múltiples objetos independientes.
 *
 * Todo viajará dentro de GenerationResult.
 * =============================================================================
 */

import {

    UUID,
    ISODate,
    Money,
    Percentage

} from "../../domain/common/types";

import {

    ContractContext

} from "./ContractContext";

import {

    LegalReference

} from "../../domain/legal/LegalReference";

/**
 * =============================================================================
 * Estado general de la generación
 * =============================================================================
 */

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

/**
 * =============================================================================
 * Nivel de gravedad
 * =============================================================================
 */

export enum SeverityLevel {

    INFO = "INFO",

    LOW = "LOW",

    MEDIUM = "MEDIUM",

    HIGH = "HIGH",

    CRITICAL = "CRITICAL"

}

/**
 * =============================================================================
 * Tipo de resultado
 * =============================================================================
 */

export enum ResultType {

    SUCCESS = "SUCCESS",

    WARNING = "WARNING",

    ERROR = "ERROR"

}

/**
 * =============================================================================
 * Documento generado
 * =============================================================================
 */

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

/**
 * =============================================================================
 * Advertencia
 * =============================================================================
 */

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

/**
 * =============================================================================
 * Error
 * =============================================================================
 */

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

/**
 * =============================================================================
 * Mensaje informativo
 * =============================================================================
 */

export interface GenerationMessage {

    id: UUID;

    timestamp: ISODate;

    module: string;

    level: SeverityLevel;

    message: string;

}

/**
 * =============================================================================
 * Recomendación jurídica
 * =============================================================================
 */

export interface LegalRecommendation {

    id: UUID;

    title: string;

    description: string;

    priority: number;

    legalBasis: LegalReference[];

    accepted: boolean;

}

/**
 * =============================================================================
 * Decisión jurídica adoptada
 * =============================================================================
 */

export interface LegalDecision {

    id: UUID;

    area: string;

    decision: string;

    justification: string;

    appliedRules: string[];

    legalReferences: LegalReference[];

    confidence: Percentage;

}

/**
 * =============================================================================
 * Motivación jurídica
 * =============================================================================
 */

export interface LegalReasoning {

    id: UUID;

    title: string;

    explanation: string;

    legalReferences: LegalReference[];

    reasoningSteps: string[];

    conclusion: string;

}

/**
 * =============================================================================
 * Resultado de validación
 * =============================================================================
 */

export interface ValidationResult {

    valid: boolean;

    totalChecks: number;

    passedChecks: number;

    failedChecks: number;

    warnings: number;

    errors: number;

    executionTime: number;

  /**
 * =============================================================================
 * Resultado de Inteligencia Artificial
 * =============================================================================
 */

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

/**
 * =============================================================================
 * Recomendaciones IA
 * =============================================================================
 */

export interface AIRecommendationResult {

    id: UUID;

    category: string;

    title: string;

    description: string;

    accepted: boolean;

    priority: number;

}

/**
 * =============================================================================
 * Riesgos IA
 * =============================================================================
 */

export interface AIRiskResult {

    id: UUID;

    title: string;

    description: string;

    severity: SeverityLevel;

    resolved: boolean;

    mitigation: string;

}

/**
 * =============================================================================
 * Optimizaciones IA
 * =============================================================================
 */

export interface AIOptimizationResult {

    id: UUID;

    module: string;

    proposal: string;

    expectedImprovement: string;

    applied: boolean;

}

/**
 * =============================================================================
 * Estadísticas generales
 * =============================================================================
 */

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

/**
 * =============================================================================
 * Rendimiento del sistema
 * =============================================================================
 */

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

/**
 * =============================================================================
 * Información de exportación
 * =============================================================================
 */

export interface ExportInformation {

    exportDate: ISODate;

    exportedBy: string;

    destination: string;

    formats: ExportFormat[];

    compressed: boolean;

    encrypted: boolean;

}

/**
 * =============================================================================
 * Formatos exportados
 * =============================================================================
 */

export interface ExportFormat {

    format: string;

    generated: boolean;

    fileName: string;

    size: number;

}

/**
 * =============================================================================
 * Resultado del Workflow
 * =============================================================================
 */

export interface WorkflowResult {

    workflowId: UUID;

    currentStage: string;

    completedStages: string[];

    skippedStages: string[];

    failedStages: string[];

    successful: boolean;

}

/**
 * =============================================================================
 * Resultado del Pipeline
 * =============================================================================
 */

export interface PipelineResult {

    pipelineId: UUID;

    executedSteps: PipelineStep[];

    successfulSteps: number;

    failedSteps: number;

    executionTime: number;

}

/**
 * =============================================================================
 * Paso ejecutado
 * =============================================================================
 */

export interface PipelineStep {

    order: number;

    name: string;

    successful: boolean;

    executionMilliseconds: number;

    observations: string[];

}

/**
 * =============================================================================
 * Auditoría de generación
 * =============================================================================
 */

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

  /**
 * =============================================================================
 * RESULTADO PRINCIPAL DE LA GENERACIÓN
 * =============================================================================
 *
 * Esta es la entidad que devolverá SIEMPRE el ContractGenerator.
 *
 * Nunca se devolverán objetos independientes.
 *
 * Todo el resultado del proceso estará encapsulado aquí.
 *
 * =============================================================================
 */

export interface GenerationResult {

    /**
     * -------------------------------------------------------------------------
     * Estado general
     * -------------------------------------------------------------------------
     */

    status: GenerationStatus;

    resultType: ResultType;

    successful: boolean;

    /**
     * -------------------------------------------------------------------------
     * Contexto generado
     * -------------------------------------------------------------------------
     */

    context: ContractContext;

    /**
     * -------------------------------------------------------------------------
     * Documentación generada
     * -------------------------------------------------------------------------
     */

    generatedFiles: GeneratedFile[];

    /**
     * -------------------------------------------------------------------------
     * Validación
     * -------------------------------------------------------------------------
     */

    validation: ValidationResult;

    /**
     * -------------------------------------------------------------------------
     * Advertencias
     * -------------------------------------------------------------------------
     */

    warnings: GenerationWarning[];

    /**
     * -------------------------------------------------------------------------
     * Errores
     * -------------------------------------------------------------------------
     */

    errors: GenerationError[];

    /**
     * -------------------------------------------------------------------------
     * Mensajes
     * -------------------------------------------------------------------------
     */

    messages: GenerationMessage[];

    /**
     * -------------------------------------------------------------------------
     * Decisiones jurídicas
     * -------------------------------------------------------------------------
     */

    legalDecisions: LegalDecision[];

    /**
     * -------------------------------------------------------------------------
     * Motivaciones jurídicas
     * -------------------------------------------------------------------------
     */

    legalReasoning: LegalReasoning[];

    /**
     * -------------------------------------------------------------------------
     * Recomendaciones jurídicas
     * -------------------------------------------------------------------------
     */

    legalRecommendations: LegalRecommendation[];

    /**
     * -------------------------------------------------------------------------
     * Inteligencia Artificial
     * -------------------------------------------------------------------------
     */

    artificialIntelligence: AIResult;

    /**
     * -------------------------------------------------------------------------
     * Estadísticas
     * -------------------------------------------------------------------------
     */

    statistics: GenerationStatistics;

    /**
     * -------------------------------------------------------------------------
     * Rendimiento
     * -------------------------------------------------------------------------
     */

    performance: PerformanceMetrics;

    /**
     * -------------------------------------------------------------------------
     * Exportación
     * -------------------------------------------------------------------------
     */

    exportInformation: ExportInformation;

    /**
     * -------------------------------------------------------------------------
     * Workflow
     * -------------------------------------------------------------------------
     */

    workflow: WorkflowResult;

    /**
     * -------------------------------------------------------------------------
     * Pipeline
     * -------------------------------------------------------------------------
     */

    pipeline: PipelineResult;

    /**
     * -------------------------------------------------------------------------
     * Auditoría
     * -------------------------------------------------------------------------
     */

    audit: GenerationAudit;

}

/**
 * =============================================================================
 * IMPLEMENTACIÓN
 * =============================================================================
 */

export class GenerationResultModel
implements GenerationResult {

    public status!: GenerationStatus;

    public resultType!: ResultType;

    public successful!: boolean;

    public context!: ContractContext;

    public generatedFiles!: GeneratedFile[];

    public validation!: ValidationResult;

    public warnings!: GenerationWarning[];

    public errors!: GenerationError[];

    public messages!: GenerationMessage[];

    public legalDecisions!: LegalDecision[];

    public legalReasoning!: LegalReasoning[];

    public legalRecommendations!: LegalRecommendation[];

    public artificialIntelligence!: AIResult;

    public statistics!: GenerationStatistics;

    public performance!: PerformanceMetrics;

    public exportInformation!: ExportInformation;

    public workflow!: WorkflowResult;

    public pipeline!: PipelineResult;

    public audit!: GenerationAudit;

    /**
     * -------------------------------------------------------------------------
     * Constructor
     * -------------------------------------------------------------------------
     */

    constructor() {

        this.initialize();

    }

    /**
     * -------------------------------------------------------------------------
     * Inicialización
     * -------------------------------------------------------------------------
     */

    private initialize(): void {

        this.status =

            GenerationStatus.NOT_STARTED;

        this.resultType =

            ResultType.SUCCESS;

        this.successful = false;

        this.generatedFiles = [];

        this.warnings = [];

        this.errors = [];

        this.messages = [];

        this.legalDecisions = [];

        this.legalReasoning = [];

        this.legalRecommendations = [];

    }

}

/**
 * =============================================================================
 * Añade un documento generado
 * =============================================================================
 */

    public addGeneratedFile(

        file: GeneratedFile

    ): void {

        this.generatedFiles.push(file);

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Obtiene un documento por código
 * =============================================================================
 */

    public getGeneratedFile(

        code: string

    ): GeneratedFile | undefined {

        return this.generatedFiles.find(

            file => file.code === code

        );

    }

/**
 * =============================================================================
 * Comprueba si existe un documento
 * =============================================================================
 */

    public hasGeneratedFile(

        code: string

    ): boolean {

        return this.getGeneratedFile(code) !== undefined;

    }

/**
 * =============================================================================
 * Elimina un documento generado
 * =============================================================================
 */

    public removeGeneratedFile(

        code: string

    ): void {

        this.generatedFiles =

            this.generatedFiles.filter(

                file => file.code !== code

            );

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Añade una advertencia
 * =============================================================================
 */

    public addWarning(

        warning: GenerationWarning

    ): void {

        this.warnings.push(warning);

        if (

            this.status !==

            GenerationStatus.FAILED

        ) {

            this.status =

                GenerationStatus.COMPLETED_WITH_WARNINGS;

        }

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Añade un error
 * =============================================================================
 */

    public addError(

        error: GenerationError

    ): void {

        this.errors.push(error);

        this.resultType =

            ResultType.ERROR;

        this.successful = false;

        this.status =

            GenerationStatus.FAILED;

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Añade un mensaje
 * =============================================================================
 */

    public addMessage(

        level: SeverityLevel,

        module: string,

        message: string

    ): void {

        this.messages.push({

            id: crypto.randomUUID() as UUID,

            timestamp:

                new Date().toISOString() as ISODate,

            module,

            level,

            message

        });

    }

/**
 * =============================================================================
 * Añade una decisión jurídica
 * =============================================================================
 */

    public addLegalDecision(

        decision: LegalDecision

    ): void {

        this.legalDecisions.push(decision);

    }

/**
 * =============================================================================
 * Añade una motivación jurídica
 * =============================================================================
 */

    public addLegalReasoning(

        reasoning: LegalReasoning

    ): void {

        this.legalReasoning.push(reasoning);

    }

/**
 * =============================================================================
 * Añade una recomendación jurídica
 * =============================================================================
 */

    public addLegalRecommendation(

        recommendation: LegalRecommendation

    ): void {

        this.legalRecommendations.push(

            recommendation

        );

    }

/**
 * =============================================================================
 * Devuelve el número de documentos
 * =============================================================================
 */

    public getDocumentCount(): number {

        return this.generatedFiles.length;

    }

/**
 * =============================================================================
 * Devuelve el número de errores
 * =============================================================================
 */

    public getErrorCount(): number {

        return this.errors.length;

    }

/**
 * =============================================================================
 * Devuelve el número de advertencias
 * =============================================================================
 */

    public getWarningCount(): number {

        return this.warnings.length;

    }

/**
 * =============================================================================
 * Devuelve el número de mensajes
 * =============================================================================
 */

    public getMessageCount(): number {

        return this.messages.length;

    }

/**
 * =============================================================================
 * Actualiza el resultado de Inteligencia Artificial
 * =============================================================================
 */

    public setAIResult(

        result: AIResult

    ): void {

        this.artificialIntelligence = result;

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Añade una recomendación IA
 * =============================================================================
 */

    public addAIRecommendation(

        recommendation: AIRecommendationResult

    ): void {

        this.artificialIntelligence.recommendations.push(

            recommendation

        );

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Añade un riesgo IA
 * =============================================================================
 */

    public addAIRisk(

        risk: AIRiskResult

    ): void {

        this.artificialIntelligence.risks.push(

            risk

        );

    }

/**
 * =============================================================================
 * Añade una optimización IA
 * =============================================================================
 */

    public addAIOptimization(

        optimization: AIOptimizationResult

    ): void {

        this.artificialIntelligence.optimizations.push(

            optimization

        );

    }

/**
 * =============================================================================
 * Devuelve el número de riesgos críticos
 * =============================================================================
 */

    public getCriticalAIRisks(): number {

        return this.artificialIntelligence.risks.filter(

            risk =>

                risk.severity === SeverityLevel.CRITICAL &&

                !risk.resolved

        ).length;

    }

/**
 * =============================================================================
 * Actualiza las métricas de rendimiento
 * =============================================================================
 */

    public updatePerformance(

        metrics: Partial<PerformanceMetrics>

    ): void {

        this.performance = {

            ...this.performance,

            ...metrics

        };

    }

/**
 * =============================================================================
 * Incrementa el tiempo de un módulo
 * =============================================================================
 */

    public addExecutionTime(

        milliseconds: number

    ): void {

        this.performance.totalMilliseconds +=

            milliseconds;

    }

/**
 * =============================================================================
 * Recalcula estadísticas automáticamente
 * =============================================================================
 */

    public recalculateStatistics(): void {

        if (!this.statistics) {

            return;

        }

        this.statistics.totalDocuments =

            this.generatedFiles.length;

        this.statistics.totalWarnings =

            this.warnings.length;

        this.statistics.totalErrors =

            this.errors.length;

        this.statistics.totalRecommendations =

            this.legalRecommendations.length +

            this.artificialIntelligence.recommendations.length;

        this.statistics.totalLegalReferences =

            this.legalReasoning.reduce(

                (sum, reasoning) =>

                    sum +

                    reasoning.legalReferences.length,

                0

            );

        this.statistics.totalExecutionMilliseconds =

            this.performance.totalMilliseconds;

    }

/**
 * =============================================================================
 * Marca la generación como iniciada
 * =============================================================================
 */

    public startGeneration(): void {

        this.status =

            GenerationStatus.INITIALIZING;

        this.resultType =

            ResultType.SUCCESS;

        this.successful = false;

        this.audit.startedAt =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Marca la generación como completada
 * =============================================================================
 */

    public finishGeneration(): void {

        this.audit.finishedAt =

            new Date().toISOString() as ISODate;

        this.recalculateStatistics();

        if (this.errors.length > 0) {

            this.status =

                GenerationStatus.FAILED;

            this.resultType =

                ResultType.ERROR;

            this.successful = false;

            return;

        }

        if (this.warnings.length > 0) {

            this.status =

                GenerationStatus.COMPLETED_WITH_WARNINGS;

            this.resultType =

                ResultType.WARNING;

            this.successful = true;

            return;

        }

        this.status =

            GenerationStatus.COMPLETED;

        this.resultType =

            ResultType.SUCCESS;

        this.successful = true;

    }

/**
 * =============================================================================
 * Actualiza el Workflow
 * =============================================================================
 */

    public updateWorkflow(

        workflow: WorkflowResult

    ): void {

        this.workflow = workflow;

    }

/**
 * =============================================================================
 * Añade una etapa completada
 * =============================================================================
 */

    public completeWorkflowStage(

        stage: string

    ): void {

        if (

            !this.workflow.completedStages.includes(stage)

        ) {

            this.workflow.completedStages.push(stage);

        }

        this.workflow.currentStage = stage;

    }

/**
 * =============================================================================
 * Marca una etapa como omitida
 * =============================================================================
 */

    public skipWorkflowStage(

        stage: string

    ): void {

        this.workflow.skippedStages.push(stage);

    }

/**
 * =============================================================================
 * Marca una etapa como fallida
 * =============================================================================
 */

    public failWorkflowStage(

        stage: string

    ): void {

        this.workflow.failedStages.push(stage);

        this.workflow.successful = false;

        this.status = GenerationStatus.FAILED;

    }

/**
 * =============================================================================
 * Añade un paso al Pipeline
 * =============================================================================
 */

    public addPipelineStep(

        step: PipelineStep

    ): void {

        this.pipeline.executedSteps.push(step);

        if (step.successful) {

            this.pipeline.successfulSteps++;

        }

        else {

            this.pipeline.failedSteps++;

        }

        this.pipeline.executionTime +=

            step.executionMilliseconds;

    }

/**
 * =============================================================================
 * Devuelve el porcentaje de éxito del Pipeline
 * =============================================================================
 */

    public getPipelineSuccessPercentage(): number {

        const total =

            this.pipeline.executedSteps.length;

        if (total === 0) {

            return 0;

        }

        return (

            this.pipeline.successfulSteps /

            total

        ) * 100;

    }

/**
 * =============================================================================
 * Añade un formato exportado
 * =============================================================================
 */

    public addExportFormat(

        format: ExportFormat

    ): void {

        this.exportInformation.formats.push(

            format

        );

    }

/**
 * =============================================================================
 * Comprueba si un formato ha sido generado
 * =============================================================================
 */

    public hasExportFormat(

        format: string

    ): boolean {

        return this.exportInformation.formats.some(

            f =>

                f.format === format &&

                f.generated

        );

    }

/**
 * =============================================================================
 * Devuelve todos los formatos exportados
 * =============================================================================
 */

    public getExportFormats(): ExportFormat[] {

        return [

            ...this.exportInformation.formats

        ];

    }

/**
 * =============================================================================
 * Marca el resultado como comprimido
 * =============================================================================
 */

    public markCompressed(): void {

        this.exportInformation.compressed = true;

    }

/**
 * =============================================================================
 * Marca el resultado como cifrado
 * =============================================================================
 */

    public markEncrypted(): void {

        this.exportInformation.encrypted = true;

    }

/**
 * =============================================================================
 * Comprueba si existen errores bloqueantes
 * =============================================================================
 */

    public hasBlockingErrors(): boolean {

        return this.errors.some(

            e =>

                e.severity === SeverityLevel.CRITICAL ||

                !e.recoverable

        );

    }

/**
 * =============================================================================
 * Comprueba si existen advertencias bloqueantes
 * =============================================================================
 */

    public hasBlockingWarnings(): boolean {

        return this.warnings.some(

            w => w.blocking

        );

    }

/**
 * =============================================================================
 * Devuelve un resumen del Workflow
 * =============================================================================
 */

    public getWorkflowSummary() {

        return {

            currentStage:

                this.workflow.currentStage,

            completed:

                this.workflow.completedStages.length,

            skipped:

                this.workflow.skippedStages.length,

            failed:

                this.workflow.failedStages.length,

            successful:

                this.workflow.successful

        };

    }

/**
 * =============================================================================
 * Registra el inicio de auditoría
 * =============================================================================
 */

    public startAudit(

        user: string,

        applicationVersion: string,

        engineVersion: string

    ): void {

        this.audit.generatedBy = user;

        this.audit.startedAt =

            new Date().toISOString() as ISODate;

        this.audit.applicationVersion =

            applicationVersion;

        this.audit.engineVersion =

            engineVersion;

    }

/**
 * =============================================================================
 * Finaliza la auditoría
 * =============================================================================
 */

    public finishAudit(): void {

        this.audit.finishedAt =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Devuelve la duración total
 * =============================================================================
 */

    public getExecutionTime(): number {

        return this.performance.totalMilliseconds;

    }

/**
 * =============================================================================
 * Devuelve si el resultado contiene errores
 * =============================================================================
 */

    public hasErrors(): boolean {

        return this.errors.length > 0;

    }

/**
 * =============================================================================
 * Devuelve si existen advertencias
 * =============================================================================
 */

    public hasWarnings(): boolean {

        return this.warnings.length > 0;

    }

/**
 * =============================================================================
 * Devuelve si la generación fue completamente correcta
 * =============================================================================
 */

    public isSuccessful(): boolean {

        return (

            this.successful &&

            this.errors.length === 0

        );

    }

/**
 * =============================================================================
 * Obtiene todos los documentos exportables
 * =============================================================================
 */

    public getExportableFiles():

        GeneratedFile[] {

        return this.generatedFiles.filter(

            file =>

                file.extension !== ""

        );

    }

/**
 * =============================================================================
 * Obtiene el tamaño total generado
 * =============================================================================
 */

    public getTotalGeneratedSize(): number {

        return this.generatedFiles.reduce(

            (

                total,

                file

            ) =>

                total +

                file.size,

            0

        );

    }

/**
 * =============================================================================
 * Devuelve un resumen estadístico
 * =============================================================================
 */

    public getStatisticsSummary() {

        return {

            documents:

                this.statistics.totalDocuments,

            warnings:

                this.statistics.totalWarnings,

            errors:

                this.statistics.totalErrors,

            recommendations:

                this.statistics.totalRecommendations,

            legalReferences:

                this.statistics.totalLegalReferences,

            executionTime:

                this.statistics.totalExecutionMilliseconds

        };

    }

/**
 * =============================================================================
 * Convierte el resultado a JSON
 * =============================================================================
 */

    public toJSON(): string {

        return JSON.stringify(

            this,

            null,

            2

        );

    }

/**
 * =============================================================================
 * Reconstruye un resultado desde JSON
 * =============================================================================
 */

    public static fromJSON(

        json: string

    ): GenerationResultModel {

        const object =

            JSON.parse(json);

        const result =

            new GenerationResultModel();

        Object.assign(

            result,

            object

        );

        return result;

    }

/**
 * =============================================================================
 * Clona completamente el resultado
 * =============================================================================
 */

    public clone():

        GenerationResultModel {

        return

            GenerationResultModel.fromJSON(

                this.toJSON()

            );

    }

/**
 * =============================================================================
 * Actualiza automáticamente la fecha de exportación
 * =============================================================================
 */

    public touchExport(): void {

        this.exportInformation.exportDate =

            new Date().toISOString() as ISODate;

    }

/**
 * =============================================================================
 * Exporta un objeto preparado para persistencia
 * =============================================================================
 */

    public toPersistenceObject(): Record<string, unknown> {

        return {

            status: this.status,

            resultType: this.resultType,

            successful: this.successful,

            context: this.context,

            generatedFiles: this.generatedFiles,

            validation: this.validation,

            warnings: this.warnings,

            errors: this.errors,

            messages: this.messages,

            legalDecisions: this.legalDecisions,

            legalReasoning: this.legalReasoning,

            legalRecommendations: this.legalRecommendations,

            artificialIntelligence:

                this.artificialIntelligence,

            statistics: this.statistics,

            performance: this.performance,

            exportInformation:

                this.exportInformation,

            workflow: this.workflow,

            pipeline: this.pipeline,

            audit: this.audit

        };

    }

/**
 * =============================================================================
 * Restaura el resultado desde persistencia
 * =============================================================================
 */

    public loadFromPersistence(

        object: Partial<GenerationResult>

    ): void {

        Object.assign(

            this,

            object

        );

    }

/**
 * =============================================================================
 * Obtiene un resumen ejecutivo
 * =============================================================================
 */

    public getExecutiveSummary() {

        return {

            status:

                this.status,

            successful:

                this.successful,

            documents:

                this.generatedFiles.length,

            warnings:

                this.warnings.length,

            errors:

                this.errors.length,

            legalRecommendations:

                this.legalRecommendations.length,

            aiRecommendations:

                this.artificialIntelligence

                    .recommendations.length,

            executionTime:

                this.performance.totalMilliseconds,

            exportedFormats:

                this.exportInformation

                    .formats.length

        };

    }

/**
 * =============================================================================
 * Devuelve un contexto para logs
 * =============================================================================
 */

    public getLogContext() {

        return {

            generationId:

                this.audit.generationId,

            status:

                this.status,

            workflow:

                this.workflow.currentStage,

            executionTime:

                this.performance.totalMilliseconds,

            documents:

                this.generatedFiles.length

        };

    }

/**
 * =============================================================================
 * Reinicia completamente el resultado
 * =============================================================================
 */

    public reset(): void {

        this.initialize();

    }

/**
 * =============================================================================
 * Comprueba si existen documentos pendientes de exportación
 * =============================================================================
 */

    public hasPendingExports(): boolean {

        return this.generatedFiles.some(

            document =>

                !this.exportInformation.formats.some(

                    format =>

                        format.fileName ===

                        document.fileName

                )

        );

    }

/**
 * =============================================================================
 * Obtiene el porcentaje global de ejecución
 * =============================================================================
 */

    public getCompletionPercentage(): number {

        switch (

            this.status

        ) {

            case GenerationStatus.NOT_STARTED:

                return 0;

            case GenerationStatus.INITIALIZING:

                return 5;

            case GenerationStatus.ANALYZING:

                return 20;

            case GenerationStatus.APPLYING_RULES:

                return 35;

            case GenerationStatus.LEGAL_REASONING:

                return 55;

            case GenerationStatus.GENERATING_DOCUMENTS:

                return 75;

            case GenerationStatus.VALIDATING:

                return 90;

            case GenerationStatus.EXPORTING:

                return 98;

            case GenerationStatus.COMPLETED:

            case GenerationStatus.COMPLETED_WITH_WARNINGS:

                return 100;

            case GenerationStatus.FAILED:

                return 100;

            default:

                return 0;

        }

    }

/**
 * =============================================================================
 * Devuelve el resultado preparado para API
 * =============================================================================
 */

    public toApiResponse() {

        return {

            success:

                this.successful,

            status:

                this.status,

            summary:

                this.getExecutiveSummary(),

            documents:

                this.generatedFiles,

            validation:

                this.validation

        };

    }

/**
 * =============================================================================
 * Devuelve un resumen completo para Dashboard
 * =============================================================================
 */

    public getDashboardInformation() {

        return {

            generationId:

                this.audit.generationId,

            status:

                this.status,

            successful:

                this.successful,

            progress:

                this.getCompletionPercentage(),

            documents:

                this.generatedFiles.length,

            warnings:

                this.warnings.length,

            errors:

                this.errors.length,

            legalDecisions:

                this.legalDecisions.length,

            aiRecommendations:

                this.artificialIntelligence
                    .recommendations.length,

            executionTime:

                this.performance.totalMilliseconds,

            pipelineSuccess:

                this.getPipelineSuccessPercentage()

        };

    }

/**
 * =============================================================================
 * Devuelve un resumen para exportación
 * =============================================================================
 */

    public getExportSummary() {

        return {

            exported:

                this.exportInformation.formats.length,

            compressed:

                this.exportInformation.compressed,

            encrypted:

                this.exportInformation.encrypted,

            totalSize:

                this.getTotalGeneratedSize()

        };

    }

/**
 * =============================================================================
 * Comprueba si el expediente puede publicarse
 * =============================================================================
 */

    public canBePublished(): boolean {

        return (

            this.successful &&

            this.errors.length === 0 &&

            this.validation.valid &&

            this.generatedFiles.length > 0

        );

    }

/**
 * =============================================================================
 * Limpia mensajes informativos
 * =============================================================================
 */

    public clearMessages(): void {

        this.messages = [];

    }

/**
 * =============================================================================
 * Limpia advertencias
 * =============================================================================
 */

    public clearWarnings(): void {

        this.warnings = [];

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Limpia errores
 * =============================================================================
 */

    public clearErrors(): void {

        this.errors = [];

        this.recalculateStatistics();

    }

/**
 * =============================================================================
 * Limpia recomendaciones jurídicas
 * =============================================================================
 */

    public clearLegalRecommendations(): void {

        this.legalRecommendations = [];

    }

/**
 * =============================================================================
 * Limpia decisiones jurídicas
 * =============================================================================
 */

    public clearLegalDecisions(): void {

        this.legalDecisions = [];

    }

/**
 * =============================================================================
 * Limpia motivaciones jurídicas
 * =============================================================================
 */

    public clearLegalReasoning(): void {

        this.legalReasoning = [];

    }

/**
 * =============================================================================
 * Libera memoria temporal
 * =============================================================================
 */

    public dispose(): void {

        this.messages = [];

        this.warnings = [];

        this.errors = [];

        this.pipeline.executedSteps = [];

    }

/**
 * =============================================================================
 * Representación textual
 * =============================================================================
 */

    public toString(): string {

        return [

            "GenerationResult {",

            ` status="${this.status}"`,

            ` successful=${this.successful}`,

            ` documents=${this.generatedFiles.length}`,

            ` warnings=${this.warnings.length}`,

            ` errors=${this.errors.length}`,

            ` execution=${this.performance.totalMilliseconds}ms`,

            "}"

        ].join("");

    }

}

/**
 * =============================================================================
 * FACTORÍA
 * =============================================================================
 */

export class GenerationResultFactory {

    /**
     * Resultado vacío.
     */

    public static create():

        GenerationResultModel {

        return new GenerationResultModel();

    }

    /**
     * Resultado desde JSON.
     */

    public static fromJSON(

        json: string

    ): GenerationResultModel {

        return GenerationResultModel.fromJSON(

            json

        );

    }

    /**
     * Resultado desde objeto.
     */

    public static fromObject(

        object: Partial<GenerationResult>

    ): GenerationResultModel {

        const result =

            new GenerationResultModel();

        result.loadFromPersistence(

            object

        );

        return result;

    }

}

/**
 * =============================================================================
 * CONSTANTES DEL MÓDULO
 * =============================================================================
 */

export const GENERATION_RESULT_VERSION = "1.0.0";

export const GENERATION_RESULT_SCHEMA = "ACP-GENERATION-RESULT";

export const GENERATION_RESULT_DESCRIPTION =
    "Resultado completo de generación de un expediente.";

/**
 * =============================================================================
 * TIPOS SOPORTADOS PARA EXPORTACIÓN
 * =============================================================================
 */

export const SUPPORTED_EXPORT_FORMATS = [

    "pdf",

    "docx",

    "odt",

    "html",

    "json",

    "xml",

    "xlsx",

    "csv",

    "zip"

] as const;

/**
 * =============================================================================
 * UTILIDAD DE VALIDACIÓN
 * =============================================================================
 */

export namespace GenerationResultValidator {

    /**
     * Comprueba que el resultado contiene la información mínima
     * para ser tratado por el resto del sistema.
     */

    export function validate(

        result: GenerationResult

    ): boolean {

        return (

            result.context !== undefined &&

            result.validation !== undefined &&

            result.statistics !== undefined &&

            result.performance !== undefined &&

            result.audit !== undefined

        );

    }

}

/**
 * =============================================================================
 * UTILIDAD DE SERIALIZACIÓN
 * =============================================================================
 */

export namespace GenerationResultSerializer {

    export function serialize(

        result: GenerationResult

    ): string {

        return JSON.stringify(

            result,

            null,

            2

        );

    }

    export function deserialize(

        json: string

    ): GenerationResultModel {

        return GenerationResultModel.fromJSON(

            json

        );

    }

}

/**
 * =============================================================================
 * NOTAS DE DISEÑO
 * =============================================================================
 *
 * Este archivo constituye el contrato de salida del núcleo
 * de generación del Asistente de Contratación Pública.
 *
 * Ningún módulo deberá devolver información fuera de
 * GenerationResult.
 *
 * El objeto está diseñado para permitir:
 *
 *  • Persistencia.
 *  • Exportación.
 *  • Auditoría.
 *  • Diagnóstico.
 *  • Integración API.
 *  • Integración IA.
 *  • Versionado.
 *  • Reproducción completa de una generación.
 *
 * Consumidores principales:
 *
 *  • ContractGenerator
 *  • WorkflowEngine
 *  • RuleEngine
 *  • InferenceEngine
 *  • LegalReasoner
 *  • ValidationEngine
 *  • DocumentGenerator
 *  • ExportManager
 *  • REST API
 *  • Frontend
 *
 * =============================================================================
 *
 * FIN DEL ARCHIVO
 *
 * =============================================================================
 */

}
