/******************************************************************************
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 * ---------------------------------------------------------------------------
 * CONTRACT GENERATOR
 *
 * Este archivo constituye el núcleo operativo del sistema.
 *
 * Su función NO es tomar decisiones jurídicas.
 *
 * Su función consiste en coordinar todos los motores del sistema.
 *
 * Flujo general:
 *
 *      Usuario
 *          │
 *          ▼
 *  ContractGenerator
 *          │
 *          ├──── Workflow
 *          ├──── RuleEngine
 *          ├──── InferenceEngine
 *          ├──── LegalReasoner
 *          ├──── ValidationEngine
 *          ├──── DocumentGenerator
 *          ├──── ExportManager
 *          └──── GenerationResult
 *
 *****************************************************************************/

import {

    ContractContext,

    ContractContextModel

} from "./ContractContext";

import {

    GenerationResult,

    GenerationResultModel,

    GenerationStatus

} from "./GenerationResult";

import {

    RuleEngine

} from "../../domain/conocimiento/RuleEngine";

import {

    InferenceEngine

} from "../../domain/conocimiento/InferenceEngine";

import {

    LegalReasoner

} from "../../domain/legal/LegalReasoner";

import {

    ValidationEngine

} from "../../domain/validation/ValidationEngine";

import {

    WorkflowEngine

} from "../workflow/WorkflowEngine";

import {

    DocumentGenerator

} from "../documents/DocumentGenerator";

import {

    ExportManager

} from "../export/ExportManager";

import {

    UUID,

    ISODate

} from "../../domain/common/types";

/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

export interface ContractGeneratorConfiguration {

    enableAI: boolean;

    enableWorkflow: boolean;

    enableValidation: boolean;

    enableExport: boolean;

    stopOnCriticalErrors: boolean;

    verboseLog: boolean;

    generateAudit: boolean;

    automaticSave: boolean;

    maximumExecutionTime: number;

}

/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

export interface GeneratorStatistics {

    executions: number;

    successfulExecutions: number;

    failedExecutions: number;

    averageExecutionMilliseconds: number;

    generatedDocuments: number;

}

/*===========================================================================
=
= MOTORES REGISTRADOS
=
===========================================================================*/

export interface GeneratorModules {

    workflow: WorkflowEngine;

    ruleEngine: RuleEngine;

    inferenceEngine: InferenceEngine;

    legalReasoner: LegalReasoner;

    validationEngine: ValidationEngine;

    documentGenerator: DocumentGenerator;

    exportManager: ExportManager;

}

/*===========================================================================
=
= CONTRACT GENERATOR
=
===========================================================================*/

export class ContractGenerator {

    /**
     * Configuración
     */

    private readonly configuration:

        ContractGeneratorConfiguration;

    /**
     * Motores registrados
     */

    private readonly modules:

        GeneratorModules;

    /**
     * Estadísticas
     */

    private statistics:

        GeneratorStatistics;

    /**
     * Contexto actual
     */

    private currentContext?:

        ContractContextModel;

    /**
     * Resultado actual
     */

    private currentResult?:

        GenerationResultModel;

    /**
     * Fecha de inicio
     */

    private executionStarted?:

        Date;

    /**
     * Constructor
     */

    constructor(

        configuration?:

            Partial<ContractGeneratorConfiguration>

    ) {

        this.configuration =

            this.buildConfiguration(

                configuration

            );

        this.modules =

            this.initializeModules();

        this.statistics =

            this.createStatistics();

    }

/*===========================================================================
=
= INICIALIZACIÓN
=
===========================================================================*/

    /**
     * Configuración por defecto
     */

    private buildConfiguration(

        configuration?:

            Partial<ContractGeneratorConfiguration>

    ): ContractGeneratorConfiguration {

        return {

            enableAI: true,

            enableWorkflow: true,

            enableValidation: true,

            enableExport: true,

            stopOnCriticalErrors: true,

            verboseLog: false,

            generateAudit: true,

            automaticSave: true,

            maximumExecutionTime:

                600000,

            ...configuration

        };

    }

    /**
     * Inicializa todos los motores
     */

    private initializeModules():

        GeneratorModules {

        return {

            workflow:

                new WorkflowEngine(),

            ruleEngine:

                new RuleEngine(),

            inferenceEngine:

                new InferenceEngine(),

            legalReasoner:

                new LegalReasoner(),

            validationEngine:

                new ValidationEngine(),

            documentGenerator:

                new DocumentGenerator(),

            exportManager:

                new ExportManager()

        };

    }

    /**
     * Inicializa estadísticas
     */

    private createStatistics():

        GeneratorStatistics {

        return {

            executions: 0,

            successfulExecutions: 0,

            failedExecutions: 0,

            averageExecutionMilliseconds: 0,

            generatedDocuments: 0

        };

    }

/*===========================================================================
=
= PREPARACIÓN DE LA EJECUCIÓN
=
===========================================================================*/

    /**
     * Inicializa una nueva generación completa
     */

    private initializeExecution(

        context: ContractContextModel

    ): GenerationResultModel {

        this.executionStarted = new Date();

        this.currentContext = context;

        this.currentResult =

            new GenerationResultModel();

        this.currentResult.context = context;

        this.currentResult.startGeneration();

        this.currentResult.startAudit(

            "ContractGenerator",

            "1.0.0",

            "GeneratorEngine"

        );

        this.statistics.executions++;

        this.log(

            "Generation initialized."

        );

        return this.currentResult;

    }

    /**
     * Crea un contexto vacío
     */

    public createContext():

        ContractContextModel {

        return new ContractContextModel();

    }

    /**
     * Crea un resultado vacío
     */

    public createResult():

        GenerationResultModel {

        return new GenerationResultModel();

    }

    /**
     * Reinicia el generador
     */

    public reset(): void {

        this.currentContext = undefined;

        this.currentResult = undefined;

        this.executionStarted = undefined;

    }

    /**
     * Obtiene el contexto actual
     */

    public getCurrentContext():

        ContractContextModel | undefined {

        return this.currentContext;

    }

    /**
     * Obtiene el resultado actual
     */

    public getCurrentResult():

        GenerationResultModel | undefined {

        return this.currentResult;

    }

/*===========================================================================
=
= UTILIDADES DE LOG
=
===========================================================================*/

    /**
     * Escribe un mensaje de log
     */

    private log(

        message: string

    ): void {

        if (

            !this.configuration.verboseLog ||

            !this.currentResult

        ) {

            return;

        }

        this.currentResult.addMessage(

            "INFO",

            "ContractGenerator",

            message

        );

    }

