import type {
  CPVEnginePort,
  CPVProposal,
  DocumentExporterPort,
  DocumentGeneratorPort,
  EventBusPort,
  GeneratedDocument,
  ProcedureProposal,
  ProcedureResolverPort,
  RuleEnginePort,
  RuleEvaluationResult
} from "../../architecture/contracts";

export type ExpedienteStatus =
  | "CREATED"
  | "ANALYZED"
  | "PROPOSED"
  | "PENDING_HUMAN_VALIDATION";

export interface ExpedienteInput {
  readonly object: string;
  readonly need: string;
  readonly estimatedValue?: number;
}

export interface DecisionTrace {
  readonly kind: "CPV" | "PROCEDURE";
  readonly proposal: unknown;
  readonly ruleIds: readonly string[];
  readonly sourceIds: readonly string[];
  readonly justification: readonly string[];
  readonly requiresHumanValidation: true;
}

export interface AuditEntry {
  readonly sequence: number;
  readonly expedienteId: string;
  readonly action: string;
  readonly at: string;
  readonly details: Readonly<Record<string, unknown>>;
}

export interface Expediente {
  readonly id: string;
  readonly createdAt: string;
  readonly input: ExpedienteInput;
  status: ExpedienteStatus;
  ruleEvaluation?: RuleEvaluationResult;
  cpvProposal?: CPVProposal;
  procedureProposal?: ProcedureProposal;
  decisions: DecisionTrace[];
  document?: GeneratedDocument;
}

export interface VerticalFlowResult {
  readonly expediente: Expediente;
  readonly json: string;
  readonly html: string;
  readonly audit: readonly AuditEntry[];
}

export class InMemoryExpedienteRepository {
  private readonly records = new Map<string, Expediente>();

  public save(expediente: Expediente): void {
    this.records.set(expediente.id, structuredClone(expediente));
  }

  public get(id: string): Expediente | undefined {
    const value = this.records.get(id);
    return value ? structuredClone(value) : undefined;
  }
}

export class AuditTrail {
  private readonly entries: AuditEntry[] = [];

  public record(expedienteId: string, action: string, details: Readonly<Record<string, unknown>> = {}): void {
    this.entries.push({
      sequence: this.entries.length + 1,
      expedienteId,
      action,
      at: new Date().toISOString(),
      details
    });
  }

  public all(): readonly AuditEntry[] {
    return this.entries.map(entry => structuredClone(entry));
  }
}

export class InMemoryEventBus implements EventBusPort {
  private readonly handlers = new Map<string, Set<(event: { type: string; occurredAt: Date; payload: unknown }) => void | Promise<void>>>();

  public async publish(event: { type: string; occurredAt: Date; payload: unknown }): Promise<void> {
    const handlers = this.handlers.get(event.type) ?? new Set();
    await Promise.all([...handlers].map(handler => handler(event)));
  }

  public subscribe(type: string, handler: (event: { type: string; occurredAt: Date; payload: unknown }) => void | Promise<void>): () => void {
    const handlers = this.handlers.get(type) ?? new Set();
    handlers.add(handler);
    this.handlers.set(type, handlers);
    return () => handlers.delete(handler);
  }
}

export class MinimumRuleAdapter implements RuleEnginePort {
  public evaluate(request: { readonly facts: Readonly<Record<string, unknown>> }): RuleEvaluationResult {
    const object = String(request.facts.object ?? "").trim();
    const need = String(request.facts.need ?? "").trim();
    const errors: string[] = [];
    const ruleIds = ["LB3-TECH-OBJECT-PRESENT", "LB3-TECH-NEED-PRESENT"];

    if (!object) errors.push("El objeto del contrato es obligatorio para continuar el recorrido técnico.");
    if (!need) errors.push("La necesidad administrativa es obligatoria para continuar el recorrido técnico.");

    return {
      valid: errors.length === 0,
      ruleIds,
      warnings: ["Validación técnica LB-3; no sustituye la validación normativa de LB-4."],
      errors
    };
  }
}

export class PendingCPVAdapter implements CPVEnginePort {
  public propose(description: string): readonly CPVProposal[] {
    return [{
      code: "UNASSIGNED",
      label: `CPV pendiente para: ${description}`,
      confidence: 0,
      justification: "LB-3 demuestra el flujo de propuesta. La selección CPV real requiere catálogo y validación del motor normativo LB-4."
    }];
  }
}

export class PendingProcedureAdapter implements ProcedureResolverPort {
  public resolve(): ProcedureProposal {
    return {
      procedure: "PENDING_HUMAN_VALIDATION",
      justification: [
        "LB-3 no infiere un procedimiento jurídico sin corpus normativo validado.",
        "La propuesta queda expresamente pendiente de la fase normativa LB-4 y de validación humana."
      ],
      sourceIds: ["LB3-TECHNICAL-FLOW"],
      requiresHumanValidation: true
    };
  }
}

export class MemoryDocumentAdapter implements DocumentGeneratorPort {
  public generate(type: string, context: Readonly<Record<string, unknown>>): GeneratedDocument {
    return {
      type,
      title: "Memoria técnica preliminar del expediente",
      content: {
        expedienteId: context.expedienteId,
        object: context.object,
        need: context.need,
        cpv: context.cpv,
        procedure: context.procedure,
        validationStatus: "PENDING_HUMAN_VALIDATION"
      },
      warnings: [
        "Documento intermedio LB-3. No constituye un pliego ni una memoria administrativa jurídicamente validada."
      ]
    };
  }
}

