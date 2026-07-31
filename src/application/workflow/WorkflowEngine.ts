/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * WORKFLOW ENGINE
 *
 * Este motor controla TODO el ciclo de vida del expediente.
 *
 * No interpreta normativa.
 *
 * No genera documentos.
 *
 * No decide jurídicamente.
 *
 * Coordina el proceso completo.
 *
 ******************************************************************************/

import {

    UUID

} from "../../domain/common/types";

import {

    ContractContextModel

} from "../modules/contract-generator/ContractContext";



/*===========================================================================
=
= ENUMERACIÓN DE ESTADOS
=
===========================================================================*/

export enum WorkflowStatus {

    CREATED="CREATED",

    INITIALIZED="INITIALIZED",

    RUNNING="RUNNING",

    PAUSED="PAUSED",

    WAITING="WAITING",

    VALIDATING="VALIDATING",

    FINISHED="FINISHED",

    CANCELLED="CANCELLED",

    ERROR="ERROR"

}



/*===========================================================================
=
= PASOS DEL WORKFLOW
=
===========================================================================*/

export enum WorkflowStep {

    START="START",

    IDENTIFICATION="IDENTIFICATION",

    NEED="NEED",

    OBJECT="OBJECT",

    CPV="CPV",

    LOTS="LOTS",

    ESTIMATED_VALUE="ESTIMATED_VALUE",

    PROCEDURE="PROCEDURE",

    SOLVENCY="SOLVENCY",

    GUARANTEES="GUARANTEES",

    AWARD_CRITERIA="AWARD_CRITERIA",

    EXECUTION="EXECUTION",

    SPECIAL_CONDITIONS="SPECIAL_CONDITIONS",

    VALIDATION="VALIDATION",

    LEGAL_ANALYSIS="LEGAL_ANALYSIS",

    DOCUMENT_GENERATION="DOCUMENT_GENERATION",

    EXPORT="EXPORT",

    END="END"

}



/*===========================================================================
=
= PRIORIDAD
=
===========================================================================*/

export enum WorkflowPriority {

    LOW=1,

    NORMAL=5,

    HIGH=10,

    CRITICAL=100

}



/*===========================================================================
=
= EVENTOS
=
===========================================================================*/

export enum WorkflowEventType {

    STARTED="STARTED",

    STEP_STARTED="STEP_STARTED",

    STEP_COMPLETED="STEP_COMPLETED",

    STEP_SKIPPED="STEP_SKIPPED",

    STEP_FAILED="STEP_FAILED",

    PAUSED="PAUSED",

    RESUMED="RESUMED",

    CANCELLED="CANCELLED",

    FINISHED="FINISHED"

}



/*===========================================================================
=
= EVENTO
=
===========================================================================*/

export interface WorkflowEvent{

    id:UUID;

    timestamp:string;

    type:WorkflowEventType;

    step:WorkflowStep;

    description:string;

}



/*===========================================================================
=
= CHECKPOINT
=
===========================================================================*/

export interface WorkflowCheckpoint{

    id:UUID;

    timestamp:string;

    step:WorkflowStep;

    status:WorkflowStatus;

    progress:number;

}



/*===========================================================================
=
= PASO
=
===========================================================================*/

export interface WorkflowNode{

    id:UUID;

    name:string;

    description:string;

    step:WorkflowStep;

    priority:WorkflowPriority;

    enabled:boolean;

    completed:boolean;

    started:boolean;

    failed:boolean;

    executionMilliseconds:number;

}



/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

export interface WorkflowConfiguration{

    automaticSave:boolean;

    allowRollback:boolean;

    allowSkip:boolean;

    maximumRetries:number;

    createCheckpoints:boolean;

    validateAfterEveryStep:boolean;

}



/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

export interface WorkflowStatistics{

    totalSteps:number;

    completedSteps:number;

    skippedSteps:number;

    failedSteps:number;

    executionMilliseconds:number;

}



/*===========================================================================
=
= WORKFLOW ENGINE
=
===========================================================================*/

export class WorkflowEngine{

    private context?:ContractContextModel;

    private status:WorkflowStatus=

        WorkflowStatus.CREATED;

    private currentStep:WorkflowStep=

        WorkflowStep.START;

    private readonly events:

        WorkflowEvent[]=[];

    private readonly checkpoints:

        WorkflowCheckpoint[]=[];

    private readonly nodes:

        WorkflowNode[]=[];

    private configuration:

        WorkflowConfiguration;

    private statistics:

        WorkflowStatistics;

    private startedAt?:Date;

    private finishedAt?:Date;

    private cancelled=false;

    private paused=false;

    private retries=0;



/*===========================================================================
=
= CONSTRUCTOR
=
===========================================================================*/

    constructor(

        configuration?:

        Partial<WorkflowConfiguration>

    ){

        this.configuration={

            automaticSave:true,

            allowRollback:true,

            allowSkip:false,

            maximumRetries:3,

            createCheckpoints:true,

            validateAfterEveryStep:true,

            ...configuration

        };



        this.statistics={

            totalSteps:0,

            completedSteps:0,

            skippedSteps:0,

            failedSteps:0,

            executionMilliseconds:0

        };



        this.buildWorkflow();

    }



/*===========================================================================
=
= CONSTRUCCIÓN DEL WORKFLOW
=
===========================================================================*/

    private buildWorkflow():void{

        this.addNode(

            WorkflowStep.START,

            "Inicio",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.IDENTIFICATION,

            "Identificación",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.NEED,

            "Necesidad",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.OBJECT,

            "Objeto",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.CPV,

            "CPV",

            WorkflowPriority.HIGH

        );



        this.addNode(

            WorkflowStep.LOTS,

            "Lotes",

            WorkflowPriority.NORMAL

        );



        this.addNode(

            WorkflowStep.ESTIMATED_VALUE,

            "Valor estimado",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.PROCEDURE,

            "Procedimiento",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.SOLVENCY,

            "Solvencia",

            WorkflowPriority.HIGH

        );



        this.addNode(

            WorkflowStep.GUARANTEES,

            "Garantías",

            WorkflowPriority.NORMAL

        );



        this.addNode(

            WorkflowStep.AWARD_CRITERIA,

            "Criterios",

            WorkflowPriority.HIGH

        );



        this.addNode(

            WorkflowStep.EXECUTION,

            "Ejecución",

            WorkflowPriority.NORMAL

        );



        this.addNode(

            WorkflowStep.SPECIAL_CONDITIONS,

            "Condiciones especiales",

            WorkflowPriority.NORMAL

        );



        this.addNode(

            WorkflowStep.VALIDATION,

            "Validación",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.LEGAL_ANALYSIS,

            "Análisis jurídico",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.DOCUMENT_GENERATION,

            "Generación documental",

            WorkflowPriority.CRITICAL

        );



        this.addNode(

            WorkflowStep.EXPORT,

            "Exportación",

            WorkflowPriority.NORMAL

        );



        this.addNode(

            WorkflowStep.END,

            "Fin",

            WorkflowPriority.CRITICAL

        );



        this.statistics.totalSteps=

            this.nodes.length;

    }



/*===========================================================================
=
= CREACIÓN DE NODOS
=
===========================================================================*/

