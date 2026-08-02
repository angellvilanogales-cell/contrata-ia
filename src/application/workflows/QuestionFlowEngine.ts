/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * QuestionFlowEngine
 * ------------------------------------------------------------
 * Motor conversacional encargado de guiar al usuario durante la
 * creación de un expediente administrativo.
 *
 * RESPONSABILIDADES
 *
 * • Determinar qué información falta.
 * • Formular únicamente las preguntas necesarias.
 * • Registrar respuestas.
 * • Construir progresivamente el ContractFile.
 * • Entregar el expediente completo al DecisionEngine.
 *
 * NO contiene:
 *
 * • Lógica jurídica.
 * • Interpretación de la LCSP.
 * • Reglas documentales.
 * • Generación de documentos.
 *
 * ============================================================
 */

import { ContractFile } from "../../domain/contracts/ContractFile";

/**
 * Estado del asistente.
 */
export enum WorkflowStatus {

    NOT_STARTED = "NOT_STARTED",

    RUNNING = "RUNNING",

    COMPLETED = "COMPLETED"

}

/**
 * Tipo de respuesta esperada.
 */
export enum QuestionType {

    TEXT = "TEXT",

    NUMBER = "NUMBER",

    DATE = "DATE",

    BOOLEAN = "BOOLEAN",

    OPTION = "OPTION"

}

/**
 * Pregunta del asistente.
 */
export interface WorkflowQuestion {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Campo del ContractFile que alimenta.
     */
    field: string;

    /**
     * Texto mostrado al usuario.
     */
    question: string;

    /**
     * Tipo esperado.
     */
    type: QuestionType;

    /**
     * Obligatoria.
     */
    required: boolean;

    /**
     * Opciones disponibles.
     */
    options?: string[];

}

/**
 * Respuesta del usuario.
 */
export interface WorkflowAnswer {

    /**
     * Pregunta respondida.
     */
    questionId: string;

    /**
     * Valor.
     */
    value: unknown;

}

/**
 * Resultado del flujo.
 */
export interface WorkflowResult {

    /**
     * Expediente generado.
     */
    contract: ContractFile;

    /**
     * Flujo finalizado.
     */
    completed: boolean;

}

/**
 * ============================================================
 * QuestionFlowEngine
 * ============================================================
 */
export class QuestionFlowEngine {

    /**
     * Expediente en construcción.
     */
    private readonly contract: ContractFile;

    /**
     * Estado del asistente.
     */
    private status: WorkflowStatus =
        WorkflowStatus.NOT_STARTED;

    /**
     * Preguntas disponibles.
     */
    private readonly questions: WorkflowQuestion[] = [];

    /**
     * Respuestas registradas.
     */
    private readonly answers: WorkflowAnswer[] = [];

    /**
     * Constructor.
     */
    constructor(
        contract?: ContractFile
    ) {

        this.contract =
            contract ?? new ContractFile();

        this.initializeQuestions();

    }

