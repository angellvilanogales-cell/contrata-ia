/**
 * ============================================================
 * CONTRATA-IA
 * ============================================================
 *
 * InterviewSession
 *
 * ------------------------------------------------------------
 * Núcleo vivo del expediente.
 *
 * Toda la conversación gira alrededor de esta clase.
 *
 * NO contiene conocimiento jurídico.
 * NO contiene reglas.
 * NO contiene normativa.
 *
 * Simplemente representa el estado completo de una sesión
 * de tramitación.
 *
 * ============================================================
 */

export enum SessionStatus {

    CREATED = "CREATED",

    IN_PROGRESS = "IN_PROGRESS",

    WAITING_USER = "WAITING_USER",

    ANALYSING = "ANALYSING",

    VALIDATED = "VALIDATED",

    FINISHED = "FINISHED"

}

export interface SessionMetadata {

    sessionId: string;

    createdAt: Date;

    updatedAt: Date;

    version: number;

}

export interface UserAnswer {

    concept: string;

    value: unknown;

    answeredAt: Date;

    confidence: number;

}

export interface InterviewQuestion {

    id: string;

    concept: string;

    text: string;

    mandatory: boolean;

    createdAt: Date;

}

export interface ValidationError {

    concept: string;

    message: string;

}

export interface ValidationWarning {

    concept: string;

    message: string;

}

export interface DecisionRecord {

    timestamp: Date;

    concept: string;

    decision: string;

}

export class InterviewSession {

    /**
     * =====================================================
     * METADATOS
     * =====================================================
     */

    private readonly metadata: SessionMetadata;

    /**
     * =====================================================
     * ESTADO
     * =====================================================
     */

    private status: SessionStatus =
        SessionStatus.CREATED;

    /**
     * =====================================================
     * RESPUESTAS
     * =====================================================
     */

    private readonly answers = new Map<
        string,
        UserAnswer
    >();

    /**
     * =====================================================
     * PREGUNTAS
     * =====================================================
     */

    private readonly askedQuestions:
        InterviewQuestion[] = [];

    /**
     * =====================================================
     * CONCEPTOS COMPLETADOS
     * =====================================================
     */

    private readonly completed =
        new Set<string>();

    /**
     * =====================================================
     * CONCEPTOS PENDIENTES
     * =====================================================
     */

    private readonly pending =
        new Set<string>();

    /**
     * =====================================================
     * CONCEPTOS BLOQUEADOS
     * =====================================================
     */

    private readonly blocked =
        new Set<string>();

    /**
     * =====================================================
     * CONCEPTOS DESCARTADOS
     * =====================================================
     */

    private readonly ignored =
        new Set<string>();

    /**
     * =====================================================
     * ERRORES
     * =====================================================
     */

    private readonly errors:
        ValidationError[] = [];

    /**
     * =====================================================
     * ADVERTENCIAS
     * =====================================================
     */

    private readonly warnings:
        ValidationWarning[] = [];

    /**
     * =====================================================
     * DECISIONES
     * =====================================================
     */

    private readonly decisions:
        DecisionRecord[] = [];

    /**
     * =====================================================
     * HECHOS DERIVADOS
     * =====================================================
     */

    private readonly derivedFacts =
        new Map<string, unknown>();

    /**
     * =====================================================
     * CONTEXTO GLOBAL
     * =====================================================
     */

    private readonly context =
        new Map<string, unknown>();

    constructor(

        sessionId: string

    ) {

        this.metadata = {

            sessionId,

            createdAt: new Date(),

            updatedAt: new Date(),

            version: 1

        };

    }

    /**
     * =====================================================
     * METADATA
     * =====================================================
     */

    public getMetadata(): SessionMetadata {

        return this.metadata;

    }

    public getStatus(): SessionStatus {

        return this.status;

    }

    public setStatus(

        status: SessionStatus

    ): void {

        this.status = status;

        this.touch();

    }

    /**
     * =====================================================
     * RESPUESTAS
     * =====================================================
     */

    public answer(

        concept: string,

        value: unknown,

        confidence = 1

    ): void {

        this.answers.set(

            concept,

            {

                concept,

                value,

                confidence,

                answeredAt: new Date()

            }

        );

        this.completed.add(concept);

        this.pending.delete(concept);

        this.touch();

    }

    public hasAnswer(

        concept: string

    ): boolean {

        return this.answers.has(concept);

    }

    public getAnswer(

        concept: string

    ): UserAnswer | undefined {

        return this.answers.get(concept);

    }

    public getAnswers(): UserAnswer[] {

        return Array.from(

            this.answers.values()

        );

    }

    /**
     * =====================================================
     * PREGUNTAS
     * =====================================================
     */

    public addQuestion(

        question: InterviewQuestion

    ): void {

        this.askedQuestions.push(question);

        this.touch();

    }

    public getQuestions(): InterviewQuestion[] {

        return this.askedQuestions;

    }

    public lastQuestion():

        InterviewQuestion | undefined {

        if (this.askedQuestions.length === 0) {

            return undefined;

        }

        return this.askedQuestions[
            this.askedQuestions.length - 1
        ];

    }

    /**
     * =====================================================
     * CONCEPTOS PENDIENTES
     * =====================================================
     */

    public addPending(

        concept: string

    ): void {

        if (!this.completed.has(concept)) {

            this.pending.add(concept);

        }

    }

    public removePending(

        concept: string

    ): void {

        this.pending.delete(concept);

    }

    public getPending(): string[] {

        return Array.from(this.pending);

    }

    public isPending(

        concept: string

    ): boolean {

        return this.pending.has(concept);

    }