    private addNode(

        step:WorkflowStep,

        description:string,

        priority:WorkflowPriority

    ):void{

        this.nodes.push({

            id:crypto.randomUUID() as UUID,

            name:step,

            description,

            step,

            priority,

            enabled:true,

            completed:false,

            started:false,

            failed:false,

            executionMilliseconds:0

        });

    }

/*===========================================================================
=
= INICIALIZACIÓN
=
===========================================================================*/

    /**
     * Inicializa el workflow para un nuevo expediente.
     */

    public initialize(

        context: ContractContextModel

    ): void {

        this.context = context;

        this.status =

            WorkflowStatus.INITIALIZED;

        this.currentStep =

            WorkflowStep.START;

        this.startedAt =

            new Date();

        this.finishedAt =

            undefined;

        this.cancelled = false;

        this.paused = false;

        this.retries = 0;

        this.events.length = 0;

        this.checkpoints.length = 0;

        this.statistics.completedSteps = 0;

        this.statistics.failedSteps = 0;

        this.statistics.skippedSteps = 0;

        this.statistics.executionMilliseconds = 0;

        for (

            const node

            of this.nodes

        ) {

            node.completed = false;

            node.started = false;

            node.failed = false;

            node.executionMilliseconds = 0;

        }

        this.emitEvent(

            WorkflowEventType.STARTED,

            WorkflowStep.START,

            "Workflow initialized."

        );

    }

/*===========================================================================
=
= EJECUCIÓN
=
===========================================================================*/

    /**
     * Ejecuta el workflow completo.
     */

    public async execute(

        context: ContractContextModel

    ): Promise<void> {

        this.initialize(

            context

        );

        this.status =

            WorkflowStatus.RUNNING;

        while (

            this.currentStep !==

            WorkflowStep.END

        ) {

            this.checkCancellation();

            await this.waitIfPaused();

            await this.executeCurrentStep();

            await this.nextStep();

        }

        await this.executeCurrentStep();

        this.finishWorkflow();

    }

/*===========================================================================
=
= EJECUCIÓN DE PASO
=
===========================================================================*/

    private async executeCurrentStep()

        : Promise<void> {

        const node =

            this.findNode(

                this.currentStep

            );

        if (

            !node ||

            !node.enabled

        ) {

            return;

        }

        node.started = true;

        const start = Date.now();

        this.emitEvent(

            WorkflowEventType.STEP_STARTED,

            node.step,

            node.description

        );

        try {

            await this.executeBusinessLogic(

                node.step

            );

            node.completed = true;

            node.executionMilliseconds =

                Date.now() - start;

            this.statistics.completedSteps++;

            this.emitEvent(

                WorkflowEventType.STEP_COMPLETED,

                node.step,

                "Completed."

            );

            if (

                this.configuration.createCheckpoints

            ) {

                this.createCheckpoint();

            }

        }

        catch (

            error

        ) {

            node.failed = true;

            this.statistics.failedSteps++;

            this.emitEvent(

                WorkflowEventType.STEP_FAILED,

                node.step,

                error instanceof Error

                    ? error.message

                    : "Unknown error"

            );

            await this.retryStep();

        }

    }

/*===========================================================================
=
= AVANZAR
=
===========================================================================*/

    private async nextStep()

        : Promise<void> {

        const order = [

            WorkflowStep.START,

            WorkflowStep.IDENTIFICATION,

            WorkflowStep.NEED,

            WorkflowStep.OBJECT,

            WorkflowStep.CPV,

            WorkflowStep.LOTS,

            WorkflowStep.ESTIMATED_VALUE,

            WorkflowStep.PROCEDURE,

            WorkflowStep.SOLVENCY,

            WorkflowStep.GUARANTEES,

            WorkflowStep.AWARD_CRITERIA,

            WorkflowStep.EXECUTION,

            WorkflowStep.SPECIAL_CONDITIONS,

            WorkflowStep.VALIDATION,

            WorkflowStep.LEGAL_ANALYSIS,

            WorkflowStep.DOCUMENT_GENERATION,

            WorkflowStep.EXPORT,

            WorkflowStep.END

        ];

        const current =

            order.indexOf(

                this.currentStep

            );

        if (

            current <

            order.length - 1

        ) {

            this.currentStep =

                order[current + 1];

        }

    }

/*===========================================================================
=
= RETROCEDER
=
===========================================================================*/

    public previousStep()

        : void {

        const order = [

            WorkflowStep.START,

            WorkflowStep.IDENTIFICATION,

            WorkflowStep.NEED,

            WorkflowStep.OBJECT,

            WorkflowStep.CPV,

            WorkflowStep.LOTS,

            WorkflowStep.ESTIMATED_VALUE,

            WorkflowStep.PROCEDURE,

            WorkflowStep.SOLVENCY,

            WorkflowStep.GUARANTEES,

            WorkflowStep.AWARD_CRITERIA,

            WorkflowStep.EXECUTION,

            WorkflowStep.SPECIAL_CONDITIONS,

            WorkflowStep.VALIDATION,

            WorkflowStep.LEGAL_ANALYSIS,

            WorkflowStep.DOCUMENT_GENERATION,

            WorkflowStep.EXPORT,

            WorkflowStep.END

        ];

        const current =

            order.indexOf(

                this.currentStep

            );

        if (

            current > 0

        ) {

            this.currentStep =

                order[current - 1];

        }

    }

/*===========================================================================
=
= SALTAR PASO
=
===========================================================================*/

    public skipCurrentStep()

        : void {

        if (

            !this.configuration.allowSkip

        ) {

            return;

        }

        this.statistics.skippedSteps++;

        this.emitEvent(

            WorkflowEventType.STEP_SKIPPED,

            this.currentStep,

            "Skipped."

        );

    }

/*===========================================================================
=
= REINTENTO
=
===========================================================================*/

    private async retryStep()

        : Promise<void> {

        if (

            this.retries >=

            this.configuration.maximumRetries

        ) {

            throw new Error(

                "Maximum retries exceeded."

            );

        }

        this.retries++;

        await this.executeCurrentStep();

    }

/*===========================================================================
=
= ROLLBACK
=
===========================================================================*/

/**
 * Revierte el Workflow al último checkpoint válido.
 */

public async rollback()

    : Promise<void> {

    if (

        !this.configuration.allowRollback

    ) {

        throw new Error(

            "Rollback disabled."

        );

    }

    if (

        this.checkpoints.length === 0

    ) {

        throw new Error(

            "No checkpoint available."

        );

    }

    const checkpoint =

        this.checkpoints[

            this.checkpoints.length - 1

        ];

    await this.restoreCheckpoint(

        checkpoint

    );

    this.emitEvent(

        WorkflowEventType.RESUMED,

        checkpoint.step,

        "Rollback executed."

    );

}

/*===========================================================================
=
= CHECKPOINTS
=
===========================================================================*/

private createCheckpoint()

    : void {

    const checkpoint: WorkflowCheckpoint = {

        id:

            crypto.randomUUID() as UUID,

        timestamp:

            new Date().toISOString(),

        step:

            this.currentStep,

        status:

            this.status,

        progress:

            this.getCompletionPercentage()

    };

    this.checkpoints.push(

        checkpoint

    );

}

private async restoreCheckpoint(

    checkpoint: WorkflowCheckpoint

)

    : Promise<void> {

    this.currentStep =

        checkpoint.step;

    this.status =

        checkpoint.status;

}

/*===========================================================================
=
= RECUPERACIÓN AUTOMÁTICA
=
===========================================================================*/

private async recoverWorkflow()

