/** Contrata-IA — flujo conversacional inicial del expediente. */

import { ContractFile } from "../../domain/contracts/ContractFile";

export enum WorkflowStatus {
    NOT_STARTED = "NOT_STARTED",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED"
}

export enum QuestionType {
    TEXT = "TEXT",
    NUMBER = "NUMBER",
    DATE = "DATE",
    BOOLEAN = "BOOLEAN",
    OPTION = "OPTION"
}

export interface WorkflowQuestion {
    id: string;
    field: string;
    question: string;
    type: QuestionType;
    required: boolean;
    options?: string[];
}

export interface WorkflowAnswer {
    questionId: string;
    value: unknown;
}

export interface WorkflowResult {
    contract: ContractFile;
    completed: boolean;
}

export class QuestionFlowEngine {
    private readonly contract: ContractFile;
    private status: WorkflowStatus = WorkflowStatus.NOT_STARTED;
    private readonly questions: WorkflowQuestion[] = [];
    private readonly answers: WorkflowAnswer[] = [];

    constructor(contract?: ContractFile) {
        this.contract = contract ?? new ContractFile();
        this.initializeQuestions();
    }

    public start(): void {
        this.status = WorkflowStatus.RUNNING;
    }

    public getStatus(): WorkflowStatus {
        return this.status;
    }

    public nextQuestion(): WorkflowQuestion | undefined {
        return this.questions.find(question => !this.answers.some(answer => answer.questionId === question.id));
    }

    public getCurrentQuestion(): WorkflowQuestion | undefined {
        return this.nextQuestion();
    }

    public answer(questionId: string, value: unknown): void {
        const existing = this.answers.find(answer => answer.questionId === questionId);
        if (existing) {
            existing.value = value;
        } else {
            this.answers.push({ questionId, value });
        }
        this.updateContractField(questionId, value);
        if (this.isCompleted()) this.status = WorkflowStatus.COMPLETED;
    }

    private updateContractField(questionId: string, value: unknown): void {
        const question = this.questions.find(item => item.id === questionId);
        if (!question) return;
        const field = question.field;
        if (field in this.contract) {
            (this.contract as unknown as Record<string, unknown>)[field] = value;
        }
    }

    public isCompleted(): boolean {
        return this.questions.filter(question => question.required).every(question =>
            this.answers.some(answer => answer.questionId === question.id)
        );
    }

    public getAnswers(): ReadonlyArray<WorkflowAnswer> {
        return this.answers;
    }

    public getContract(): ContractFile {
        return this.contract;
    }

    public reset(): void {
        this.answers.length = 0;
        this.status = WorkflowStatus.NOT_STARTED;
    }

    private initializeQuestions(): void {
        this.questions.push(
            {
                id: "Q001",
                field: "necesidad",
                question: "¿Qué necesidad pública se pretende cubrir?",
                type: QuestionType.TEXT,
                required: true
            },
            {
                id: "Q002",
                field: "insuficienciaMedios",
                question: "¿La Administración dispone de medios propios suficientes?",
                type: QuestionType.BOOLEAN,
                required: true
            },
            {
                id: "Q003",
                field: "tipoContrato",
                question: "¿Qué tipo de prestación deseas contratar?",
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
                question: "¿Cuál es el valor estimado del contrato?",
                type: QuestionType.NUMBER,
                required: true
            },
            {
                id: "Q005",
                field: "duracion",
                question: "¿Cuál es la duración prevista del contrato?",
                type: QuestionType.TEXT,
                required: true
            }
        );
    }

    public missingFields(): string[] {
        return this.questions
            .filter(question => !this.answers.some(answer => answer.questionId === question.id))
            .map(question => question.field);
    }

    private shouldAskQuestion(_question: WorkflowQuestion): boolean {
        return true;
    }

    public buildDecisionContext() {
        return {
            contract: this.contract,
            answers: this.answers,
            missingFields: this.missingFields(),
            completed: this.isCompleted()
        };
    }

    public finish(): WorkflowResult {
        return {
            contract: this.contract,
            completed: this.isCompleted()
        };
    }

    public getQuestionCount(): number {
        return this.questions.length;
    }

    public getAnsweredCount(): number {
        return this.answers.length;
    }

    public getProgress(): number {
        if (this.questions.length === 0) return 0;
        return Math.round((this.answers.length / this.questions.length) * 100);
    }

    public hasPendingQuestions(): boolean {
        return !this.isCompleted();
    }

    public getQuestionById(id: string): WorkflowQuestion | undefined {
        return this.questions.find(question => question.id === id);
    }

    public clearAnswers(): void {
        this.answers.length = 0;
        this.status = WorkflowStatus.NOT_STARTED;
    }

    protected loadDynamicQuestions(): void {
        // Punto de extensión para conocimiento dinámico.
    }

    protected evaluateConversationRules(): void {
        // Punto de extensión para reglas conversacionales.
    }
}