    /**
     * Inicializa el catálogo de preguntas.
     *
     * Se implementará en la siguiente parte.
     */
    private initializeQuestions(): void {

        // TODO

    }

}

    /**
     * Inicia el asistente.
     */
    public start(): void {

        this.status = WorkflowStatus.RUNNING;

    }

    /**
     * Devuelve el estado actual.
     */
    public getStatus(): WorkflowStatus {

        return this.status;

    }

    /**
     * Devuelve la siguiente pregunta pendiente.
     */
    public nextQuestion():
        WorkflowQuestion | undefined {

        for (const question of this.questions) {

            const alreadyAnswered =
                this.answers.some(
                    answer =>
                        answer.questionId === question.id
                );

            if (!alreadyAnswered) {
                return question;
            }

        }

        return undefined;

    }

    /**
     * Devuelve la pregunta actual.
     */
    public getCurrentQuestion():
        WorkflowQuestion | undefined {

        return this.nextQuestion();

    }

    /**
     * Registra una respuesta del usuario.
     */
    public answer(
        questionId: string,
        value: unknown
    ): void {

        const existing =
            this.answers.find(
                answer =>
                    answer.questionId === questionId
            );

        if (existing) {

            existing.value = value;

        } else {

            this.answers.push({

                questionId,

                value

            });

        }

        this.updateContractField(
            questionId,
            value
        );

        if (this.isCompleted()) {

            this.status =
                WorkflowStatus.COMPLETED;

        }

    }

    /**
     * Actualiza el ContractFile.
     *
     * En versiones futuras utilizará
     * un mapper especializado.
     */
    private updateContractField(
        questionId: string,
        value: unknown
    ): void {

        const question =
            this.questions.find(
                q => q.id === questionId
            );

        if (!question) {

            return;

        }

        const field = question.field;

        if (field in this.contract) {

            (this.contract as Record<string, unknown>)[field] =
                value;

        }

    }

    /**
     * Indica si ya se dispone
     * de toda la información mínima.
     */
    public isCompleted(): boolean {

        const requiredQuestions =
            this.questions.filter(
                q => q.required
            );

        return requiredQuestions.every(
            question =>
                this.answers.some(
                    answer =>
                        answer.questionId === question.id
                )
        );

    }

    /**
     * Devuelve todas las respuestas.
     */
    public getAnswers():
        ReadonlyArray<WorkflowAnswer> {

        return this.answers;

    }

    /**
     * Devuelve el expediente
     * actualmente construido.
     */
    public getContract():
        ContractFile {

        return this.contract;

    }

    /**
     * Reinicia completamente el flujo.
     */
    public reset(): void {

        this.answers.length = 0;

        this.status =
            WorkflowStatus.NOT_STARTED;

    }

    /**
     * Inicializa el catálogo inicial de preguntas.
     *
     * IMPORTANTE:
     * Este catálogo representa únicamente la versión inicial.
     *
     * En versiones posteriores las preguntas procederán desde la
     * Legal Knowledge Base y serán dinámicas.
     */
    private initializeQuestions(): void {

        this.questions.push(

            {
                id: "Q001",
                field: "necesidad",
                question:
                    "¿Qué necesidad pública se pretende cubrir?",
                type: QuestionType.TEXT,
                required: true
            },

            {
                id: "Q002",
                field: "insuficienciaMedios",
                question:
                    "¿La Administración dispone de medios propios suficientes?",
                type: QuestionType.BOOLEAN,
                required: true
            },

            {
                id: "Q003",
                field: "tipoContrato",
                question:
                    "¿Qué tipo de prestación deseas contratar?",
                type: QuestionType.OPTION,
                required: true,
                options: [
                    "Obras",
                    "Servicios",
                    "Suministros",
                    "Concesión de obras",
                    "Concesión de servicios",
                    "Mixto",
                    "No lo sé"
                ]
            },

            {
                id: "Q004",
                field: "valorEstimado",
                question:
                    "¿Cuál es el valor estimado del contrato?",
                type: QuestionType.NUMBER,
                required: true
            },

            {
                id: "Q005",
                field: "duracion",
                question:
                    "¿Cuál es la duración prevista del contrato?",
                type: QuestionType.TEXT,
                required: true
            }

        );

    }

    /**
     * Devuelve los campos que todavía
     * faltan por responder.
     */
    public missingFields(): string[] {

        return this.questions

            .filter(question =>
                !this.answers.some(
                    answer =>
                        answer.questionId === question.id
                )
            )

            .map(question => question.field);

    }

    /**
     * Indica si una pregunta debe
     * mostrarse al usuario.
     *
     * Esta lógica crecerá conforme
     * evolucione la ontología.
     */
    private shouldAskQuestion(
        question: WorkflowQuestion
    ): boolean {

        /*
         * Aquí aparecerán en el futuro
         * las reglas conversacionales.
         *
         * Ejemplo:
         *
         * - Si el tipo de contrato ya se
         *   ha deducido automáticamente,
         *   no volver a preguntarlo.
         *
         * - Si el procedimiento ya puede
         *   inferirse, ocultar preguntas
         *   posteriores.
         */

        return true;

    }

    /**
     * Construye el contexto que
     * utilizará posteriormente
     * el ContractDecisionEngine.
     */
    public buildDecisionContext() {

        return {

            contract: this.contract,

            answers: this.answers,

            missingFields: this.missingFields(),

            completed: this.isCompleted()

        };

    }

    /**
     * Devuelve el resultado completo
     * del asistente.
     */
    public finish(): WorkflowResult {

        return {

            contract: this.contract,

            completed: this.isCompleted()

        };

    }

    /**
     * Número total de preguntas
     * definidas actualmente.
     */
    public getQuestionCount(): number {

        return this.questions.length;

    }

    /**
     * Número de respuestas registradas.
     */
    public getAnsweredCount(): number {

        return this.answers.length;

    }

    /**
     * Porcentaje de progreso del asistente.
     */
    public getProgress(): number {

        if (this.questions.length === 0) {

            return 0;

        }

        return Math.round(

            (this.answers.length / this.questions.length) * 100

        );

    }

    /**
     * Indica si todavía quedan
     * preguntas pendientes.
     */
    public hasPendingQuestions(): boolean {

        return !this.isCompleted();

    }

    /**
     * Obtiene una pregunta
     * por su identificador.
     */
    public getQuestionById(
        id: string
    ): WorkflowQuestion | undefined {

        return this.questions.find(

            question => question.id === id

        );

    }

    /**
     * Elimina todas las respuestas.
     */
    public clearAnswers(): void {

        this.answers.length = 0;

        this.status = WorkflowStatus.NOT_STARTED;

    }

    /**
     * Punto de extensión para futuras
     * preguntas dinámicas procedentes
     * del KnowledgeRepository.
     */
    protected loadDynamicQuestions(): void {

        /*
         * FUTURO
         *
         * KnowledgeRepository
         *      ↓
         * Ontología
         *      ↓
         * Preguntas dinámicas
         */

    }

    /**
     * Punto de extensión para futuras
     * reglas conversacionales.
     */
    protected evaluateConversationRules(): void {

        /*
         * FUTURO
         *
         * Si una respuesta permite
         * deducir otras preguntas,
         * el flujo las ocultará.
         */

    }

}
