import { AdministrativeDocumentRenderer } from "../../documents/lb5/AdministrativeDocumentRenderer";
import { LB5DocumentComposer } from "../../documents/lb5/LB5DocumentComposer";
import { SimpleDocumentRequestInterpreter } from "../../documents/lb5/SimpleDocumentRequest";
import type { LB5RenderedPackage } from "../../documents/lb5/DocumentModel";
import { LB6IntakeEngine } from "./IntakeEngine";
import type { IntakeCase, IntakeMode, IntakeProgress, IntakeQuestionId, IntakeReview } from "./IntakeModel";
import { createQuestionnaireDocx, parseQuestionnaireDocx } from "./QuestionnaireDocx";

export interface GeneratedQuestionnaire {
  readonly fileName: string;
  readonly mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  readonly data: Uint8Array;
}

export class LB6Orchestrator {
  private readonly intake = new LB6IntakeEngine();
  private readonly cases = new Map<string, IntakeCase>();

  public createCase(mode: IntakeMode = "GUIDED", id?: string): IntakeCase {
    const value = this.intake.create(mode, id);
    this.cases.set(value.id, value);
    return value;
  }

  public getCase(id: string): IntakeCase {
    const value = this.cases.get(id);
    if (!value) throw new Error(`Expediente no encontrado: ${id}`);
    return value;
  }

  public answer(id: string, questionId: IntakeQuestionId, value: unknown): IntakeCase {
    const updated = this.intake.answer(this.getCase(id), questionId, value, "USER_GUIDED");
    this.cases.set(id, updated);
    return updated;
  }

  public progress(id: string): IntakeProgress { return this.intake.progress(this.getCase(id)); }
  public review(id: string): IntakeReview { return this.intake.review(this.getCase(id)); }

  public validate(id: string, validatedBy: string): IntakeCase {
    const updated = this.intake.validate(this.getCase(id), validatedBy);
    this.cases.set(id, updated);
    return updated;
  }

  public questionnaire(id?: string): GeneratedQuestionnaire {
    const caseValue = id ? this.getCase(id) : undefined;
    return { fileName: id ? `Ficha_Datos_${id.replace(/[^A-Za-z0-9_-]/g, "_")}.docx` : "Ficha_Datos_Expediente.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", data: createQuestionnaireDocx(caseValue) };
  }

  public importQuestionnaire(data: Uint8Array, caseId?: string): { caseValue: IntakeCase; progress: IntakeProgress; imported: readonly string[] } {
    const parsed = parseQuestionnaireDocx(data);
    const base = caseId ? this.getCase(caseId) : this.createCase("QUESTIONNAIRE");
    const modeBase: IntakeCase = caseId ? { ...base, mode: "HYBRID" } : base;
    const updated = this.intake.applyAnswers(modeBase, parsed, "QUESTIONNAIRE_IMPORT");
    this.cases.set(updated.id, updated);
    return { caseValue: updated, progress: this.intake.progress(updated), imported: Object.keys(parsed) };
  }

  public generate(id: string): LB5RenderedPackage {
    const prepared = this.intake.toLB5Context(this.getCase(id));
    const customDocuments = prepared.additionalDocumentInstruction
      ? [new SimpleDocumentRequestInterpreter().interpret(prepared.additionalDocumentInstruction)]
      : undefined;
    const packageValue = new LB5DocumentComposer().compose(prepared.context, {
      needPlacement: prepared.needPlacement,
      insufficiencyPlacement: prepared.insufficiencyPlacement,
      customDocuments
    });
    return new AdministrativeDocumentRenderer().render(packageValue);
  }
}
