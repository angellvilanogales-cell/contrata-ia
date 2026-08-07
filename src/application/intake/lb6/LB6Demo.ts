import fs from "node:fs";
import path from "node:path";
import { LB6Orchestrator } from "./LB6Orchestrator";
import type { IntakeQuestionId } from "./IntakeModel";

const SAMPLE: Readonly<Partial<Record<IntakeQuestionId, unknown>>> = {
  contractingAuthority: "Servicio Andaluz de Empleo",
  promotingUnit: "Unidad promotora de servicios generales",
  object: "Servicio de limpieza de edificios y oficinas administrativas del Servicio Andaluz de Empleo",
  need: "Mantener las dependencias administrativas en condiciones adecuadas de higiene, salubridad, seguridad y uso durante su apertura y funcionamiento ordinario.",
  estimatedValue: 120000,
  durationMonths: 24,
  judgmentValuePercent: 20,
  allAwardCriteriaFormulaBased: false,
  lotAssessment: "UNASSESSED",
  subrogationObligation: "UNKNOWN",
  publicBodyTransfersPersonalDataToContractor: false,
  budgetBaseVatIncluded: 145200,
  vatRatePercent: 21,
  insufficiencyOfMeans: "La unidad promotora declara que no dispone de plantilla propia suficiente ni de medios materiales especializados para ejecutar de forma continuada las prestaciones. Esta declaración requiere confirmación por la unidad competente.",
  buildingsDescription: "Edificios y oficinas incluidos en el inventario técnico definitivo del expediente.",
  serviceHours: "Horarios compatibles con la apertura y atención al público.",
  minimumTasks: ["Limpieza de zonas de trabajo, aseos y zonas comunes", "Limpieza periódica de cristales y elementos de frecuencia no diaria", "Retirada selectiva de residuos"],
  qualityIndicators: ["Registro y cierre de incidencias", "Control verificable de frecuencias", "Seguimiento de no conformidades"],
  productsRequirements: ["Productos conformes con normativa sectorial y condiciones ambientales del PPT"],
  needPlacement: "IN_MEMORY",
  insufficiencyPlacement: "IN_MEMORY",
  additionalDocumentInstruction: "Genera un informe justificativo del procedimiento de adjudicación"
};

export function runLB6Demo() {
  const orchestrator = new LB6Orchestrator();
  let caseValue = orchestrator.createCase("GUIDED", "CONTR-LB6-0001");
  for (const [questionId, value] of Object.entries(SAMPLE)) {
    caseValue = orchestrator.answer(caseValue.id, questionId as IntakeQuestionId, value);
  }
  const review = orchestrator.review(caseValue.id);
  caseValue = orchestrator.validate(caseValue.id, "Persona tramitadora de demostración");
  const rendered = orchestrator.generate(caseValue.id);
  return { orchestrator, caseValue, review, rendered };
}

export function writeLB6DemoArtifacts(outputDirectory: string): void {
  const { orchestrator, caseValue, review, rendered } = runLB6Demo();
  fs.mkdirSync(outputDirectory, { recursive: true });
  const questionnaire = orchestrator.questionnaire(caseValue.id);
  fs.writeFileSync(path.join(outputDirectory, questionnaire.fileName), Buffer.from(questionnaire.data));
  for (const artifact of [...rendered.editable, ...rendered.pdf]) fs.writeFileSync(path.join(outputDirectory, artifact.fileName), Buffer.from(artifact.data));
  fs.writeFileSync(path.join(outputDirectory, "lb6-manifest.json"), JSON.stringify({
    expedienteId: caseValue.id,
    mode: caseValue.mode,
    validated: caseValue.validation.validated,
    validatedBy: caseValue.validation.validatedBy,
    reviewFingerprint: review.fingerprint,
    documents: rendered.package.documents.map(document => ({ id: document.id, kind: document.kind, valid: document.validation.valid })),
    coherenceFingerprint: rendered.package.coherenceFingerprint
  }, null, 2));
}