    : Promise<void> {

    if (

        this.checkpoints.length === 0

    ) {

        return;

    }

    const checkpoint =

        this.checkpoints[

            this.checkpoints.length - 1

        ];

    await this.restoreCheckpoint(

        checkpoint

    );

}

/*===========================================================================
=
= DEPENDENCIAS
=
===========================================================================*/

private validateDependencies(

    step: WorkflowStep

)

    : boolean {

    switch (

        step

    ) {

        case WorkflowStep.CPV:

            return this.nodeCompleted(

                WorkflowStep.OBJECT

            );

        case WorkflowStep.PROCEDURE:

            return (

                this.nodeCompleted(

                    WorkflowStep.ESTIMATED_VALUE

                )

                &&

                this.nodeCompleted(

                    WorkflowStep.CPV

                )

            );

        case WorkflowStep.SOLVENCY:

            return this.nodeCompleted(

                WorkflowStep.PROCEDURE

            );

        case WorkflowStep.GUARANTEES:

            return this.nodeCompleted(

                WorkflowStep.SOLVENCY

            );

        case WorkflowStep.AWARD_CRITERIA:

            return this.nodeCompleted(

                WorkflowStep.GUARANTEES

            );

        case WorkflowStep.DOCUMENT_GENERATION:

            return this.nodeCompleted(

                WorkflowStep.LEGAL_ANALYSIS

            );

        case WorkflowStep.EXPORT:

            return this.nodeCompleted(

                WorkflowStep.DOCUMENT_GENERATION

            );

        default:

            return true;

    }

}

/*===========================================================================
=
= VALIDACIÓN DEL PASO
=
===========================================================================*/

private canExecuteStep(

    step: WorkflowStep

)

    : boolean {

    const node =

        this.findNode(

            step

        );

    if (

        !node

    ) {

        return false;

    }

    if (

        !node.enabled

    ) {

        return false;

    }

    if (

        node.completed

    ) {

        return false;

    }

    return this.validateDependencies(

        step

    );

}

/*===========================================================================
=
= LOCALIZACIÓN DE NODOS
=
===========================================================================*/

private findNode(

    step: WorkflowStep

)

    : WorkflowNode | undefined {

    return this.nodes.find(

        node =>

            node.step === step

    );

}

private nodeCompleted(

    step: WorkflowStep

)

    : boolean {

    const node =

        this.findNode(

            step

        );

    return node

        ? node.completed

        : false;

}

/*===========================================================================
=
= FLUJO DINÁMICO
=
===========================================================================*/

/**
 * Permite que el Workflow altere su recorrido en función
 * del expediente.
 */

private determineNextDynamicStep()

    : WorkflowStep {

    if (

        this.currentContext?.requiresLots()

        &&

        this.currentStep ===

        WorkflowStep.CPV

    ) {

        return WorkflowStep.LOTS;

    }

    if (

        !this.currentContext?.requiresLots()

        &&

        this.currentStep ===

        WorkflowStep.CPV

    ) {

        return WorkflowStep.ESTIMATED_VALUE;

    }

    return this.currentStep;

}

/*===========================================================================
=
= GESTIÓN AVANZADA DE ESTADOS
=
===========================================================================*/

/**
 * Cambia el estado interno del Workflow.
 */

private changeStatus(

    status: WorkflowStatus

): void {

    if (

        this.status === status

    ) {

        return;

    }

    this.status = status;

    this.emitEvent(

        WorkflowEventType.STEP_STARTED,

        this.currentStep,

        `Workflow status -> ${status}`

    );

}

/*===========================================================================
=
= PAUSA
=
===========================================================================*/

public pause(): void {

    if (

        this.status !== WorkflowStatus.RUNNING

    ) {

        return;

    }

    this.paused = true;

    this.changeStatus(

        WorkflowStatus.PAUSED

    );

    this.emitEvent(

        WorkflowEventType.PAUSED,

        this.currentStep,

        "Workflow paused."

    );

}

/*===========================================================================
=
= REANUDACIÓN
=
===========================================================================*/

public resume(): void {

    if (

        this.status !== WorkflowStatus.PAUSED

    ) {

        return;

    }

    this.paused = false;

    this.changeStatus(

        WorkflowStatus.RUNNING

    );

    this.emitEvent(

        WorkflowEventType.RESUMED,

        this.currentStep,

        "Workflow resumed."

    );

}

/*===========================================================================
=
= CANCELACIÓN
=
===========================================================================*/

public cancel(): void {

    this.cancelled = true;

    this.changeStatus(

        WorkflowStatus.CANCELLED

    );

    this.emitEvent(

        WorkflowEventType.CANCELLED,

        this.currentStep,

        "Workflow cancelled."

    );

}

/*===========================================================================
=
= COMPROBACIONES
=
===========================================================================*/

private checkCancellation(): void {

    if (

        this.cancelled

    ) {

        throw new Error(

            "Workflow cancelled."

        );

    }

}

private async waitIfPaused()

    : Promise<void> {

    while (

        this.paused

    ) {

        await new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    250

                )

        );

    }

}

/*===========================================================================
=
= REGLAS DE TRANSICIÓN
=
===========================================================================*/

private validateTransition(

    from: WorkflowStep,

    to: WorkflowStep

): boolean {

    if (

        from === to

    ) {

        return false;

    }

    if (

        !this.validateDependencies(

            to

        )

    ) {

        return false;

    }

    return true;

}

/*===========================================================================
=
= TRANSICIÓN
=
===========================================================================*/

private transitionTo(

    next: WorkflowStep

): void {

    if (

        !this.validateTransition(

            this.currentStep,

            next

        )

    ) {

        throw new Error(

            `Invalid transition ${this.currentStep} -> ${next}`

        );

    }

    this.currentStep = next;

}

/*===========================================================================
=
= SINCRONIZACIÓN
=
===========================================================================*/

private synchronizeContext()

    : void {

    if (

        !this.context

    ) {

        return;

    }

    this.context.workflow.currentStep =

        this.currentStep;

    this.context.workflow.status =

        this.status;

    this.context.workflow.progress =

        this.getCompletionPercentage();

}

/*===========================================================================
=
= ACTUALIZACIÓN DE ESTADÍSTICAS
=
===========================================================================*/

private updateStatistics()

    : void {

    if (

        !this.startedAt

    ) {

        return;

    }

    this.statistics.executionMilliseconds =

        Date.now()

        -

        this.startedAt.getTime();

}

/*===========================================================================
=
= SINCRONIZACIÓN GLOBAL
=
===========================================================================*/

private synchronize()

    : void {

    this.synchronizeContext();

    this.updateStatistics();

}

/*===========================================================================
=
= EJECUCIÓN DE LÓGICA DE NEGOCIO
=
===========================================================================*/

/**
 * Punto único donde cada paso delega
 * en el motor correspondiente.
 */