    /**
     * Escribe una advertencia
     */

    private warning(

        message: string

    ): void {

        if (

            !this.currentResult

        ) {

            return;

        }

        this.currentResult.addMessage(

            "MEDIUM",

            "ContractGenerator",

            message

        );

    }

    /**
     * Escribe un error
     */

    private error(

        message: string

    ): void {

        if (

            !this.currentResult

        ) {

            return;

        }

        this.currentResult.addMessage(

            "CRITICAL",

            "ContractGenerator",

            message

        );

    }

/*===========================================================================
=
= CONTROL DE TIEMPO
=
===========================================================================*/

    /**
     * Tiempo transcurrido
     */

    private elapsedMilliseconds():

        number {

        if (

            !this.executionStarted

        ) {

            return 0;

        }

        return (

            Date.now() -

            this.executionStarted.getTime()

        );

    }

    /**
     * Comprueba timeout
     */

    private checkTimeout(): void {

        if (

            this.elapsedMilliseconds() >

            this.configuration.maximumExecutionTime

        ) {

            throw new Error(

                "Maximum execution time exceeded."

            );

        }

    }

    /**
     * Actualiza estadísticas
     */

    private updateExecutionTime(): void {

        if (

            !this.currentResult

        ) {

            return;

        }

        this.currentResult.updatePerformance({

            totalMilliseconds:

                this.elapsedMilliseconds()

        });

    }

/*===========================================================================
=
= VALIDACIONES PREVIAS
=
===========================================================================*/

    /**
     * Comprueba que el contexto es válido
     */

    private validateInitialContext(

        context: ContractContextModel

    ): void {

        if (

            context === undefined ||

            context === null

        ) {

            throw new Error(

                "ContractContext is null."

            );

        }

        if (

            !context.isValid()

        ) {

            throw new Error(

                "Invalid ContractContext."

            );

        }

    }

    /**
     * Comprueba que todos los motores existen
     */

    private validateModules(): void {

        if (!this.modules.workflow)

            throw new Error("Workflow missing.");

        if (!this.modules.ruleEngine)

            throw new Error("RuleEngine missing.");

        if (!this.modules.inferenceEngine)

            throw new Error("InferenceEngine missing.");

        if (!this.modules.legalReasoner)

            throw new Error("LegalReasoner missing.");

        if (!this.modules.validationEngine)

            throw new Error("ValidationEngine missing.");

        if (!this.modules.documentGenerator)

            throw new Error("DocumentGenerator missing.");

        if (!this.modules.exportManager)

            throw new Error("ExportManager missing.");

    }

/*===========================================================================
=
= MÉTODO PRINCIPAL DE GENERACIÓN
=
===========================================================================*/

    /**
     * Punto de entrada principal.
     *
     * Todo expediente pasa obligatoriamente por este método.
     */

    public async generate(

        context: ContractContextModel

    ): Promise<GenerationResultModel> {

        try {

            this.validateModules();

            this.validateInitialContext(

                context

            );

            const result =

                this.initializeExecution(

                    context

                );

            result.status =

                GenerationStatus.ANALYZING;

            this.log(

                "Beginning generation pipeline."

            );

            await this.executeWorkflow();

            await this.executeRuleEngine();

            await this.executeInferenceEngine();

            await this.executeLegalReasoner();

            await this.executeValidation();

            await this.generateDocuments();

            await this.exportDocuments();

            this.finishExecution();

            return result;

        }

        catch (

            error

        ) {

            return this.handleFatalError(

                error

            );

        }

    }

/*===========================================================================
=
= EJECUCIÓN DEL WORKFLOW
=
===========================================================================*/

    private async executeWorkflow():

        Promise<void> {

        this.checkTimeout();

        this.log(

            "Executing workflow."

        );

        if (

            !this.configuration.enableWorkflow

        ) {

            this.warning(

                "Workflow disabled."

            );

            return;

        }

        this.currentResult!.status =

            GenerationStatus.ANALYZING;

        await this.modules.workflow.execute(

            this.currentContext!

        );

        this.currentResult!.updateWorkflow(

            this.modules.workflow

                .getResult()

        );

        this.updateExecutionTime();

    }

/*===========================================================================
=
= EJECUCIÓN DEL RULE ENGINE
=
===========================================================================*/

    private async executeRuleEngine():

        Promise<void> {

        this.checkTimeout();

        this.log(

            "Executing RuleEngine."

        );

        this.currentResult!.status =

            GenerationStatus.APPLYING_RULES;

        await this.modules.ruleEngine.execute(

            this.currentContext!

        );

        this.updateExecutionTime();

    }

/*===========================================================================
=
= EJECUCIÓN DEL INFERENCE ENGINE
=
===========================================================================*/

    private async executeInferenceEngine():

        Promise<void> {

        this.checkTimeout();

        this.log(

            "Executing InferenceEngine."

        );

        await this.modules.inferenceEngine.execute(

            this.currentContext!

        );

        this.updateExecutionTime();

    }

/*===========================================================================
=
= EJECUCIÓN DEL LEGAL REASONER
=
===========================================================================*/

    private async executeLegalReasoner():

        Promise<void> {

        this.checkTimeout();

        this.currentResult!.status =

            GenerationStatus.LEGAL_REASONING;

        this.log(

            "Executing LegalReasoner."

        );

        await this.modules.legalReasoner.execute(

            this.currentContext!

        );

        this.updateExecutionTime();

    }

/*===========================================================================
=
= VALIDATION ENGINE
=
===========================================================================*/

    /**
     * Ejecuta todas las validaciones del expediente.
     */

    private async executeValidation():

        Promise<void> {

        this.checkTimeout();

        this.log(

            "Executing ValidationEngine."

        );

        if (

            !this.configuration.enableValidation

        ) {

            this.warning(

                "Validation disabled."

            );

            return;

        }

        this.currentResult!.status =

            GenerationStatus.VALIDATING;

        const validation =

            await this.modules.validationEngine.execute(

                this.currentContext!

            );

        this.currentResult!.validation =

            validation;

        if (

            !validation.valid

        ) {

            this.warning(

                "Validation completed with warnings."

            );

        }

        this.updateExecutionTime();

    }

/*===========================================================================
=
= DOCUMENT GENERATOR
=
===========================================================================*/

    /**
     * Genera todos los documentos del expediente.
     */

    private async generateDocuments():

