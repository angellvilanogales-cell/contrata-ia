/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ContractInterviewEngine
 * ------------------------------------------------------------
 *
 * Director inteligente de la entrevista.
 *
 * Este componente constituye el punto de entrada de todo el
 * asistente.
 *
 * RESPONSABILIDADES
 *
 * • Crear entrevistas.
 * • Recuperar entrevistas.
 * • Gestionar el flujo.
 * • Pedir preguntas.
 * • Registrar respuestas.
 * • Analizar el expediente.
 * • Lanzar el motor de decisiones.
 * • Mantener sincronizada la sesión.
 *
 * IMPORTANTE
 *
 * Este componente NO contiene normativa.
 *
 * NO contiene reglas jurídicas.
 *
 * NO conoce la LCSP.
 *
 * Únicamente coordina el funcionamiento del sistema.
 *
 * ============================================================
 */

import { InterviewSession } from "./InterviewSession";
import { SessionStatus } from "./InterviewSession";

import { ExpedienteAnalyzer } from "../knowledge/ExpedienteAnalyzer";

import { QuestionFlowEngine } from "../knowledge/QuestionFlowEngine";

import { DecisionEngine } from "../knowledge/DecisionEngine";

import { ContractKnowledgeEngine } from "../knowledge/ContractKnowledgeEngine";

import { DecisionContext } from "../knowledge/DecisionContext";

import { KnowledgeDecision } from "../knowledge/models/KnowledgeDecision";

import { Question } from "../knowledge/QuestionFlowEngine";

export class ContractInterviewEngine {

    /**
     * =====================================================
     * COMPONENTES
     * =====================================================
     */

    private readonly analyzer: ExpedienteAnalyzer;

    private readonly flow: QuestionFlowEngine;

    private readonly knowledge: ContractKnowledgeEngine;

    private readonly decisionEngine: DecisionEngine;

    /**
     * =====================================================
     * SESIÓN ACTIVA
     * =====================================================
     */

    private session?: InterviewSession;

    /**
     * =====================================================
     * CONSTRUCTOR
     * =====================================================
     */

    constructor(

        analyzer: ExpedienteAnalyzer,

        flow: QuestionFlowEngine,

        knowledge: ContractKnowledgeEngine,

        decisionEngine: DecisionEngine

    ) {

        this.analyzer = analyzer;

        this.flow = flow;

        this.knowledge = knowledge;

        this.decisionEngine = decisionEngine;

    }

    /**
     * =====================================================
     * CREA UNA NUEVA SESIÓN
     * =====================================================
     */

    public createSession(

        sessionId: string

    ): InterviewSession {

        this.session = new InterviewSession(

            sessionId

        );

        this.session.setStatus(

            SessionStatus.CREATED

        );

        return this.session;

    }

    /**
     * =====================================================
     * CARGA UNA SESIÓN
     * =====================================================
     */

    public loadSession(

        session: InterviewSession

    ): void {

        this.session = session;

    }

    /**
     * =====================================================
     * SESIÓN ACTUAL
     * =====================================================
     */

    public currentSession():

        InterviewSession {

        if (!this.session) {

            throw new Error(

                "No existe una sesión activa."

            );

        }

        return this.session;

    }

    /**
     * =====================================================
     * ¿EXISTE SESIÓN?
     * =====================================================
     */

    public hasSession(): boolean {

        return this.session !== undefined;

    }

    /**
     * =====================================================
     * INICIA LA ENTREVISTA
     * =====================================================
     */

    public start(): void {

        const session = this.currentSession();

        session.setStatus(

            SessionStatus.IN_PROGRESS

        );

        this.updatePendingConcepts();

    }

    /**
     * =====================================================
     * FINALIZA LA ENTREVISTA
     * =====================================================
     */

    public finish(): void {

        const session = this.currentSession();

        session.setStatus(

            SessionStatus.FINISHED

        );

    }

    /**
     * =====================================================
     * ACTUALIZA LOS CONCEPTOS PENDIENTES
     * =====================================================
     */

    private updatePendingConcepts(): void {

        const session = this.currentSession();

        const context = this.buildContext();

        const analysis = this.analyzer.analyze(

            context

        );

        for (const concept of analysis.pending) {

            session.addPending(

                concept.id

            );

        }

    }


    /**
     * =====================================================
     * SIGUIENTE PREGUNTA
     * =====================================================
     */

    public nextQuestion():

        Question | undefined {

        const session = this.currentSession();

        const context = this.buildContext();

        const question = this.flow.next(

            context

        );

        if (!question) {

            return undefined;

        }

        session.addQuestion({

            id:
                "Q-" + Date.now(),

            concept:
                question.concept,

            text:
                question.text,

            mandatory: true,

            createdAt:
                new Date()

        });

        return question;

    }

    /**
     * =====================================================
     * RESPUESTA DEL USUARIO
     * =====================================================
     */