private async executeBusinessLogic(

    step: WorkflowStep

): Promise<void> {

    this.synchronize();

    switch (

        step

    ) {

        case WorkflowStep.START:

            return;

        case WorkflowStep.IDENTIFICATION:

            return;

        case WorkflowStep.NEED:

            return;

        case WorkflowStep.OBJECT:

            return;

        case WorkflowStep.CPV:

            return;

        case WorkflowStep.LOTS:

            return;

        case WorkflowStep.ESTIMATED_VALUE:

            return;

        case WorkflowStep.PROCEDURE:

            return;

        case WorkflowStep.SOLVENCY:

            return;

        case WorkflowStep.GUARANTEES:

            return;

        case WorkflowStep.AWARD_CRITERIA:

            return;

        case WorkflowStep.EXECUTION:

            return;

        case WorkflowStep.SPECIAL_CONDITIONS:

            return;

        case WorkflowStep.VALIDATION:

            return;

        case WorkflowStep.LEGAL_ANALYSIS:

            return;

        case WorkflowStep.DOCUMENT_GENERATION:

            return;

        case WorkflowStep.EXPORT:

            return;

        case WorkflowStep.END:

            return;

    }

}

/*===========================================================================
=
= MOTOR DE DECISIONES DEL WORKFLOW
=
===========================================================================*/

/**
 * Decide el siguiente paso del expediente.
 *
 * El Workflow deja de ser lineal.
 */

private async decideNextStep()

    : Promise<WorkflowStep> {

    const current =

        this.currentStep;

    switch (

        current

    ) {

        case WorkflowStep.START:

            return WorkflowStep.IDENTIFICATION;

        case WorkflowStep.IDENTIFICATION:

            return WorkflowStep.NEED;

        case WorkflowStep.NEED:

            return WorkflowStep.OBJECT;

        case WorkflowStep.OBJECT:

            return WorkflowStep.CPV;

        case WorkflowStep.CPV:

            return await this.decideAfterCPV();

        case WorkflowStep.LOTS:

            return WorkflowStep.ESTIMATED_VALUE;

        case WorkflowStep.ESTIMATED_VALUE:

            return WorkflowStep.PROCEDURE;

        case WorkflowStep.PROCEDURE:

            return await this.decideAfterProcedure();

        case WorkflowStep.SOLVENCY:

            return WorkflowStep.GUARANTEES;

        case WorkflowStep.GUARANTEES:

            return WorkflowStep.AWARD_CRITERIA;

        case WorkflowStep.AWARD_CRITERIA:

            return WorkflowStep.EXECUTION;

        case WorkflowStep.EXECUTION:

            return WorkflowStep.SPECIAL_CONDITIONS;

        case WorkflowStep.SPECIAL_CONDITIONS:

            return WorkflowStep.VALIDATION;

        case WorkflowStep.VALIDATION:

            return WorkflowStep.LEGAL_ANALYSIS;

        case WorkflowStep.LEGAL_ANALYSIS:

            return WorkflowStep.DOCUMENT_GENERATION;

        case WorkflowStep.DOCUMENT_GENERATION:

            return WorkflowStep.EXPORT;

        default:

            return WorkflowStep.END;

    }

}

/*===========================================================================
=
= DECISIONES DESPUÉS DEL CPV
=
===========================================================================*/

private async decideAfterCPV()

    : Promise<WorkflowStep> {

    if (

        this.context!

            .requiresLots()

    ) {

        return WorkflowStep.LOTS;

    }

    return WorkflowStep.ESTIMATED_VALUE;

}

/*===========================================================================
=
= DECISIONES DESPUÉS DEL PROCEDIMIENTO
=
===========================================================================*/

private async decideAfterProcedure()

    : Promise<WorkflowStep> {

    if (

        this.context!

            .requiresSolvency()

    ) {

        return WorkflowStep.SOLVENCY;

    }

    return WorkflowStep.AWARD_CRITERIA;

}

/*===========================================================================
=
= CONDICIONES
=
===========================================================================*/

private evaluateCondition(

    condition:string

)

    : boolean {

    switch(

        condition

    ){

        case "LOTS":

            return this.context!

                .requiresLots();

        case "SOLVENCY":

            return this.context!

                .requiresSolvency();

        case "GUARANTEE":

            return this.context!

                .requiresGuarantee();

        case "SOCIAL":

            return this.context!

                .requiresSocialClauses();

        case "ENVIRONMENT":

            return this.context!

                .requiresEnvironmentalClauses();

        default:

            return false;

    }

}

/*===========================================================================
=
= RAMIFICACIONES
=
===========================================================================*/

private async executeBranch(

    branch:string

)

    : Promise<void>{

    this.log(

        `Executing branch ${branch}`

    );

    switch(

        branch

    ){

        case "SIMPLIFIED":

            await this.executeSimplifiedProcedure();

            break;

        case "OPEN":

            await this.executeOpenProcedure();

            break;

        case "NEGOTIATED":

            await this.executeNegotiatedProcedure();

            break;

        default:

            break;

    }

}

/*===========================================================================
=
= PROCEDIMIENTO ABIERTO
=
===========================================================================*/

private async executeOpenProcedure()

    : Promise<void>{

    this.log(

        "Open procedure."

    );

}

/*===========================================================================
=
= PROCEDIMIENTO SIMPLIFICADO
=
===========================================================================*/

private async executeSimplifiedProcedure()

    : Promise<void>{

    this.log(

        "Simplified procedure."

    );

}

/*===========================================================================
=
= PROCEDIMIENTO NEGOCIADO
=
===========================================================================*/

private async executeNegotiatedProcedure()

    : Promise<void>{

    this.log(

        "Negotiated procedure."

    );

}

/*===========================================================================
=
= FLUJOS PARALELOS
=
===========================================================================*/

private async executeParallelTasks()

    : Promise<void>{

    await Promise.all([

        this.parallelValidation(),

        this.parallelAudit(),

        this.parallelMonitoring()

    ]);

}

private async parallelValidation()

    : Promise<void>{

    this.log(

        "Parallel validation."

    );

}

private async parallelAudit()

    : Promise<void>{

    this.log(

        "Parallel audit."

    );

}

private async parallelMonitoring()

    : Promise<void>{

    this.log(

        "Parallel monitoring."

    );

}

/*===========================================================================
=
= MOTOR DE REGLAS DEL WORKFLOW
=
===========================================================================*/

private applyWorkflowRules()

    : void{

    this.synchronize();

    this.updateStatistics();

    this.checkCancellation();

}

/*===========================================================================
=
= PLANIFICADOR INTERNO (SCHEDULER)
=
===========================================================================*/

private readonly executionQueue: WorkflowStep[] = [];

private readonly waitingQueue: WorkflowStep[] = [];

private readonly completedQueue: WorkflowStep[] = [];

private readonly failedQueue: WorkflowStep[] = [];

/*===========================================================================
=
= CONSTRUCCIÓN DE LA COLA
=
===========================================================================*/

private buildExecutionQueue(): void {

    this.executionQueue.length = 0;

    for (const node of this.nodes) {

        if (node.enabled) {

            this.executionQueue.push(node.step);

        }

    }

}

/*===========================================================================
=
= OBTENER SIGUIENTE PASO PENDIENTE
=
===========================================================================*/

private getNextPendingStep()

    : WorkflowStep | undefined {

    while (this.executionQueue.length > 0) {

        const candidate = this.executionQueue.shift()!;

        if (this.canExecuteStep(candidate)) {

            return candidate;

        }

        this.waitingQueue.push(candidate);

    }

    return undefined;

}

/*===========================================================================
=
= REEVALUACIÓN DE PASOS EN ESPERA
=
===========================================================================*/

private reevaluateWaitingQueue(): void {

    const pending = [...this.waitingQueue];

    this.waitingQueue.length = 0;

    for (const step of pending) {

        if (this.canExecuteStep(step)) {

            this.executionQueue.push(step);

        } else {

            this.waitingQueue.push(step);

        }

    }

}