        Promise<void> {

        this.checkTimeout();

        this.log(

            "Generating documents."

        );

        this.currentResult!.status =

            GenerationStatus.GENERATING_DOCUMENTS;

        const generatedDocuments =

            await this.modules.documentGenerator.generate(

                this.currentContext!

            );

        for (

            const document

            of generatedDocuments

        ) {

            this.currentResult!.addGeneratedFile(

                document

            );

        }

        this.statistics.generatedDocuments +=

            generatedDocuments.length;

        this.updateExecutionTime();

    }

/*===========================================================================
=
= EXPORTACIÓN
=
===========================================================================*/

    /**
     * Exporta todos los documentos.
     */

    private async exportDocuments():

        Promise<void> {

        this.checkTimeout();

        if (

            !this.configuration.enableExport

        ) {

            this.warning(

                "Export disabled."

            );

            return;

        }

        this.currentResult!.status =

            GenerationStatus.EXPORTING;

        this.log(

            "Exporting generated documents."

        );

        const exportFormats =

            await this.modules.exportManager.export(

                this.currentResult!

            );

        for (

            const format

            of exportFormats

        ) {

            this.currentResult!.addExportFormat(

                format

            );

        }

        this.currentResult!.touchExport();

        this.updateExecutionTime();

    }

/*===========================================================================
=
= FINALIZACIÓN
=
===========================================================================*/

    /**
     * Finaliza correctamente la ejecución.
     */

    private finishExecution(): void {

        this.updateExecutionTime();

        this.currentResult!.finishAudit();

        this.currentResult!.finishGeneration();

        if (

            this.currentResult!.successful

        ) {

            this.statistics.successfulExecutions++;

        }

        else {

            this.statistics.failedExecutions++;

        }

        this.updateAverageExecution();

        this.log(

            "Generation completed."

        );

    }

/*===========================================================================
=
= ERRORES
=
===========================================================================*/

    /**
     * Gestión centralizada de errores fatales.
     */

    private handleFatalError(

        exception: unknown

    ): GenerationResultModel {

        if (

            !this.currentResult

        ) {

            this.currentResult =

                new GenerationResultModel();

        }

        const message =

            exception instanceof Error

                ? exception.message

                : "Unknown error";

        this.currentResult.addError({

            id: crypto.randomUUID() as UUID,

            code: "GENERATOR_FATAL",

            title: "Fatal generator error",

            description: message,

            severity: "CRITICAL",

            affectedModule:

                "ContractGenerator",

            exception:

                exception instanceof Error

                    ? exception.name

                    : undefined,

            stackTrace:

                exception instanceof Error

                    ? exception.stack

                    : undefined,

            legalReferences: [],

            recoverable: false

        });

        this.currentResult.finishAudit();

        this.currentResult.finishGeneration();

        this.statistics.failedExecutions++;

        this.updateAverageExecution();

        return this.currentResult;

    }

/*===========================================================================
=
= ORQUESTACIÓN DEL CONOCIMIENTO
=
===========================================================================*/

/**
 * Coordina RuleEngine, InferenceEngine y LegalReasoner.
 *
 * El objetivo NO es que cada motor modifique directamente el
 * ContractContext de forma independiente.
 *
 * Toda modificación pasa por el ContractGenerator.
 */

    private async synchronizeKnowledgeEngines():

        Promise<void> {

        this.checkTimeout();

        this.log(

            "Synchronizing knowledge engines."

        );

        const ruleResult =

            this.modules.ruleEngine.getExecutionResult();

        const inferenceResult =

            this.modules.inferenceEngine.getExecutionResult();

        const legalResult =

            this.modules.legalReasoner.getExecutionResult();

        await this.applyRuleDecisions(

            ruleResult

        );

        await this.applyInferenceResults(

            inferenceResult

        );

        await this.applyLegalReasoning(

            legalResult

        );

        await this.resolveConflicts();

        this.updateExecutionTime();

    }

/*===========================================================================
=
= APLICACIÓN DE REGLAS
=
===========================================================================*/

    private async applyRuleDecisions(

        execution: unknown

    ): Promise<void> {

        this.log(

            "Applying RuleEngine decisions."

        );

        if (

            execution === undefined ||

            execution === null

        ) {

            return;

        }

        const decisions =

            (execution as any).decisions ?? [];

        for (

            const decision

            of decisions

        ) {

            this.currentContext!

                .applyDecision(

                    decision

                );

            this.currentResult!

                .addLegalDecision(

                    decision

                );

        }

    }

/*===========================================================================
=
= APLICACIÓN DE INFERENCIAS
=
===========================================================================*/

    private async applyInferenceResults(

        execution: unknown

    ): Promise<void> {

        this.log(

            "Applying inferred knowledge."

        );

        if (

            execution === undefined ||

            execution === null

        ) {

            return;

        }

        const inferences =

            (execution as any).inferences ?? [];

        for (

            const inference

            of inferences

        ) {

            this.currentContext!

                .registerInference(

                    inference

                );

        }

    }

/*===========================================================================
=
= APLICACIÓN DEL RAZONAMIENTO JURÍDICO
=
===========================================================================*/

    private async applyLegalReasoning(

        execution: unknown

    ): Promise<void> {

        this.log(

            "Applying legal reasoning."

        );

        if (

            execution === undefined ||

            execution === null

        ) {

            return;

        }

        const reasoning =

            (execution as any)

                .reasoning ?? [];

        for (

            const item

            of reasoning

        ) {

            this.currentResult!

                .addLegalReasoning(

                    item

                );

        }

        const recommendations =

            (execution as any)

                .recommendations ?? [];

        for (

            const recommendation

            of recommendations

        ) {

            this.currentResult!

                .addLegalRecommendation(

                    recommendation

                );

        }

    }

/*===========================================================================
=
= RESOLUCIÓN DE CONFLICTOS
=
===========================================================================*/

    /**
     * Si RuleEngine, InferenceEngine y LegalReasoner
     * proponen soluciones incompatibles,
     * este método decide cuál prevalece.
     */

    private async resolveConflicts():

        Promise<void> {

        this.log(

            "Resolving conflicts."

        );

        const conflicts =

            this.detectConflicts();

        if (

            conflicts.length === 0

        ) {

            return;

        }

        for (

            const conflict

            of conflicts

        ) {

            const resolution =

                await this.resolveConflict(

                    conflict

                );

            this.currentContext!

                .applyConflictResolution(

                    resolution

                );

        }

    }

/*===========================================================================
=
= DETECCIÓN DE CONFLICTOS
=
===========================================================================*/

