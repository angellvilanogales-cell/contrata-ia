import { describe, expect, it } from "vitest";
import { LB6IntakeEngine } from "../src/application/intake/lb6/IntakeEngine";
import { LB6Orchestrator } from "../src/application/intake/lb6/LB6Orchestrator";
import type { IntakeQuestionId } from "../src/application/intake/lb6/IntakeModel";

const COMPLETE: Readonly<Partial<Record<IntakeQuestionId, unknown>>> = {
  contractingAuthority: "Servicio Andaluz de Empleo",
  promotingUnit: "Unidad promotora",
  object: "Servicio de limpieza de edificios y oficinas administrativas",
  need: "Mantener los centros administrativos en condiciones adecuadas de higiene y salubridad.",
  estimatedValue: 120000,
  durationMonths: 24,
  judgmentValuePercent: 20,
  allAwardCriteriaFormulaBased: false,
  lotAssessment: "UNASSESSED",
  subrogationObligation: "UNKNOWN",
  publicBodyTransfersPersonalDataToContractor: false,
  budgetBaseVatIncluded: 145200,
  vatRatePercent: 21,
  insufficiencyOfMeans: "La unidad declara insuficiencia de plantilla y medios especializados para prestar el servicio con continuidad.",
  buildingsDescription: "Centros incluidos en el inventario técnico del expediente.",
  minimumTasks: ["Limpieza ordinaria", "Retirada selectiva de residuos"],
  qualityIndicators: ["Registro de incidencias", "Control de frecuencias"],
  needPlacement: "IN_MEMORY",
  insufficiencyPlacement: "IN_MEMORY"
};

function fill(orchestrator: LB6Orchestrator, id: string): void {
  for (const [questionId, value] of Object.entries(COMPLETE)) orchestrator.answer(id, questionId as IntakeQuestionId, value);
}

describe("LB-6 dual intake", () => {
  it("asks only the next required question in guided mode", () => {
    const engine = new LB6IntakeEngine();
    let value = engine.create("GUIDED", "T-1");
    expect(engine.progress(value).nextQuestion?.id).toBe("contractingAuthority");
    value = engine.answer(value, "contractingAuthority", "Servicio Andaluz de Empleo");
    expect(engine.progress(value).nextQuestion?.id).toBe("promotingUnit");
  });

  it("exposes every possible question in the questionnaire while guided mode remains minimal", () => {
    const orchestrator = new LB6Orchestrator();
    const questionnaire = orchestrator.questionnaire();
    const text = Buffer.from(questionnaire.data).toString("utf8");
    expect(text).toContain("[[Q:contractingAuthority]]");
    expect(text).toContain("[[Q:additionalDocumentInstruction]]");
    expect(text).toContain("PUEDE PROPONER CONTRATA-IA");
  });

  it("round-trips answers through the editable DOCX questionnaire", () => {
    const source = new LB6Orchestrator();
    const sourceCase = source.createCase("GUIDED", "SOURCE");
    source.answer(sourceCase.id, "contractingAuthority", "Servicio Andaluz de Empleo");
    source.answer(sourceCase.id, "object", "Servicio de limpieza de oficinas");
    const docx = source.questionnaire(sourceCase.id);
    const target = new LB6Orchestrator();
    const imported = target.importQuestionnaire(docx.data);
    expect(imported.caseValue.mode).toBe("QUESTIONNAIRE");
    expect(imported.caseValue.answers.contractingAuthority?.value).toBe("Servicio Andaluz de Empleo");
    expect(imported.caseValue.answers.object?.value).toBe("Servicio de limpieza de oficinas");
  });

  it("continues as hybrid when a questionnaire is imported into an existing case", () => {
    const orchestrator = new LB6Orchestrator();
    const original = orchestrator.createCase("GUIDED", "HYBRID-1");
    orchestrator.answer(original.id, "contractingAuthority", "Servicio Andaluz de Empleo");
    const docx = orchestrator.questionnaire(original.id);
    const imported = orchestrator.importQuestionnaire(docx.data, original.id);
    expect(imported.caseValue.mode).toBe("HYBRID");
    expect(imported.progress.nextQuestion?.id).toBe("promotingUnit");
  });

  it("does not require a standalone need report when need is integrated in the memory", () => {
    const orchestrator = new LB6Orchestrator();
    const caseValue = orchestrator.createCase("GUIDED", "DOC-1");
    fill(orchestrator, caseValue.id);
    expect(orchestrator.getCase(caseValue.id).answers.needPlacement?.value).toBe("IN_MEMORY");
  });

  it("blocks validation while mandatory answers are missing", () => {
    const orchestrator = new LB6Orchestrator();
    const caseValue = orchestrator.createCase("GUIDED", "BLOCK-1");
    expect(() => orchestrator.review(caseValue.id)).toThrow(/Faltan respuestas obligatorias/);
  });

  it("blocks document generation until explicit human validation", () => {
    const orchestrator = new LB6Orchestrator();
    const caseValue = orchestrator.createCase("GUIDED", "BLOCK-2");
    fill(orchestrator, caseValue.id);
    expect(() => orchestrator.generate(caseValue.id)).toThrow(/validado por una persona/);
  });

  it("invalidates prior human validation when any answer changes", () => {
    const orchestrator = new LB6Orchestrator();
    const caseValue = orchestrator.createCase("GUIDED", "REVAL-1");
    fill(orchestrator, caseValue.id);
    orchestrator.validate(caseValue.id, "Persona tramitadora");
    expect(orchestrator.getCase(caseValue.id).validation.validated).toBe(true);
    orchestrator.answer(caseValue.id, "serviceHours", "Nuevo horario");
    expect(orchestrator.getCase(caseValue.id).validation.validated).toBe(false);
  });

  it("generates the LB-5 package after human validation and preserves coherence", () => {
    const orchestrator = new LB6Orchestrator();
    const caseValue = orchestrator.createCase("GUIDED", "GEN-1");
    fill(orchestrator, caseValue.id);
    orchestrator.validate(caseValue.id, "Persona tramitadora");
    const rendered = orchestrator.generate(caseValue.id);
    const kinds = rendered.package.documents.map(document => document.kind);
    expect(kinds).toContain("MEMORIA_JUSTIFICATIVA");
    expect(kinds).toContain("PCAP");
    expect(kinds).toContain("PPT");
    expect(rendered.package.coherenceFingerprint.estimatedValue).toBe(120000);
  });

  it("keeps subrogation unresolved when the operator does not assert an applicable collective rule", () => {
    const orchestrator = new LB6Orchestrator();
    const caseValue = orchestrator.createCase("GUIDED", "SAFE-1");
    fill(orchestrator, caseValue.id);
    const review = orchestrator.review(caseValue.id);
    expect(review.warnings.some(warning => warning.includes("subrogación") || warning.includes("Subrogación"))).toBe(true);
  });
});