/*===========================================================================
=
= FINALIZACIÓN DE PASOS
=
===========================================================================*/

private completeStep(

    step: WorkflowStep

): void {

    this.completedQueue.push(step);

}

/*===========================================================================
=
= REGISTRO DE ERRORES
=
===========================================================================*/

private failStep(

    step: WorkflowStep

): void {

    this.failedQueue.push(step);

}

/*===========================================================================
=
= PRIORIZACIÓN
=
===========================================================================*/

private sortExecutionQueue(): void {

    this.executionQueue.sort((a, b) => {

        const nodeA = this.findNode(a)!;

        const nodeB = this.findNode(b)!;

        return nodeB.priority - nodeA.priority;

    });

}

/*===========================================================================
=
= MOTOR PRINCIPAL DEL SCHEDULER
=
===========================================================================*/

private async schedulerCycle()

    : Promise<void> {

    this.reevaluateWaitingQueue();

    this.sortExecutionQueue();

    const next = this.getNextPendingStep();

    if (!next) {

        return;

    }

    this.currentStep = next;

    await this.executeCurrentStep();

    this.completeStep(next);

}

/*===========================================================================
=
= COMPROBACIÓN DE BLOQUEOS
=
===========================================================================*/

private detectDeadlock()

    : boolean {

    return (

        this.executionQueue.length === 0 &&

        this.waitingQueue.length > 0

    );

}

private async resolveDeadlock()

    : Promise<void> {

    if (!this.detectDeadlock()) {

        return;

    }

    this.log(

        "Deadlock detected. Re-evaluating workflow."

    );

    this.reevaluateWaitingQueue();

}

/*===========================================================================
=
= OPTIMIZACIÓN DEL FLUJO
=
===========================================================================*/

private optimizeExecutionOrder(): void {

    this.executionQueue.sort((left, right) => {

        const l = this.findNode(left)!;

        const r = this.findNode(right)!;

        if (l.priority !== r.priority) {

            return r.priority - l.priority;

        }

        return l.executionMilliseconds - r.executionMilliseconds;

    });

}

/*===========================================================================
=
= MÉTRICAS DEL PLANIFICADOR
=
===========================================================================*/

private schedulerStatistics() {

    return {

        queued: this.executionQueue.length,

        waiting: this.waitingQueue.length,

        completed: this.completedQueue.length,

        failed: this.failedQueue.length

    };

}

/*===========================================================================
=
= INTEGRACIÓN CON LOS MOTORES DEL SISTEMA
=
===========================================================================*/

/**
 * El WorkflowEngine no implementa la lógica jurídica ni documental.
 * Coordina el resto de motores especializados.
 */

private engines={

    ruleEngine:undefined as any,

    inferenceEngine:undefined as any,

    validationEngine:undefined as any,

    legalReasoner:undefined as any,

    documentGenerator:undefined as any,

    exportManager:undefined as any

};

/*===========================================================================
=
= REGISTRO DE MOTORES
=
===========================================================================*/

public registerRuleEngine(

    engine:any

):void{

    this.engines.ruleEngine=engine;

}

public registerInferenceEngine(

    engine:any

):void{

    this.engines.inferenceEngine=engine;

}

public registerValidationEngine(

    engine:any

):void{

    this.engines.validationEngine=engine;

}

public registerLegalReasoner(

    engine:any

):void{

    this.engines.legalReasoner=engine;

}

public registerDocumentGenerator(

    engine:any

):void{

    this.engines.documentGenerator=engine;

}

public registerExportManager(

    engine:any

):void{

    this.engines.exportManager=engine;

}

/*===========================================================================
=
= COMPROBACIÓN DE DEPENDENCIAS
=
===========================================================================*/

private verifyRegisteredModules()

    :void{

    if(

        !this.engines.ruleEngine

    ){

        throw new Error(

            "RuleEngine not registered."

        );

    }

    if(

        !this.engines.validationEngine

    ){

        throw new Error(

            "ValidationEngine not registered."

        );

    }

    if(

        !this.engines.documentGenerator

    ){

        throw new Error(

            "DocumentGenerator not registered."

        );

    }

}

/*===========================================================================
=
= EJECUCIÓN DEL RULE ENGINE
=
===========================================================================*/

private async executeRuleEngine()

    :Promise<void>{

    await this.engines.ruleEngine.execute(

        this.context

    );

}

/*===========================================================================
=
= EJECUCIÓN DEL INFERENCE ENGINE
=
===========================================================================*/

private async executeInferenceEngine()

    :Promise<void>{

    if(

        !this.engines.inferenceEngine

    ){

        return;

    }

    await this.engines.inferenceEngine.execute(

        this.context

    );

}

/*===========================================================================
=
= EJECUCIÓN DEL LEGAL REASONER
=
===========================================================================*/

private async executeLegalReasoner()

    :Promise<void>{

    await this.engines.legalReasoner.execute(

        this.context

    );

}

/*===========================================================================
=
= VALIDACIÓN
=
===========================================================================*/

private async executeValidation()

    :Promise<void>{

    await this.engines.validationEngine.execute(

        this.context

    );

}

/*===========================================================================
=
= GENERACIÓN DOCUMENTAL
=
===========================================================================*/

private async executeDocumentGeneration()

    :Promise<void>{

    await this.engines.documentGenerator.execute(

        this.context

    );

}

/*===========================================================================
=
= EXPORTACIÓN
=
===========================================================================*/

private async executeExport()

    :Promise<void>{

    await this.engines.exportManager.execute(

        this.context

    );

}

/*===========================================================================
=
= DISPATCHER DEL WORKFLOW
=
===========================================================================*/

private async executeBusinessLogic(

    step:WorkflowStep

):Promise<void>{

    switch(step){

        case WorkflowStep.START:

            this.verifyRegisteredModules();

            return;

        case WorkflowStep.IDENTIFICATION:

            return;

        case WorkflowStep.NEED:

            return;

        case WorkflowStep.OBJECT:

            await this.executeRuleEngine();

            return;

        case WorkflowStep.CPV:

            await this.executeInferenceEngine();

            return;

        case WorkflowStep.LOTS:

            return;

        case WorkflowStep.ESTIMATED_VALUE:

            await this.executeRuleEngine();

            return;

        case WorkflowStep.PROCEDURE:

            await this.executeRuleEngine();

            return;

        case WorkflowStep.SOLVENCY:

            await this.executeRuleEngine();

            return;

        case WorkflowStep.GUARANTEES:

            await this.executeRuleEngine();

            return;

        case WorkflowStep.AWARD_CRITERIA:

            await this.executeRuleEngine();

            return;

        case WorkflowStep.EXECUTION:

            return;

        case WorkflowStep.SPECIAL_CONDITIONS:

            await this.executeRuleEngine();

            return;

        case WorkflowStep.VALIDATION:

            await this.executeValidation();

            return;

        case WorkflowStep.LEGAL_ANALYSIS:

            await this.executeLegalReasoner();

            return;

        case WorkflowStep.DOCUMENT_GENERATION:

            await this.executeDocumentGeneration();

            return;

        case WorkflowStep.EXPORT:

            await this.executeExport();

            return;

        case WorkflowStep.END:

            return;

    }

}