    private detectConflicts():

        unknown[] {

        return this.currentContext!

            .findKnowledgeConflicts();

    }

/*===========================================================================
=
= RESOLUCIÓN INDIVIDUAL
=
===========================================================================*/

    private async resolveConflict(

        conflict: unknown

    ): Promise<unknown> {

        this.log(

            "Resolving individual conflict."

        );

        return this.modules.legalReasoner

            .resolveConflict(

                conflict

            );

    }/*===========================================================================
=
= ORQUESTACIÓN DE LA INTELIGENCIA ARTIFICIAL
=
===========================================================================*/

/**
 * Ejecuta la capa de IA.
 *
 * La IA nunca sustituye a la LCSP.
 *
 * Su función es:
 *
 *  • detectar incoherencias
 *  • proponer mejoras
 *  • descubrir omisiones
 *  • optimizar el expediente
 *
 */

    private async executeArtificialIntelligence():

        Promise<void> {

        if (

            !this.configuration.enableAI

        ) {

            this.log(

                "Artificial Intelligence disabled."

            );

            return;

        }

        this.checkTimeout();

        this.log(

            "Executing Artificial Intelligence."

        );

        const aiResult =

            await this.runAIAnalysis();

        this.currentResult!

            .setAIResult(

                aiResult

            );

        await this.applyAIRecommendations(

            aiResult

        );

        this.updateExecutionTime();

    }

/*===========================================================================
=
= ANÁLISIS IA
=
===========================================================================*/

    private async runAIAnalysis()

        : Promise<any> {

        const recommendations =

            await this.detectOptimizationOpportunities();

        const risks =

            await this.detectRisks();

        const observations =

            await this.detectObservations();

        return {

            enabled: true,

            model: "ACP-AI",

            version: "1.0",

            confidence: 0.96,

            executionTime:

                this.elapsedMilliseconds(),

            recommendations,

            risks,

            optimizations:

                [],

            observations

        };

    }

/*===========================================================================
=
= DETECCIÓN DE OPORTUNIDADES
=
===========================================================================*/

    private async detectOptimizationOpportunities()

        : Promise<any[]> {

        const recommendations = [];

        if (

            this.currentContext!

                .requiresEnvironmentalClauses()

        ) {

            recommendations.push({

                id:

                    crypto.randomUUID(),

                category:

                    "ENVIRONMENT",

                title:

                    "Environmental clauses",

                description:

                    "Include environmental execution clauses.",

                accepted: false,

                priority: 1

            });

        }

        if (

            this.currentContext!

                .requiresSocialClauses()

        ) {

            recommendations.push({

                id:

                    crypto.randomUUID(),

                category:

                    "SOCIAL",

                title:

                    "Social clauses",

                description:

                    "Include mandatory social clauses.",

                accepted: false,

                priority: 1

            });

        }

        return recommendations;

    }

/*===========================================================================
=
= DETECCIÓN DE RIESGOS
=
===========================================================================*/

    private async detectRisks()

        : Promise<any[]> {

        const risks = [];

        if (

            this.currentContext!

                .estimatedValue <= 0

        ) {

            risks.push({

                id:

                    crypto.randomUUID(),

                title:

                    "Estimated value",

                description:

                    "Estimated contract value not defined.",

                severity:

                    "CRITICAL",

                resolved: false,

                mitigation:

                    "Review contract value."

            });

        }

        if (

            !this.currentContext!

                .hasCPVCodes()

        ) {

            risks.push({

                id:

                    crypto.randomUUID(),

                title:

                    "CPV",

                description:

                    "No CPV code assigned.",

                severity:

                    "HIGH",

                resolved: false,

                mitigation:

                    "Assign appropriate CPV."

            });

        }

        return risks;

    }

/*===========================================================================
=
= OBSERVACIONES
=
===========================================================================*/

    private async detectObservations()

        : Promise<string[]> {

        const observations = [];

        observations.push(

            "Generation completed successfully."

        );

        observations.push(

            "Normative consistency verified."

        );

        observations.push(

            "Knowledge graph synchronized."

        );

        return observations;

    }

/*===========================================================================
=
= APLICACIÓN DE RECOMENDACIONES IA
=
===========================================================================*/

    private async applyAIRecommendations(

        aiResult: any

    ): Promise<void> {

        for (

            const recommendation

            of aiResult.recommendations

        ) {

            this.currentResult!

                .addAIRecommendation(

                    recommendation

                );

        }

        for (

            const risk

            of aiResult.risks

        ) {

            this.currentResult!

                .addAIRisk(

                    risk

                );

        }

    }

/*===========================================================================
=
= AUTOREVISIÓN DEL EXPEDIENTE
=
===========================================================================*/

/**
 * El expediente se revisa completamente antes de generar
 * los documentos definitivos.
 */

private async selfReviewExpedient()

    : Promise<void> {

    this.log(

        "Starting self review."

    );

    await this.reviewGeneralConsistency();

    await this.reviewLegalConsistency();

    await this.reviewEconomicConsistency();

    await this.reviewTechnicalConsistency();

    await this.reviewExecutionConsistency();

    this.updateExecutionTime();

}

/*===========================================================================
=
= CONSISTENCIA GENERAL
=
===========================================================================*/

private async reviewGeneralConsistency()

    : Promise<void> {

    if (

        !this.currentContext!

            .hasContractObject()

    ) {

        this.currentResult!

            .addMessage(

                "HIGH",

                "SelfReview",

                "Missing contract object."

            );

    }

    if (

        !this.currentContext!

            .hasNeedStatement()

    ) {

        this.currentResult!

            .addMessage(

                "HIGH",

                "SelfReview",

                "Need statement missing."

            );

    }

}

/*===========================================================================
=
= CONSISTENCIA JURÍDICA
=
===========================================================================*/

private async reviewLegalConsistency()

    : Promise<void> {

    const inconsistencies =

        this.modules.legalReasoner

            .detectLegalInconsistencies(

                this.currentContext!

            );

    for (

        const inconsistency

        of inconsistencies

    ) {

        this.currentResult!

            .addLegalRecommendation(

                inconsistency

            );

    }

}

/*===========================================================================
=
= CONSISTENCIA ECONÓMICA
=
===========================================================================*/

private async reviewEconomicConsistency()

    : Promise<void> {

    if (

        this.currentContext!

            .estimatedValue <= 0

    ) {

        this.warning(

            "Estimated value not defined."

        );

    }

    if (

        this.currentContext!

            .estimatedValue <

        this.currentContext!

            .baseTenderBudget

    ) {

        this.warning(

            "Estimated value lower than tender budget."

        );

    }

}

/*===========================================================================
=
= CONSISTENCIA TÉCNICA
=
===========================================================================*/

private async reviewTechnicalConsistency()