export class BasicExporterAdapter implements DocumentExporterPort {
  public export(document: GeneratedDocument, format: string) {
    if (format === "json") {
      return {
        format,
        fileName: "memoria-preliminar.json",
        data: JSON.stringify(document, null, 2)
      };
    }

    if (format === "html") {
      const escaped = JSON.stringify(document.content, null, 2)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
      return {
        format,
        fileName: "memoria-preliminar.html",
        data: `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${document.title}</title></head><body><h1>${document.title}</h1><pre>${escaped}</pre></body></html>`
      };
    }

    throw new Error(`Formato LB-3 no soportado: ${format}`);
  }
}

export interface VerticalSliceDependencies {
  readonly repository: InMemoryExpedienteRepository;
  readonly audit: AuditTrail;
  readonly events: EventBusPort;
  readonly rules: RuleEnginePort;
  readonly cpv: CPVEnginePort;
  readonly procedure: ProcedureResolverPort;
  readonly documents: DocumentGeneratorPort;
  readonly exporter: DocumentExporterPort;
}

export function createVerticalSliceDependencies(): VerticalSliceDependencies {
  return {
    repository: new InMemoryExpedienteRepository(),
    audit: new AuditTrail(),
    events: new InMemoryEventBus(),
    rules: new MinimumRuleAdapter(),
    cpv: new PendingCPVAdapter(),
    procedure: new PendingProcedureAdapter(),
    documents: new MemoryDocumentAdapter(),
    exporter: new BasicExporterAdapter()
  };
}

export class VerticalContractingFlow {
  private sequence = 0;

  public constructor(private readonly dependencies: VerticalSliceDependencies) {}

  public async execute(input: ExpedienteInput): Promise<VerticalFlowResult> {
    const expediente: Expediente = {
      id: `EXP-LB3-${String(++this.sequence).padStart(4, "0")}`,
      createdAt: new Date().toISOString(),
      input,
      status: "CREATED",
      decisions: []
    };

    this.dependencies.repository.save(expediente);
    this.dependencies.audit.record(expediente.id, "EXPEDIENTE_CREATED", { object: input.object });
    await this.dependencies.events.publish({ type: "expediente.created", occurredAt: new Date(), payload: { id: expediente.id } });

    const persisted = this.dependencies.repository.get(expediente.id);
    if (!persisted) throw new Error("El expediente no pudo recuperarse del repositorio.");

    persisted.ruleEvaluation = await this.dependencies.rules.evaluate({ facts: { ...persisted.input } });
    if (!persisted.ruleEvaluation.valid) {
      throw new Error(`Validación técnica fallida: ${persisted.ruleEvaluation.errors.join("; ")}`);
    }
    persisted.status = "ANALYZED";
    this.dependencies.audit.record(persisted.id, "RULES_EVALUATED", { ruleIds: persisted.ruleEvaluation.ruleIds });

    const cpv = await this.dependencies.cpv.propose(persisted.input.object);
    persisted.cpvProposal = cpv[0];
    if (!persisted.cpvProposal) throw new Error("El adaptador CPV no devolvió una propuesta.");

    persisted.procedureProposal = await this.dependencies.procedure.resolve({
      ...persisted.input,
      cpv: persisted.cpvProposal
    });
    persisted.status = "PROPOSED";

    persisted.decisions.push({
      kind: "CPV",
      proposal: persisted.cpvProposal,
      ruleIds: persisted.ruleEvaluation.ruleIds,
      sourceIds: ["LB3-TECHNICAL-FLOW"],
      justification: [persisted.cpvProposal.justification ?? "Propuesta CPV técnica LB-3"],
      requiresHumanValidation: true
    });
    persisted.decisions.push({
      kind: "PROCEDURE",
      proposal: persisted.procedureProposal.procedure,
      ruleIds: persisted.ruleEvaluation.ruleIds,
      sourceIds: persisted.procedureProposal.sourceIds,
      justification: persisted.procedureProposal.justification,
      requiresHumanValidation: true
    });

    persisted.status = "PENDING_HUMAN_VALIDATION";
    this.dependencies.audit.record(persisted.id, "PROPOSALS_CREATED", {
      cpv: persisted.cpvProposal.code,
      procedure: persisted.procedureProposal.procedure,
      status: persisted.status
    });

    persisted.document = await this.dependencies.documents.generate("MEMORIA_PRELIMINAR", {
      expedienteId: persisted.id,
      object: persisted.input.object,
      need: persisted.input.need,
      cpv: persisted.cpvProposal,
      procedure: persisted.procedureProposal
    });
    this.dependencies.audit.record(persisted.id, "DOCUMENT_GENERATED", { type: persisted.document.type });

    const jsonExport = await this.dependencies.exporter.export(persisted.document, "json");
    const htmlExport = await this.dependencies.exporter.export(persisted.document, "html");
    this.dependencies.audit.record(persisted.id, "DOCUMENT_EXPORTED", { formats: ["json", "html"] });

    this.dependencies.repository.save(persisted);

    return {
      expediente: persisted,
      json: String(jsonExport.data),
      html: String(htmlExport.data),
      audit: this.dependencies.audit.all()
    };
  }
}

export async function runVerticalDemo(): Promise<VerticalFlowResult> {
  const flow = new VerticalContractingFlow(createVerticalSliceDependencies());
  return flow.execute({
    object: "Servicio de apoyo tecnológico para la gestión de expedientes",
    need: "Disponer de un recorrido técnico verificable para Contrata-IA",
    estimatedValue: 1000
  });
}