/*===========================================================================
=
= SINCRONIZACIÓN CON CONTRACT GENERATOR
=
===========================================================================*/

public connectGenerator(

    generator:any

):void{

    generator.registerWorkflow(

        this

    );

}

/*===========================================================================
=
= INFORMACIÓN DEL WORKFLOW
=
===========================================================================*/

public getCurrentStep()

    :WorkflowStep{

    return this.currentStep;

}

public getStatus()

    :WorkflowStatus{

    return this.status;

}

public getProgress()

    :number{

    return this.getCompletionPercentage();

}

/*===========================================================================
=
= OBSERVERS DEL WORKFLOW
=
===========================================================================*/

export interface WorkflowObserver{

    onWorkflowStarted?(
        workflow:WorkflowEngine
    ):Promise<void>;

    onStepStarted?(
        step:WorkflowStep
    ):Promise<void>;

    onStepCompleted?(
        step:WorkflowStep
    ):Promise<void>;

    onWorkflowFinished?(
        workflow:WorkflowEngine
    ):Promise<void>;

    onWorkflowCancelled?(
        workflow:WorkflowEngine
    ):Promise<void>;

    onWorkflowError?(
        error:unknown
    ):Promise<void>;

}

/*===========================================================================
=
= OBSERVADORES REGISTRADOS
=
===========================================================================*/

private readonly observers:

    WorkflowObserver[]=[];


/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

public registerObserver(

    observer:WorkflowObserver

):void{

    this.observers.push(

        observer

    );

}

public unregisterObserver(

    observer:WorkflowObserver

):void{

    const index=

        this.observers.indexOf(

            observer

        );

    if(

        index>=0

    ){

        this.observers.splice(

            index,

            1

        );

    }

}

/*===========================================================================
=
= NOTIFICACIONES
=
===========================================================================*/

private async notifyWorkflowStarted()

    :Promise<void>{

    for(

        const observer

        of this.observers

    ){

        await observer

            .onWorkflowStarted?.(

                this

            );

    }

}

private async notifyStepStarted(

    step:WorkflowStep

)

    :Promise<void>{

    for(

        const observer

        of this.observers

    ){

        await observer

            .onStepStarted?.(

                step

            );

    }

}

private async notifyStepCompleted(

    step:WorkflowStep

)

    :Promise<void>{

    for(

        const observer

        of this.observers

    ){

        await observer

            .onStepCompleted?.(

                step

            );

    }

}

private async notifyWorkflowFinished()

    :Promise<void>{

    for(

        const observer

        of this.observers

    ){

        await observer

            .onWorkflowFinished?.(

                this

            );

    }

}

private async notifyWorkflowCancelled()

    :Promise<void>{

    for(

        const observer

        of this.observers

    ){

        await observer

            .onWorkflowCancelled?.(

                this

            );

    }

}

private async notifyWorkflowError(

    error:unknown

)

    :Promise<void>{

    for(

        const observer

        of this.observers

    ){

        await observer

            .onWorkflowError?.(

                error

            );

    }

}

/*===========================================================================
=
= TEMPORIZADORES
=
===========================================================================*/

private readonly timers=

    new Map<string,number>();


private startTimer(

    name:string

):void{

    this.timers.set(

        name,

        Date.now()

    );

}

private stopTimer(

    name:string

):number{

    const started=

        this.timers.get(

            name

        );

    if(

        started===undefined

    ){

        return 0;

    }

    const elapsed=

        Date.now()-started;

    this.timers.delete(

        name

    );

    return elapsed;

}

/*===========================================================================
=
= MÉTRICAS
=
===========================================================================*/

private metrics={

    longestStep:0,

    shortestStep:Number.MAX_SAFE_INTEGER,

    averageStep:0,

    executedSteps:0

};

private updateMetrics(

    milliseconds:number

):void{

    this.metrics.executedSteps++;

    if(

        milliseconds>

        this.metrics.longestStep

    ){

        this.metrics.longestStep=

            milliseconds;

    }

    if(

        milliseconds<

        this.metrics.shortestStep

    ){

        this.metrics.shortestStep=

            milliseconds;

    }

    this.metrics.averageStep=

        (

            (

                this.metrics.averageStep*

                (

                    this.metrics.executedSteps-1

                )

            )

            +

            milliseconds

        )

        /

        this.metrics.executedSteps;

}

/*===========================================================================
=
= ESTADO PARA FRONTEND
=
===========================================================================*/

public buildRealtimeStatus(){

    return{

        workflow:this.status,

        step:this.currentStep,

        progress:this.getCompletionPercentage(),

        completed:

            this.statistics.completedSteps,

        failed:

            this.statistics.failedSteps,

        waiting:

            this.waitingQueue.length,

        queued:

            this.executionQueue.length,

        executionTime:

            this.statistics.executionMilliseconds

    };

}

/*===========================================================================
=
= REFRESCO
=
===========================================================================*/

private refreshRealtimeInformation()

    :void{

    this.updateStatistics();

    this.synchronizeContext();

}

/*===========================================================================
=
= LATIDO DEL WORKFLOW
=
===========================================================================*/

private async heartbeat()

    :Promise<void>{

    this.refreshRealtimeInformation();

    this.emitEvent(

        WorkflowEventType.STEP_STARTED,

        this.currentStep,

        "Heartbeat"

    );

}

/*===========================================================================
=
= PIPELINE DE EJECUCIÓN
=
===========================================================================*/

export interface WorkflowPipelineTask{

    id:UUID;

    name:string;

    step:WorkflowStep;

    priority:WorkflowPriority;

    dependencies:WorkflowStep[];

    completed:boolean;

    executing:boolean;

    failed:boolean;

    retries:number;

}

/*===========================================================================
=
= PIPELINE
=
===========================================================================*/

private readonly pipeline:

    WorkflowPipelineTask[]=[];

/*===========================================================================
=
= CONSTRUCCIÓN DEL PIPELINE
=
===========================================================================*/

private buildPipeline()

    :void{

    this.pipeline.length=0;

    for(

        const node

        of this.nodes

    ){

        this.pipeline.push({

            id:crypto.randomUUID() as UUID,

            name:node.name,

            step:node.step,

            priority:node.priority,

            dependencies:

                this.getDependencies(

                    node.step

                ),

            completed:false,

            executing:false,

            failed:false,

            retries:0

        });

    }

}

/*===========================================================================
=
= DEPENDENCIAS
=
===========================================================================*/

private getDependencies(

    step:WorkflowStep

)

    :WorkflowStep[]{

    switch(step){

        case WorkflowStep.CPV:

            return[

                WorkflowStep.OBJECT

            ];

        case WorkflowStep.LOTS:

            return[

                WorkflowStep.CPV

            ];

        case WorkflowStep.ESTIMATED_VALUE:

            return[

                WorkflowStep.CPV

            ];

        case WorkflowStep.PROCEDURE:

            return[

                WorkflowStep.ESTIMATED_VALUE

            ];

        case WorkflowStep.SOLVENCY:

            return[

                WorkflowStep.PROCEDURE

            ];

        case WorkflowStep.GUARANTEES:

            return[

                WorkflowStep.SOLVENCY

            ];

        case WorkflowStep.AWARD_CRITERIA:

            return[

                WorkflowStep.GUARANTEES

            ];

        case WorkflowStep.VALIDATION:

            return[

                WorkflowStep.AWARD_CRITERIA

            ];

        case WorkflowStep.LEGAL_ANALYSIS:

            return[

                WorkflowStep.VALIDATION

            ];

        case WorkflowStep.DOCUMENT_GENERATION:

            return[

                WorkflowStep.LEGAL_ANALYSIS

            ];

        case WorkflowStep.EXPORT:

            return[

                WorkflowStep.DOCUMENT_GENERATION

            ];

        default:

            return[];

    }

}