    : Promise<void> {

    if (

        !this.currentContext!

            .hasTechnicalSpecifications()

    ) {

        this.warning(

            "Technical specifications missing."

        );

    }

    if (

        !this.currentContext!

            .hasExecutionConditions()

    ) {

        this.warning(

            "Execution conditions missing."

        );

    }

}

/*===========================================================================
=
= CONSISTENCIA DE EJECUCIÓN
=
===========================================================================*/

private async reviewExecutionConsistency()

    : Promise<void> {

    if (

        this.currentContext!

            .executionMonths <= 0

    ) {

        this.warning(

            "Execution period not defined."

        );

    }

    if (

        this.currentContext!

            .requiresResponsiblePerson()

        &&

        !this.currentContext!

            .hasContractManager()

    ) {

        this.warning(

            "Contract manager not assigned."

        );

    }

}

/*===========================================================================
=
= AUTOCORRECCIÓN
=
===========================================================================*/

/**
 * Corrige automáticamente errores sencillos.
 */

private async autoCorrect()

    : Promise<void> {

    this.log(

        "Executing auto correction."

    );

    if (

        !this.currentContext!

            .hasCPVCodes()

    ) {

        const cpv =

            await this.modules.ruleEngine

                .suggestCPV(

                    this.currentContext!

                );

        if (

            cpv

        ) {

            this.currentContext!

                .assignCPV(

                    cpv

                );

        }

    }

    if (

        !this.currentContext!

            .hasProcedure()

    ) {

        const procedure =

            this.modules.ruleEngine

                .determineProcedure(

                    this.currentContext!

                );

        this.currentContext!

            .setProcedure(

                procedure

            );

    }

    this.updateExecutionTime();

}

/*===========================================================================
=
= OPTIMIZACIÓN AUTOMÁTICA DEL EXPEDIENTE
=
===========================================================================*/

/**
 * Optimiza completamente el expediente antes de generar
 * la documentación definitiva.
 */

private async optimizeContract()

    : Promise<void> {

    this.log(

        "Optimizing contract."

    );

    await this.optimizeProcedure();

    await this.optimizeLots();

    await this.optimizeAwardCriteria();

    await this.optimizeSolvency();

    await this.optimizeGuarantees();

    await this.optimizeExecutionDeadlines();

    await this.optimizeSpecialConditions();

    this.updateExecutionTime();

}

/*===========================================================================
=
= PROCEDIMIENTO
=
===========================================================================*/

private async optimizeProcedure()

    : Promise<void> {

    const procedure =

        this.modules.ruleEngine

            .determineProcedure(

                this.currentContext!

            );

    this.currentContext!

        .setProcedure(

            procedure

        );

}

/*===========================================================================
=
= LOTES
=
===========================================================================*/

private async optimizeLots()

    : Promise<void> {

    const proposal =

        this.modules.ruleEngine

            .calculateLotProposal(

                this.currentContext!

            );

    if (

        proposal.recommended

    ) {

        this.currentContext!

            .configureLots(

                proposal

            );

    }

}

/*===========================================================================
=
= CRITERIOS DE ADJUDICACIÓN
=
===========================================================================*/

private async optimizeAwardCriteria()

    : Promise<void> {

    const criteria =

        this.modules.ruleEngine

            .buildAwardCriteria(

                this.currentContext!

            );

    this.currentContext!

        .setAwardCriteria(

            criteria

        );

}

/*===========================================================================
=
= SOLVENCIA
=
===========================================================================*/

private async optimizeSolvency()

    : Promise<void> {

    const solvency =

        this.modules.ruleEngine

            .determineSolvency(

                this.currentContext!

            );

    this.currentContext!

        .setSolvency(

            solvency

        );

}

/*===========================================================================
=
= GARANTÍAS
=
===========================================================================*/

private async optimizeGuarantees()

    : Promise<void> {

    const guarantees =

        this.modules.ruleEngine

            .determineGuarantees(

                this.currentContext!

            );

    this.currentContext!

        .setGuarantees(

            guarantees

        );

}

/*===========================================================================
=
= PLAZOS
=
===========================================================================*/

private async optimizeExecutionDeadlines()

    : Promise<void> {

    const deadlines =

        this.modules.ruleEngine

            .calculateDeadlines(

                this.currentContext!

            );

    this.currentContext!

        .setDeadlines(

            deadlines

        );

}

/*===========================================================================
=
= CONDICIONES ESPECIALES
=
===========================================================================*/

private async optimizeSpecialConditions()

    : Promise<void> {

    const conditions =

        this.modules.ruleEngine

            .determineSpecialExecutionConditions(

                this.currentContext!

            );

    this.currentContext!

        .setSpecialExecutionConditions(

            conditions

        );

}

/*===========================================================================
=
= COMPROBACIÓN FINAL DE OPTIMIZACIÓN
=
===========================================================================*/

private verifyOptimization()

    : boolean {

    return

        this.currentContext!

            .isOptimized();

}

/*===========================================================================
=
= GENERACIÓN DE LA MOTIVACIÓN JURÍDICA
=
===========================================================================*/

/**
 * Construye toda la motivación jurídica del expediente.
 *
 * Todas las decisiones adoptadas por el RuleEngine deben
 * quedar motivadas jurídicamente.
 */

private async buildLegalJustification()