    public answer(

        concept: string,

        value: unknown,

        confidence = 1

    ): void {

        const session = this.currentSession();

        session.answer(

            concept,

            value,

            confidence

        );

        session.complete(

            concept

        );

        session.removePending(

            concept

        );

        session.synchronize();

    }

    /**
     * =====================================================
     * CONTEXTO DE DECISIÓN
     * =====================================================
     */

    private buildContext():

        DecisionContext {

        const session = this.currentSession();

        const context =
            new DecisionContext();

        for (

            const answer of
            session.getAnswers()

        ) {

            context.set(

                answer.concept,

                answer.value

            );

        }

        for (

            const key of
            session.derivedFactKeys()

        ) {

            context.set(

                key,

                session.getDerivedFact(

                    key

                )

            );

        }

        return context;

    }

    /**
     * =====================================================
     * EJECUTA EL MOTOR
     * =====================================================
     */

    public evaluate():

        KnowledgeDecision {

        const session = this.currentSession();

        session.setStatus(

            SessionStatus.ANALYSING

        );

        const context =
            this.buildContext();

        const decision =
            this.decisionEngine.evaluate(

                context

            );

        session.registerDecision(

            "GLOBAL",

            decision.errors.length === 0
                ? "VALID"
                : "ERROR"

        );

        session.setStatus(

            SessionStatus.IN_PROGRESS

        );

        return decision;

    }

    /**
     * =====================================================
     * REEVALUACIÓN
     * =====================================================
     */

    public reevaluate():

        KnowledgeDecision {

        this.updatePendingConcepts();

        return this.evaluate();

    }

    /**
     * =====================================================
     * ¿ENTREVISTA COMPLETA?
     * =====================================================
     */

    public completed():

        boolean {

        const context =
            this.buildContext();

        return this.flow.completed(

            context

        );

    }

    /**
     * =====================================================
     * VALIDACIÓN COMPLETA DEL EXPEDIENTE
     * =====================================================
     */

    public validate(): boolean {

        const session = this.currentSession();

        session.synchronize();

        const decision = this.evaluate();

        return decision.errors.length === 0;

    }

    /**
     * =====================================================
     * SINCRONIZA EL KNOWLEDGE ENGINE
     * =====================================================
     */

    public synchronizeKnowledge(): void {

        const session = this.currentSession();

        const repository =
            this.knowledge.getRepository();

        /*
         * En futuras versiones este método alimentará el
         * KnowledgeRepository con nuevos hechos derivados,
         * inferencias y relaciones detectadas durante la
         * entrevista.
         */

        session.synchronize();

        void repository;

    }

    /**
     * =====================================================
     * RECONSTRUYE EL CONTEXTO
     * =====================================================
     */

    public rebuildContext(): DecisionContext {

        return this.buildContext();

    }

    /**
     * =====================================================
     * INFORMACIÓN GENERAL
     * =====================================================
     */

    public answeredConcepts(): string[] {

        return this.currentSession()
            .completedConcepts();

    }

    public pendingConcepts(): string[] {

        return this.currentSession()
            .getPending();

    }

    public ignoredConcepts(): string[] {

        return this.currentSession()
            .ignoredConcepts();

    }

    public blockedConcepts(): string[] {

        return this.currentSession()
            .blockedConcepts();

    }

    /**
     * =====================================================
     * HECHOS DERIVADOS
     * =====================================================
     */

    public addDerivedFact(

        key: string,

        value: unknown

    ): void {

        this.currentSession()
            .setDerivedFact(

                key,

                value

            );

    }

    public derivedFact(

        key: string

    ): unknown {

        return this.currentSession()
            .getDerivedFact(

                key

            );

    }

    /**
     * =====================================================
     * CONTEXTO GLOBAL
     * =====================================================
     */

    public setContext(

        key: string,

        value: unknown

    ): void {

        this.currentSession()
            .putContext(

                key,

                value

            );

    }

    public getContext(

        key: string

    ): unknown {

        return this.currentSession()
            .getContext(

                key

            );

    }

    /**
     * =====================================================
     * ERRORES
     * =====================================================
     */

    public errors() {

        return this.currentSession()
            .getErrors();

    }

    public warnings() {

        return this.currentSession()
            .getWarnings();

    }

    /**
     * =====================================================
     * HISTORIAL
     * =====================================================
     */

    public decisions() {

        return this.currentSession()
            .decisionHistory();

    }

    public exportSession() {

        return this.currentSession()
            .export();

    }

    public exportJSON(): string {

        return this.currentSession()
            .toJSON();

    }


      /**
     * =====================================================
     * MODIFICACIÓN DE RESPUESTAS
     * =====================================================
     */

    /**
     * Permite modificar una respuesta existente.
     * Toda modificación invalida automáticamente
     * las decisiones posteriores relacionadas.
     */
    public updateAnswer(

        concept: string,

        value: unknown,

        confidence = 1

    ): void {

        const session = this.currentSession();

        session.answer(

            concept,

            value,

            confidence

        );

        this.invalidateDependentConcepts(

            concept

        );

        this.updatePendingConcepts();

        session.synchronize();

    }