    /**
     * =====================================================
     * CONCEPTOS COMPLETADOS
     * =====================================================
     */

    public complete(

        concept: string

    ): void {

        this.completed.add(concept);

        this.pending.delete(concept);

    }

    public completedConcepts(): string[] {

        return Array.from(

            this.completed

        );

    }

    /**
     * =====================================================
     * BLOQUEO DE CONCEPTOS
     * =====================================================
     */

    public block(

        concept: string

    ): void {

        this.blocked.add(concept);

    }

    public unblock(

        concept: string

    ): void {

        this.blocked.delete(concept);

    }

    public isBlocked(

        concept: string

    ): boolean {

        return this.blocked.has(concept);

    }

    public blockedConcepts(): string[] {

        return Array.from(

            this.blocked

        );

    }

    /**
     * =====================================================
     * CONCEPTOS IGNORADOS
     * =====================================================
     */

    public ignore(

        concept: string

    ): void {

        this.ignored.add(concept);

    }

    public isIgnored(

        concept: string

    ): boolean {

        return this.ignored.has(concept);

    }

    public ignoredConcepts(): string[] {

        return Array.from(

            this.ignored

        );

    }

    /**
     * =====================================================
     * HECHOS DERIVADOS
     * =====================================================
     */

    public setDerivedFact(

        key: string,

        value: unknown

    ): void {

        this.derivedFacts.set(

            key,

            value

        );

    }

    public getDerivedFact(

        key: string

    ): unknown {

        return this.derivedFacts.get(key);

    }

    public hasDerivedFact(

        key: string

    ): boolean {

        return this.derivedFacts.has(key);

    }

    public derivedFactKeys(): string[] {

        return Array.from(

            this.derivedFacts.keys()

        );

    }

    /**
     * =====================================================
     * CONTEXTO GLOBAL
     * =====================================================
     */

    public putContext(

        key: string,

        value: unknown

    ): void {

        this.context.set(

            key,

            value

        );

    }

    public getContext(

        key: string

    ): unknown {

        return this.context.get(key);

    }

    public hasContext(

        key: string

    ): boolean {

        return this.context.has(key);

    }

    public contextKeys(): string[] {

        return Array.from(

            this.context.keys()

        );

    }

    /**
     * =====================================================
     * ERRORES
     * =====================================================
     */

    public addError(

        concept: string,

        message: string

    ): void {

        this.errors.push({

            concept,

            message

        });

    }

    public getErrors():

        ValidationError[] {

        return this.errors;

    }

    public hasErrors(): boolean {

        return this.errors.length > 0;

    }

    /**
     * =====================================================
     * ADVERTENCIAS
     * =====================================================
     */

    public addWarning(

        concept: string,

        message: string

    ): void {

        this.warnings.push({

            concept,

            message

        });

    }

    public getWarnings():

        ValidationWarning[] {

        return this.warnings;

    }

    public hasWarnings(): boolean {

        return this.warnings.length > 0;

    }

    /**
     * =====================================================
     * DECISIONES
     * =====================================================
     */

    public registerDecision(

        concept: string,

        decision: string

    ): void {

        this.decisions.push({

            timestamp: new Date(),

            concept,

            decision

        });

    }

    public decisionHistory():

        DecisionRecord[] {

        return this.decisions;

    }


      /**
     * =====================================================
     * NAVEGACIÓN
     * =====================================================
     */

    public nextPending(): string | undefined {

        if (this.pending.size === 0) {

            return undefined;

        }

        return Array.from(this.pending)[0];

    }

    public hasPending(): boolean {

        return this.pending.size > 0;

    }

    /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public answeredCount(): number {

        return this.answers.size;

    }

    public pendingCount(): number {

        return this.pending.size;

    }

    public completedCount(): number {

        return this.completed.size;

    }

    public blockedCount(): number {

        return this.blocked.size;

    }

    public ignoredCount(): number {

        return this.ignored.size;

    }

    public decisionCount(): number {

        return this.decisions.length;

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export(): object {

        return {

            metadata: this.metadata,

            status: this.status,

            answers: this.getAnswers(),

            questions: this.getQuestions(),

            completed: this.completedConcepts(),

            pending: this.getPending(),

            blocked: this.blockedConcepts(),

            ignored: this.ignoredConcepts(),

            errors: this.getErrors(),

            warnings: this.getWarnings(),

            decisions: this.decisionHistory(),

            derivedFacts: Object.fromEntries(

                this.derivedFacts

            ),

            context: Object.fromEntries(

                this.context

            )

        };

    }

    /**
     * =====================================================
     * SERIALIZACIÓN
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.export(),

            null,

            2

        );

    }

    /**
     * =====================================================
     * REINICIO
     * =====================================================
     */

    public reset(): void {

        this.answers.clear();

        this.askedQuestions.length = 0;

        this.completed.clear();

        this.pending.clear();

        this.blocked.clear();

        this.ignored.clear();

        this.errors.length = 0;

        this.warnings.length = 0;

        this.decisions.length = 0;

        this.derivedFacts.clear();

        this.context.clear();

        this.status = SessionStatus.CREATED;

        this.metadata.version++;

        this.touch();

    }

    /**
     * =====================================================
     * SINCRONIZACIÓN
     * =====================================================
     */

    public synchronize(): void {

        this.metadata.version++;

        this.touch();

    }

    /**
     * =====================================================
     * FECHA DE MODIFICACIÓN
     * =====================================================
     */

    private touch(): void {

        this.metadata.updatedAt = new Date();

    }

}