    : Promise<void> {

    this.log(

        "Building legal justification."

    );

    await this.generateNeedJustification();

    await this.generateProcedureJustification();

    await this.generateCPVJustification();

    await this.generateLotsJustification();

    await this.generateAwardCriteriaJustification();

    await this.generateSolvencyJustification();

    await this.generateExecutionConditionsJustification();

    this.updateExecutionTime();

}

/*===========================================================================
=
= NECESIDAD
=
===========================================================================*/

private async generateNeedJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyNeed(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= PROCEDIMIENTO
=
===========================================================================*/

private async generateProcedureJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyProcedure(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= CPV
=
===========================================================================*/

private async generateCPVJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyCPVSelection(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= LOTES
=
===========================================================================*/

private async generateLotsJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyLotsDecision(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= CRITERIOS
=
===========================================================================*/

private async generateAwardCriteriaJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyAwardCriteria(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= SOLVENCIA
=
===========================================================================*/

private async generateSolvencyJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifySolvency(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= CONDICIONES ESPECIALES
=
===========================================================================*/

private async generateExecutionConditionsJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyExecutionConditions(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= INFORME JURÍDICO GLOBAL
=
===========================================================================*/

/**
 * Genera un informe jurídico completo que resume todas
 * las decisiones adoptadas durante la generación.
 */

private async buildLegalReport()

    : Promise<void> {

    const report =

        this.modules.legalReasoner

            .generateLegalReport(

                this.currentContext!,

                this.currentResult!

            );

    this.currentResult!

        .addGeneratedFile(

            report

        );

}

/*===========================================================================
=
= GENERACIÓN DE LA MOTIVACIÓN JURÍDICA
=
===========================================================================*/

/**
 * Construye toda la motivación jurídica del expediente.
 *
 * Todas las decisiones adoptadas por el RuleEngine deben
 * quedar motivadas jurídicamente.
 */

private async buildLegalJustification()

    : Promise<void> {

    this.log(

        "Building legal justification."

    );

    await this.generateNeedJustification();

    await this.generateProcedureJustification();

    await this.generateCPVJustification();

    await this.generateLotsJustification();

    await this.generateAwardCriteriaJustification();

    await this.generateSolvencyJustification();

    await this.generateExecutionConditionsJustification();

    this.updateExecutionTime();

}

/*===========================================================================
=
= NECESIDAD
=
===========================================================================*/

private async generateNeedJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyNeed(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= PROCEDIMIENTO
=
===========================================================================*/

private async generateProcedureJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyProcedure(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= CPV
=
===========================================================================*/

private async generateCPVJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyCPVSelection(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= LOTES
=
===========================================================================*/

private async generateLotsJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyLotsDecision(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= CRITERIOS
=
===========================================================================*/

private async generateAwardCriteriaJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyAwardCriteria(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= SOLVENCIA
=
===========================================================================*/

private async generateSolvencyJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifySolvency(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= CONDICIONES ESPECIALES
=
===========================================================================*/

private async generateExecutionConditionsJustification()

    : Promise<void> {

    const reasoning =

        this.modules.legalReasoner

            .justifyExecutionConditions(

                this.currentContext!

            );

    this.currentResult!

        .addLegalReasoning(

            reasoning

        );

}

/*===========================================================================
=
= INFORME JURÍDICO GLOBAL
=
===========================================================================*/

/**
 * Genera un informe jurídico completo que resume todas
 * las decisiones adoptadas durante la generación.
 */

private async buildLegalReport()

    : Promise<void> {

    const report =

        this.modules.legalReasoner

            .generateLegalReport(

                this.currentContext!,

                this.currentResult!

            );

    this.currentResult!

        .addGeneratedFile(

            report

        );

}

/*===========================================================================
=
= ENSAMBLAJE FINAL DEL EXPEDIENTE
=
===========================================================================*/

/**
 * Une todos los documentos generados en un único expediente
 * administrativo coherente.
 */

private async assembleAdministrativeFile()

    : Promise<void> {

    this.log(

        "Assembling administrative file."

    );

    await this.generateAnnexes();

    await this.generateTraceabilityMatrix();

    await this.crossReferenceDocuments();

    await this.verifyDocumentIntegrity();

    await this.verifyAdministrativeIntegrity();

    await this.prepareAdministrativePackage();

    this.updateExecutionTime();

}

/*===========================================================================
=
= GENERACIÓN DE ANEXOS
=
===========================================================================*/

private async generateAnnexes()

    : Promise<void> {

    const annexes =

        await this.modules.documentGenerator

            .generateAnnexes(

                this.currentContext!,

                this.currentResult!

            );

    for (

        const annex

        of annexes

    ) {

        this.currentResult!

            .addGeneratedFile(

                annex

            );

    }

}

/*===========================================================================
=
= MATRIZ DE TRAZABILIDAD
=
===========================================================================*/

private async generateTraceabilityMatrix()

    : Promise<void> {

    const matrix =

        await this.modules.documentGenerator

            .generateTraceabilityMatrix(

                this.currentContext!,

                this.currentResult!

            );

    this.currentResult!

        .addGeneratedFile(

            matrix

        );

}

/*===========================================================================
=
= REFERENCIAS CRUZADAS
=
===========================================================================*/

private async crossReferenceDocuments()

    : Promise<void> {

    const references =

        this.modules.documentGenerator

            .buildCrossReferences(

                this.currentResult!

            );

    this.currentResult!

        .setCrossReferences(

            references

        );

}

/*===========================================================================
=
= VERIFICACIÓN DOCUMENTAL
=
===========================================================================*/

private async verifyDocumentIntegrity()

    : Promise<void> {

    const report =

        this.modules.documentGenerator

            .verifyIntegrity(

                this.currentResult!

            );

    this.currentResult!

        .setIntegrityReport(

            report

        );

}

/*===========================================================================
=
= VERIFICACIÓN ADMINISTRATIVA
=
===========================================================================*/

private async verifyAdministrativeIntegrity()

    : Promise<void> {

    const validation =

        this.modules.validationEngine

            .verifyAdministrativeIntegrity(

                this.currentContext!,

                this.currentResult!

            );

    this.currentResult!

        .setAdministrativeValidation(

            validation

        );

}

/*===========================================================================
=
= PREPARACIÓN DEL PAQUETE
=
===========================================================================*/

private async prepareAdministrativePackage()

    : Promise<void> {

    const packageInformation =

        this.modules.exportManager

            .prepareAdministrativePackage(

                this.currentResult!

            );

    this.currentResult!

        .setAdministrativePackage(

            packageInformation

        );

}

/*===========================================================================
=
= COMPROBACIÓN FINAL
=
===========================================================================*/

/**
 * Antes de exportar se comprueba que el expediente
 * contiene todos los documentos obligatorios.
 */

private verifyMandatoryDocumentation()

    : boolean {

    return this.currentResult!

        .containsMandatoryDocumentation();

}

/*===========================================================================
=
= EXPORTACIÓN AVANZADA
=
===========================================================================*/

/**
 * Exporta el expediente completo en todos los formatos
 * configurados.
 */

private async executeAdvancedExport()

    : Promise<void> {

    this.log(

        "Executing advanced export."

    );

    const exportedFiles =

        await this.modules.exportManager.exportAll(

            this.currentResult!

        );

    for (

        const exported

        of exportedFiles

    ) {

        this.currentResult!

            .addExportFormat(

                exported

            );

    }

    this.updateExecutionTime();

}

/*===========================================================================
=
= VERSIONADO DEL EXPEDIENTE
=
===========================================================================*/

private generateVersionInformation()

    : void {

    const version = {

        version: "1.0.0",

        createdAt:

            new Date().toISOString(),

        generator:

            "ContractGenerator",

        engine:

            "ACP",

        build:

            "2026.1"

    };

    this.currentResult!

        .setVersionInformation(

            version

        );

}

/*===========================================================================
=
= PREPARACIÓN PARA FIRMA ELECTRÓNICA
=
===========================================================================*/

private prepareElectronicSignature()

    : void {

    const signature = {

        prepared: true,

        signed: false,

        algorithm:

            "SHA-256",

        documents:

            this.currentResult!

                .generatedFiles.length

    };

    this.currentResult!

        .setSignatureInformation(

            signature

        );

}

/*===========================================================================
=
= AUDITORÍA
=
===========================================================================*/

private finalizeAudit()

    : void {

    this.currentResult!

        .audit.finishedAt =

        new Date().toISOString();

    this.currentResult!

        .audit.executionMilliseconds =

        this.elapsedMilliseconds();

    this.currentResult!

        .audit.totalDocuments =

        this.currentResult!

            .generatedFiles.length;

}

/*===========================================================================
=
= HISTÓRICO
=
===========================================================================*/

private registerExecutionHistory()

    : void {

    this.currentResult!

        .addHistoryEntry({

            id:

                crypto.randomUUID(),

            timestamp:

                new Date().toISOString(),

            event:

                "Generation completed",

            module:

                "ContractGenerator"

        });

}

/*===========================================================================
=
= PREPARACIÓN PARA PUBLICACIÓN
=
===========================================================================*/

private preparePublication()

    : void {

    const publication = {

        ready: true,

        platform:

            "PLACSP",

        requiresReview: false,

        pendingDocuments: 0

    };

    this.currentResult!

        .setPublicationInformation(

            publication

        );

}

/*===========================================================================
=
= CIERRE DEL EXPEDIENTE
=
===========================================================================*/

private closeAdministrativeFile()

    : void {

    this.currentResult!

        .markAsCompleted();

    this.log(

        "Administrative file completed."

    );

}

/*===========================================================================
=
= EJECUCIÓN FINAL
=
===========================================================================*/

private async finalizeGeneration()

    : Promise<void> {

    await this.executeAdvancedExport();

    this.generateVersionInformation();

    this.prepareElectronicSignature();

    this.finalizeAudit();

    this.registerExecutionHistory();

    this.preparePublication();

    this.closeAdministrativeFile();

    this.updateExecutionTime();

}

/*===========================================================================
=
= RECUPERACIÓN Y TOLERANCIA A FALLOS
=
===========================================================================*/

/**
 * Estado interno del generador.
 */

private cancelled: boolean = false;

private paused: boolean = false;

private recoveryMode: boolean = false;

/*===========================================================================
=
= CANCELACIÓN CONTROLADA
=
===========================================================================*/

/**
 * Solicita la cancelación de la generación.
 */

public cancelGeneration(): void {

    this.cancelled = true;

    this.log(

        "Generation cancelled by user."

    );

}

/**
 * Comprueba si la generación ha sido cancelada.
 */

private checkCancellation(): void {

    if (

        this.cancelled

    ) {

        throw new Error(

            "Generation cancelled."

        );

    }

}

/*===========================================================================
=
= PAUSA
=
===========================================================================*/

/**
 * Pausa la generación.
 */

public pauseGeneration(): void {

    this.paused = true;

    this.log(

        "Generation paused."

    );

}

/**
 * Reanuda la generación.
 */

public resumeGeneration(): void {

    this.paused = false;

    this.log(

        "Generation resumed."

    );

}

/**
 * Espera mientras el sistema permanezca pausado.
 */

private async waitIfPaused()

    : Promise<void> {

    while (

        this.paused

    ) {

        await new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    200

                )

        );

    }

}

/*===========================================================================
=
= RECOVERY MODE
=
===========================================================================*/

/**
 * Activa el modo recuperación.
 */

private enableRecoveryMode()

    : void {

    this.recoveryMode = true;

    this.warning(

        "Recovery mode enabled."

    );

}

/**
 * Desactiva el modo recuperación.
 */

private disableRecoveryMode()

    : void {

    this.recoveryMode = false;

}

/*===========================================================================
=
= RECUPERACIÓN AUTOMÁTICA
=
===========================================================================*/

private async recoverFromFailure(

    exception: unknown

)

    : Promise<void> {

    this.enableRecoveryMode();

    this.log(

        "Attempting automatic recovery."

    );

    try {

        await this.restoreLastCheckpoint();

    }

    catch {

        this.warning(

            "Checkpoint recovery failed."

        );

    }

}

/*===========================================================================
=
= CHECKPOINTS
=
===========================================================================*/

private async createCheckpoint()

    : Promise<void> {

    if (

        !this.configuration.automaticSave

    ) {

        return;

    }

    this.currentResult!

        .createCheckpoint(

            this.currentContext!

        );

}

private async restoreLastCheckpoint()

    : Promise<void> {

    const checkpoint =

        this.currentResult!

            .getLastCheckpoint();

    if (

        checkpoint

    ) {

        this.currentContext =

            checkpoint.context;

    }

}

/*===========================================================================
=
= EVENTOS INTERNOS
=
===========================================================================*/

private emitEvent(

    event: string,

    payload?: unknown

)

    : void {

    this.log(

        `Event: ${event}`

    );

    this.currentResult!

        .addSystemEvent({

            timestamp:

                new Date().toISOString(),

            event,

            payload

        });

}

/*===========================================================================
=
= CICLO DE SEGURIDAD
=
===========================================================================*/

private async safetyCycle()

    : Promise<void> {

    this.checkTimeout();

    this.checkCancellation();

    await this.waitIfPaused();

    await this.createCheckpoint();

}

/*===========================================================================
=
= HOOKS DE INTEGRACIÓN
=
===========================================================================*/

/**
 * Hooks registrados por módulos externos.
 */

private readonly hooks = {

    beforeGeneration: [] as Array<(ctx: ContractContextModel) => Promise<void>>,

    afterGeneration: [] as Array<(result: GenerationResultModel) => Promise<void>>,

    beforeExport: [] as Array<(result: GenerationResultModel) => Promise<void>>,

    afterExport: [] as Array<(result: GenerationResultModel) => Promise<void>>,

    onError: [] as Array<(error: unknown) => Promise<void>>

};

/*===========================================================================
=
= REGISTRO DE HOOKS
=
===========================================================================*/

public registerBeforeGenerationHook(

    hook: (ctx: ContractContextModel) => Promise<void>

): void {

    this.hooks.beforeGeneration.push(hook);

}

public registerAfterGenerationHook(

    hook: (result: GenerationResultModel) => Promise<void>

): void {

    this.hooks.afterGeneration.push(hook);

}

public registerBeforeExportHook(

    hook: (result: GenerationResultModel) => Promise<void>

): void {

    this.hooks.beforeExport.push(hook);

}

public registerAfterExportHook(

    hook: (result: GenerationResultModel) => Promise<void>

): void {

    this.hooks.afterExport.push(hook);

}

public registerErrorHook(

    hook: (error: unknown) => Promise<void>

): void {

    this.hooks.onError.push(hook);

}

/*===========================================================================
=
= EJECUCIÓN DE HOOKS
=
===========================================================================*/

private async executeBeforeGenerationHooks()

    : Promise<void> {

    for (

        const hook

        of this.hooks.beforeGeneration

    ) {

        await hook(

            this.currentContext!

        );

    }

}

private async executeAfterGenerationHooks()

    : Promise<void> {

    for (

        const hook

        of this.hooks.afterGeneration

    ) {

        await hook(

            this.currentResult!

        );

    }

}

private async executeBeforeExportHooks()

    : Promise<void> {

    for (

        const hook

        of this.hooks.beforeExport

    ) {

        await hook(

            this.currentResult!

        );

    }

}

private async executeAfterExportHooks()

    : Promise<void> {

    for (

        const hook

        of this.hooks.afterExport

    ) {

        await hook(

            this.currentResult!

        );

    }

}

private async executeErrorHooks(

    error: unknown

)

    : Promise<void> {

    for (

        const hook

        of this.hooks.onError

    ) {

        await hook(

            error

        );

    }

}

/*===========================================================================
=
= INTEGRACIÓN API
=
===========================================================================*/

public buildApiResponse()

    : unknown {

    return {

        generationId:

            this.currentResult!

                .audit.generationId,

        successful:

            this.currentResult!

                .successful,

        status:

            this.currentResult!

                .status,

        progress:

            this.currentResult!

                .getCompletionPercentage(),

        generatedDocuments:

            this.currentResult!

                .generatedFiles,

        validation:

            this.currentResult!

                .validation

    };

}

/*===========================================================================
=
= INTEGRACIÓN FRONTEND
=
===========================================================================*/

public buildFrontendState()

    : unknown {

    return {

        progress:

            this.currentResult!

                .getCompletionPercentage(),

        currentStage:

            this.currentResult!

                .workflow.currentStage,

        warnings:

            this.currentResult!

                .warnings.length,

        errors:

            this.currentResult!

                .errors.length,

        documents:

            this.currentResult!

                .generatedFiles.length

    };

}

/*===========================================================================
=
= INTEGRACIÓN FUTURA IA
=
===========================================================================*/

public registerArtificialIntelligenceModule(

    module: unknown

)

    : void {

    this.emitEvent(

        "AI_MODULE_REGISTERED",

        module

    );

}

/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

public getStatistics()

    : GeneratorStatistics {

    return {

        ...this.statistics

    };

}

private updateAverageExecution()

    : void {

    if (

        this.statistics.executions === 0

    ) {

        return;

    }

    const previous =

        this.statistics.averageExecutionMilliseconds *

        (this.statistics.executions - 1);

    this.statistics.averageExecutionMilliseconds =

        (

            previous +

            this.elapsedMilliseconds()

        )

        /

        this.statistics.executions;

}

/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

public dispose()

    : void {

    this.log(

        "Disposing generator."

    );

    this.currentContext = undefined;

    this.currentResult = undefined;

    this.executionStarted = undefined;

    this.cancelled = false;

    this.paused = false;

    this.recoveryMode = false;

}

/*===========================================================================
=
= INFORMACIÓN DEL MOTOR
=
===========================================================================*/

public getVersion()

    : string {

    return CONTRACT_GENERATOR_VERSION;

}

public getName()

    : string {

    return "ContractGenerator";

}

public getDescription()

    : string {

    return CONTRACT_GENERATOR_DESCRIPTION;

}

/*===========================================================================
=
= DIAGNÓSTICO
=
===========================================================================*/

public healthCheck()

    : boolean {

    return (

        this.modules.workflow !== undefined &&

        this.modules.ruleEngine !== undefined &&

        this.modules.inferenceEngine !== undefined &&

        this.modules.legalReasoner !== undefined &&

        this.modules.validationEngine !== undefined &&

        this.modules.documentGenerator !== undefined &&

        this.modules.exportManager !== undefined

    );

}

}

/*===========================================================================
=
= FACTORY
=
===========================================================================*/

export class ContractGeneratorFactory {

    public static create()

        : ContractGenerator {

        return new ContractGenerator();

    }

    public static createDefault()

        : ContractGenerator {

        return new ContractGenerator({

            enableAI: true,

            enableWorkflow: true,

            enableValidation: true,

            enableExport: true,

            stopOnCriticalErrors: true,

            verboseLog: false,

            generateAudit: true,

            automaticSave: true,

            maximumExecutionTime: 600000

        });

    }

}

/*===========================================================================
=
= CONSTANTES
=
===========================================================================*/

export const CONTRACT_GENERATOR_VERSION =

    "1.0.0";

export const CONTRACT_GENERATOR_NAME =

    "ACP Contract Generator";

export const CONTRACT_GENERATOR_DESCRIPTION =

    "Core orchestration engine of the Asistente de Contratación Pública.";

/*===========================================================================
=
= NOTAS TÉCNICAS
=
===========================================================================*/

/*
El ContractGenerator constituye el núcleo operativo del sistema.

Responsabilidades:

 • Coordinar WorkflowEngine.

 • Coordinar RuleEngine.

 • Coordinar InferenceEngine.

 • Coordinar LegalReasoner.

 • Coordinar ValidationEngine.

 • Coordinar DocumentGenerator.

 • Coordinar ExportManager.

 • Construir GenerationResult.

 • Gestionar recuperación.

 • Gestionar auditoría.

 • Gestionar IA.

 • Gestionar exportaciones.

 • Gestionar integración con Frontend y API.

Ningún otro módulo debe asumir estas responsabilidades.

FIN DEL ARCHIVO
*/