    /**
     * =====================================================
     * ELIMINACIÓN DE RESPUESTAS
     * =====================================================
     */

    /**
     * Convierte nuevamente un concepto en pendiente.
     */
    public removeAnswer(

        concept: string

    ): void {

        const session = this.currentSession();

        /**
         * Mientras InterviewSession no implemente
         * removeAnswer() simplemente volvemos
         * a marcar el concepto como pendiente.
         */

        session.addPending(

            concept

        );

        this.invalidateDependentConcepts(

            concept

        );

        session.synchronize();

    }

    /**
     * =====================================================
     * INVALIDACIÓN DE DEPENDENCIAS
     * =====================================================
     */

    /**
     * Si cambia un concepto,
     * todos los conceptos dependientes deben
     * recalcularse.
     */
    private invalidateDependentConcepts(

        concept: string

    ): void {

        const session = this.currentSession();

        const affected =

            this.knowledge
                .getGraph()
                .outgoing(

                    concept

                );

        for (const relation of affected) {

            session.addPending(

                relation.to

            );

        }

    }

    /**
     * =====================================================
     * REINICIO COMPLETO
     * =====================================================
     */

    public restart(): void {

        const session = this.currentSession();

        session.reset();

        session.setStatus(

            SessionStatus.CREATED

        );

    }

    /**
     * =====================================================
     * REINICIO PARCIAL
     * =====================================================
     */

    public restartFrom(

        concept: string

    ): void {

        const session = this.currentSession();

        session.addPending(

            concept

        );

        this.invalidateDependentConcepts(

            concept

        );

    }

    /**
     * =====================================================
     * NAVEGACIÓN
     * =====================================================
     */

    public nextConcept():

        string | undefined {

        return this.currentSession()

            .nextPending();

    }

    /**
     * =====================================================
     * ESTADO
     * =====================================================
     */

    public progress(): number {

        const session = this.currentSession();

        const completed =

            session.completedCount();

        const pending =

            session.pendingCount();

        const total =

            completed + pending;

        if (total === 0) {

            return 100;

        }

        return Math.round(

            completed * 100 / total

        );

    }

    /**
     * =====================================================
     * ¿EXPEDIENTE COMPLETO?
     * =====================================================
     */

    public isComplete(): boolean {

        return this.progress() === 100;

    }

    /**
     * =====================================================
     * ¿PUEDE GENERARSE EL EXPEDIENTE?
     * =====================================================
     */

    public canGenerateContract(): boolean {

        const session = this.currentSession();

        return (

            session.pendingCount() === 0 &&

            !session.hasErrors()

        );

    }


      /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public statistics() {

        const session = this.currentSession();

        return {

            answered:

                session.answeredCount(),

            pending:

                session.pendingCount(),

            completed:

                session.completedCount(),

            blocked:

                session.blockedCount(),

            ignored:

                session.ignoredCount(),

            decisions:

                session.decisionCount(),

            errors:

                session.getErrors().length,

            warnings:

                session.getWarnings().length,

            progress:

                this.progress()

        };

    }

    /**
     * =====================================================
     * EVENTOS
     * =====================================================
     */

    /**
     * Punto de extensión para futuras versiones.
     *
     * Permitirá lanzar eventos hacia:
     *
     * - interfaz
     * - IA
     * - logs
     * - auditoría
     * - plugins
     */
    protected emit(

        event: string,

        payload?: unknown

    ): void {

        /*
         * Placeholder.
         *
         * Próximamente:
         *
         * EventBus
         *
         * NotificationCenter
         *
         * Telemetry
         *
         */

        void event;

        void payload;

    }

    /**
     * =====================================================
     * INTEGRACIÓN CON IA
     * =====================================================
     */

    /**
     * Devuelve un resumen de la sesión que
     * podrá utilizar un modelo IA para
     * continuar la conversación.
     */
    public buildAISummary() {

        const session = this.currentSession();

        return {

            status:

                session.getStatus(),

            completed:

                session.completedConcepts(),

            pending:

                session.getPending(),

            blocked:

                session.blockedConcepts(),

            ignored:

                session.ignoredConcepts(),

            derivedFacts:

                session.derivedFactKeys(),

            errors:

                session.getErrors(),

            warnings:

                session.getWarnings(),

            decisions:

                session.decisionHistory()

        };

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            interviewCompleted:

                this.completed(),

            contractReady:

                this.canGenerateContract(),

            progress:

                this.progress(),

            statistics:

                this.statistics()

        };

    }

    /**
     * =====================================================
     * INFORMACIÓN DEL MOTOR
     * =====================================================
     */

    public engineInfo() {

        return {

            engine:

                "ContractInterviewEngine",

            version:

                "1.0.0",

            modules: {

                analyzer: true,

                flowEngine: true,

                knowledgeEngine: true,

                decisionEngine: true,

                interviewSession: true

            }

        };

    }

}
