import { AdministrativeDocumentRenderer } from "../../documents/lb5/AdministrativeDocumentRenderer";
import { LB5DocumentComposer } from "../../documents/lb5/LB5DocumentComposer";
import { SimpleDocumentRequestInterpreter } from "../../documents/lb5/SimpleDocumentRequest";
import type { LB5RenderedPackage } from "../../documents/lb5/DocumentModel";
import type { IntakeCaseRepository, SecurityAuditPort } from "../../operations/lb7/OperationalPorts";
import { NULL_AUDIT_PORT } from "../../operations/lb7/OperationalPorts";
import { LB6IntakeEngine } from "./IntakeEngine";
import type { IntakeCase, IntakeMode, IntakeProgress, IntakeQuestionId, IntakeReview } from "./IntakeModel";
import { createQuestionnaireDocx, parseQuestionnaireDocx } from "./QuestionnaireDocx";

export interface GeneratedQuestionnaire {
  readonly fileName: string;
  readonly mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  readonly data: Uint8Array;
}

export interface LB6OrchestratorOptions {
  readonly repository?: IntakeCaseRepository;
  readonly audit?: SecurityAuditPort;
}

export class LB6Orchestrator {
  private readonly intake = new LB6IntakeEngine();
  private readonly cases = new Map<string, IntakeCase>();
  private readonly repository?: IntakeCaseRepository;
  private readonly audit: SecurityAuditPort;

  public constructor(options: LB6OrchestratorOptions = {}) {
    this.repository = options.repository;
    this.audit = options.audit ?? NULL_AUDIT_PORT;
    for (const caseValue of this.repository?.loadAll() ?? []) this.cases.set(caseValue.id, caseValue);
  }

  private persist(caseValue: IntakeCase): void {
    this.cases.set(caseValue.id, caseValue);
    this.repository?.save(caseValue);
  }

  private record(actor: string, action: string, outcome: "SUCCESS" | "DENIED" | "ERROR", caseValue?: IntakeCase, detail?: string): void {
    this.audit.record({
      timestamp: new Date().toISOString(), actor, action, outcome,
      caseId: caseValue?.id, revision: caseValue?.revision, detail
    });
  }

  public createCase(mode: IntakeMode = "GUIDED", id?: string, actor = "SYSTEM"): IntakeCase {
    const value = this.intake.create(mode, id);
    this.persist(value);
    this.record(actor, "CASE_CREATED", "SUCCESS", value, `mode=${mode}`);
    return value;
  }

  public getCase(id: string): IntakeCase {
    const value = this.cases.get(id);
    if (!value) throw new Error(`Expediente no encontrado: ${id}`);
    return value;
  }

  public answer(id: string, questionId: IntakeQuestionId, value: unknown, actor = "USER"): IntakeCase {
    const updated = this.intake.answer(this.getCase(id), questionId, value, "USER_GUIDED");
    this.persist(updated);
    this.record(actor, "ANSWER_RECORDED", "SUCCESS", updated, `question=${questionId}`);
    return updated;
  }

  public progress(id: string): IntakeProgress { return this.intake.progress(this.getCase(id)); }
  public review(id: string): IntakeReview { return this.intake.review(this.getCase(id)); }

  public validate(id: string, validatedBy: string): IntakeCase {
    try {
      const updated = this.intake.validate(this.getCase(id), validatedBy);
      this.persist(updated);
      this.record(validatedBy || "UNKNOWN", "CASE_VALIDATED", "SUCCESS", updated);
      return updated;
    } catch (error) {
      this.record(validatedBy || "UNKNOWN", "CASE_VALIDATED", "DENIED", this.cases.get(id), error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  public questionnaire(id?: string): GeneratedQuestionnaire {
    const caseValue = id ? this.getCase(id) : undefined;
    return {
      fileName: id ? `Ficha_Datos_${id.replace(/[^A-Za-z0-9_-]/g, "_")}.docx` : "Ficha_Datos_Expediente.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      data: createQuestionnaireDocx(caseValue)
    };
  }

  public importQuestionnaire(data: Uint8Array, caseId?: string, actor = "USER"): { caseValue: IntakeCase; progress: IntakeProgress; imported: readonly string[] } {
    const parsed = parseQuestionnaireDocx(data);
    const base = caseId ? this.getCase(caseId) : this.createCase("QUESTIONNAIRE", undefined, actor);
    const modeBase: IntakeCase = caseId ? { ...base, mode: "HYBRID" } : base;
    const updated = this.intake.applyAnswers(modeBase, parsed, "QUESTIONNAIRE_IMPORT");
    this.persist(updated);
    this.record(actor, "QUESTIONNAIRE_IMPORTED", "SUCCESS", updated, `answers=${Object.keys(parsed).length}`);
    return { caseValue: updated, progress: this.intake.progress(updated), imported: Object.keys(parsed) };
  }

  public generate(id: string, actor = "USER"): LB5RenderedPackage {
    try {
      const caseValue = this.getCase(id);
      const prepared = this.intake.toLB5Context(caseValue);
      const customDocuments = prepared.additionalDocumentInstruction
        ? [new SimpleDocumentRequestInterpreter().interpret(prepared.additionalDocumentInstruction)]
        : undefined;
      const packageValue = new LB5DocumentComposer().compose(prepared.context, {
        needPlacement: prepared.needPlacement,
        insufficiencyPlacement: prepared.insufficiencyPlacement,
        customDocuments
      });
      const rendered = new AdministrativeDocumentRenderer().render(packageValue);
      this.record(actor, "DOCUMENT_PACKAGE_GENERATED", "SUCCESS", caseValue, `documents=${rendered.package.documents.length}`);
      return rendered;
    } catch (error) {
      this.record(actor, "DOCUMENT_PACKAGE_GENERATED", "DENIED", this.cases.get(id), error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  public backup(actor = "SYSTEM"): string | undefined {
    const location = this.repository?.backup?.();
    this.record(actor, "PERSISTENCE_BACKUP", location ? "SUCCESS" : "DENIED", undefined, location ?? "repository has no backup capability");
    return location;
  }
}