/*===========================================================================
=
= TAREAS DISPONIBLES
=
===========================================================================*/

private getExecutableTasks()

    :WorkflowPipelineTask[]{

    return this.pipeline.filter(

        task=>

            !task.completed

            &&

            !task.executing

            &&

            !task.failed

            &&

            task.dependencies.every(

                dependency=>

                    this.pipeline

                        .find(

                            pipelineTask=>

                                pipelineTask.step===dependency

                        )?.completed===true

            )

    );

}

/*===========================================================================
=
= ORDENACIÓN
=
===========================================================================*/

private sortPipeline()

    :void{

    this.pipeline.sort(

        (

            left,

            right

        )=>

            right.priority-left.priority

    );

}

/*===========================================================================
=
= EJECUCIÓN DEL PIPELINE
=
===========================================================================*/

private async executePipeline()

    :Promise<void>{

    this.sortPipeline();

    while(

        true

    ){

        const executable=

            this.getExecutableTasks();

        if(

            executable.length===0

        ){

            break;

        }

        for(

            const task

            of executable

        ){

            await this.executePipelineTask(

                task

            );

        }

    }

}

/*===========================================================================
=
= EJECUCIÓN DE TAREA
=
===========================================================================*/

private async executePipelineTask(

    task:WorkflowPipelineTask

)

    :Promise<void>{

    task.executing=true;

    this.currentStep=

        task.step;

    try{

        await this.executeBusinessLogic(

            task.step

        );

        task.completed=true;

    }

    catch(

        error

    ){

        task.failed=true;

        task.retries++;

        this.failStep(

            task.step

        );

        await this.notifyWorkflowError(

            error

        );

    }

    finally{

        task.executing=false;

    }

}

/*===========================================================================
=
= REPLANIFICACIÓN
=
===========================================================================*/

private rebuildPipeline()

    :void{

    this.pipeline.length=0;

    this.buildPipeline();

}

/*===========================================================================
=
= ESTADO DEL PIPELINE
=
===========================================================================*/

public getPipelineStatus(){

    return{

        total:

            this.pipeline.length,

        completed:

            this.pipeline.filter(

                x=>x.completed

            ).length,

        executing:

            this.pipeline.filter(

                x=>x.executing

            ).length,

        failed:

            this.pipeline.filter(

                x=>x.failed

            ).length,

        pending:

            this.pipeline.filter(

                x=>

                    !x.completed

                    &&

                    !x.failed

            ).length

    };

}

/*===========================================================================
=
= BALANCEADOR DE CARGA DEL WORKFLOW
=
===========================================================================*/

private readonly executionHistory:
    Map<WorkflowStep, number[]> = new Map();

private readonly executionLoad:
    Map<WorkflowStep, number> = new Map();

private readonly executionFailures:
    Map<WorkflowStep, number> = new Map();

/*===========================================================================
=
= REGISTRO DE TIEMPOS
=
===========================================================================*/

private registerExecutionTime(

    step: WorkflowStep,

    milliseconds: number

): void {

    if (

        !this.executionHistory.has(step)

    ) {

        this.executionHistory.set(

            step,

            []

        );

    }

    this.executionHistory

        .get(step)!

        .push(milliseconds);

    this.executionLoad.set(

        step,

        milliseconds

    );

}

/*===========================================================================
=
= REGISTRO DE ERRORES
=
===========================================================================*/

private registerFailure(

    step: WorkflowStep

): void {

    const current =

        this.executionFailures.get(step)

        ?? 0;

    this.executionFailures.set(

        step,

        current + 1

    );

}

/*===========================================================================
=
= CÁLCULO DE COSTE
=
===========================================================================*/

private calculateExecutionCost(

    step: WorkflowStep

): number {

    const load =

        this.executionLoad.get(step)

        ?? 0;

    const failures =

        this.executionFailures.get(step)

        ?? 0;

    return (

        load +

        failures * 500

    );

}

/*===========================================================================
=
= REORDENACIÓN DINÁMICA
=
===========================================================================*/

private optimizePipeline()

    : void {

    this.pipeline.sort(

        (

            left,

            right

        ) => {

            const costLeft =

                this.calculateExecutionCost(

                    left.step

                );

            const costRight =

                this.calculateExecutionCost(

                    right.step

                );

            if (

                left.priority !==

                right.priority

            ) {

                return (

                    right.priority -

                    left.priority

                );

            }

            return (

                costLeft -

                costRight

            );

        }

    );

}

/*===========================================================================
=
= DETECCIÓN DE CUELLOS DE BOTELLA
=
===========================================================================*/

private detectBottlenecks()

    : WorkflowStep[] {

    const bottlenecks:

        WorkflowStep[] = [];

    for (

        const [

            step,

            values

        ]

        of this.executionHistory

    ) {

        if (

            values.length === 0

        ) {

            continue;

        }

        const average =

            values.reduce(

                (

                    a,

                    b

                ) => a + b,

                0

            )

            /

            values.length;

        if (

            average >

            3000

        ) {

            bottlenecks.push(step);

        }

    }

    return bottlenecks;

}

/*===========================================================================
=
= INFORME DE RENDIMIENTO
=
===========================================================================*/

public buildPerformanceReport() {

    return {

        statistics:

            this.statistics,

        metrics:

            this.metrics,

        bottlenecks:

            this.detectBottlenecks(),

        scheduler:

            this.schedulerStatistics(),

        pipeline:

            this.getPipelineStatus()

    };

}

/*===========================================================================
=
= AUTOOPTIMIZACIÓN
=
===========================================================================*/

private autoOptimize()

    : void {

    this.optimizePipeline();

    this.refreshRealtimeInformation();

}

/*===========================================================================
=
= SUPERVISIÓN CONTINUA
=
===========================================================================*/

private async supervisionCycle()

    : Promise<void> {

    this.autoOptimize();

    await this.heartbeat();

    if (

        this.detectDeadlock()

    ) {

        await this.resolveDeadlock();

    }

}

/*===========================================================================
=
= BUCLE PRINCIPAL DEL MOTOR
=
===========================================================================*/

private async engineCycle()

    : Promise<void> {

    this.buildExecutionQueue();

    this.buildPipeline();

    while (

        this.status ===

        WorkflowStatus.RUNNING

    ) {

        this.checkCancellation();

        await this.waitIfPaused();

        await this.schedulerCycle();

        await this.supervisionCycle();

        if (

            this.statistics.completedSteps >=

            this.statistics.totalSteps

        ) {

            break;

        }

    }

}

/*===========================================================================
=
= FINALIZACIÓN
=
===========================================================================*/

private finishWorkflow()

    : void {

    this.finishedAt =

        new Date();

    this.statistics.executionMilliseconds =

        this.finishedAt.getTime()

        -

        this.startedAt!.getTime();

    this.changeStatus(

        WorkflowStatus.FINISHED

    );

}

/*===========================================================================
=
= AUDITORÍA DEL WORKFLOW
=
===========================================================================*/

export interface WorkflowAuditRecord{

    id:UUID;

    timestamp:string;

    step:WorkflowStep;

    status:WorkflowStatus;

    action:string;

    user:string;

    duration:number;

    details?:unknown;

}

private readonly auditTrail:

    WorkflowAuditRecord[]=[];


/*===========================================================================
=
= REGISTRO DE AUDITORÍA
=
===========================================================================*/

private registerAudit(

    action:string,

    details?:unknown

):void{

    this.auditTrail.push({

        id:crypto.randomUUID() as UUID,

        timestamp:new Date().toISOString(),

        step:this.currentStep,

        status:this.status,

        action,

        user:"SYSTEM",

        duration:this.statistics.executionMilliseconds,

        details

    });

}

/*===========================================================================
=
= EXPORTACIÓN DE AUDITORÍA
=
===========================================================================*/

public getAuditTrail()

    :ReadonlyArray<WorkflowAuditRecord>{

    return Object.freeze(

        [...this.auditTrail]

    );

}

/*===========================================================================
=
= TRAZABILIDAD
=
===========================================================================*/

public buildTraceReport(){

    return{

        workflowStatus:this.status,

        currentStep:this.currentStep,

        progress:this.getCompletionPercentage(),

        executedSteps:this.completedQueue,

        failedSteps:this.failedQueue,

        waitingSteps:this.waitingQueue,

        queuedSteps:this.executionQueue,

        checkpoints:this.checkpoints,

        audit:this.auditTrail

    };

}

/*===========================================================================
=
= API PÚBLICA
=
===========================================================================*/

public isRunning()

    :boolean{

    return this.status===WorkflowStatus.RUNNING;

}

public isPaused()

    :boolean{

    return this.status===WorkflowStatus.PAUSED;

}

public isFinished()

    :boolean{

    return this.status===WorkflowStatus.FINISHED;

}

public isCancelled()

    :boolean{

    return this.status===WorkflowStatus.CANCELLED;

}

public hasErrors()

    :boolean{

    return this.statistics.failedSteps>0;

}

/*===========================================================================
=
= CONSULTAS
=
===========================================================================*/

public getCurrentNode()

    :WorkflowNode|undefined{

    return this.findNode(

        this.currentStep

    );

}

public getNodes()

    :ReadonlyArray<WorkflowNode>{

    return Object.freeze(

        [...this.nodes]

    );

}

public getEvents()

    :ReadonlyArray<WorkflowEvent>{

    return Object.freeze(

        [...this.events]

    );

}

public getCheckpoints()

    :ReadonlyArray<WorkflowCheckpoint>{

    return Object.freeze(

        [...this.checkpoints]

    );

}

/*===========================================================================
=
= SERIALIZACIÓN
=
===========================================================================*/

public serialize(){

    return{

        status:this.status,

        currentStep:this.currentStep,

        statistics:this.statistics,

        metrics:this.metrics,

        events:this.events,

        checkpoints:this.checkpoints,

        audit:this.auditTrail

    };

}

/*===========================================================================
=
= RESTAURACIÓN
=
===========================================================================*/

public restore(

    snapshot:any

):void{

    this.status=

        snapshot.status;

    this.currentStep=

        snapshot.currentStep;

    this.statistics=

        snapshot.statistics;

}

/*===========================================================================
=
= LIMPIEZA PARCIAL
=
===========================================================================*/

public clearHistory()

    :void{

    this.events.length=0;

    this.auditTrail.length=0;

    this.checkpoints.length=0;

}

/*===========================================================================
=
= DIAGNÓSTICO
=
===========================================================================*/

public diagnostics(){

    return{

        healthy:

            !this.hasErrors(),

        observers:

            this.observers.length,

        queue:

            this.executionQueue.length,

        waiting:

            this.waitingQueue.length,

        completed:

            this.completedQueue.length,

        failed:

            this.failedQueue.length,

        audit:

            this.auditTrail.length

    };

}

/*===========================================================================
=
= LIMPIEZA COMPLETA
=
===========================================================================*/

public dispose()

    : void {

    this.events.length = 0;

    this.checkpoints.length = 0;

    this.auditTrail.length = 0;

    this.executionQueue.length = 0;

    this.waitingQueue.length = 0;

    this.completedQueue.length = 0;

    this.failedQueue.length = 0;

    this.pipeline.length = 0;

    this.observers.length = 0;

    this.executionHistory.clear();

    this.executionLoad.clear();

    this.executionFailures.clear();

    this.timers.clear();

    this.context = undefined;

    this.startedAt = undefined;

    this.finishedAt = undefined;

    this.cancelled = false;

    this.paused = false;

    this.retries = 0;

    this.status = WorkflowStatus.CREATED;

    this.currentStep = WorkflowStep.START;

}

/*===========================================================================
=
= INFORMACIÓN DEL MOTOR
=
===========================================================================*/

public getEngineInformation() {

    return {

        name: WORKFLOW_ENGINE_NAME,

        version: WORKFLOW_ENGINE_VERSION,

        description: WORKFLOW_ENGINE_DESCRIPTION,

        author: "Asistente de Contratación Pública",

        status: this.status,

        currentStep: this.currentStep,

        healthy: this.healthCheck()

    };

}

/*===========================================================================
=
= HEALTH CHECK
=
===========================================================================*/

public healthCheck()

    : boolean {

    return (

        this.nodes.length > 0 &&

        this.statistics.totalSteps > 0

    );

}

/*===========================================================================
=
= RESET COMPLETO
=
===========================================================================*/

public reset()

    : void {

    this.dispose();

    this.buildWorkflow();

}

/*===========================================================================
=
= FACTORY
=
===========================================================================*/

export class WorkflowEngineFactory {

    public static create()

        : WorkflowEngine {

        return new WorkflowEngine();

    }

    public static createDefault()

        : WorkflowEngine {

        return new WorkflowEngine({

            automaticSave: true,

            allowRollback: true,

            allowSkip: false,

            maximumRetries: 3,

            createCheckpoints: true,

            validateAfterEveryStep: true

        });

    }

}

/*===========================================================================
=
= CONSTANTES
=
===========================================================================*/

export const WORKFLOW_ENGINE_NAME =

    "ACP Workflow Engine";

export const WORKFLOW_ENGINE_VERSION =

    "1.0.0";

export const WORKFLOW_ENGINE_DESCRIPTION =

    "Workflow orchestration engine for the Asistente de Contratación Pública.";

/*===========================================================================
=
= DOCUMENTACIÓN TÉCNICA
=
===========================================================================*/

/*

WORKFLOW ENGINE

Responsabilidades principales

• Coordinar el ciclo de vida del expediente.

• Gestionar estados.

• Gestionar checkpoints.

• Gestionar rollback.

• Gestionar recuperación.

• Gestionar planificación.

• Coordinar RuleEngine.

• Coordinar InferenceEngine.

• Coordinar ValidationEngine.

• Coordinar LegalReasoner.

• Coordinar DocumentGenerator.

• Coordinar ExportManager.

• Gestionar eventos.

• Gestionar auditoría.

• Gestionar observadores.

• Gestionar pipeline.

• Gestionar scheduler.

• Gestionar métricas.

• Gestionar sincronización con ContractGenerator.

Este motor constituye el director de orquesta del sistema.

Ningún otro componente debe controlar el flujo completo del
expediente administrativo.

FIN DEL ARCHIVO

*/
