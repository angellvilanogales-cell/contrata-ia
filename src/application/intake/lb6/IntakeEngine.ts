import { createHash, randomUUID } from "node:crypto";
import type { BlockPlacement, LB5DocumentContext } from "../../documents/lb5/DocumentModel";
import { LB4CleaningServiceEngine } from "../../normative/LB4CleaningServiceEngine";
import type {
  IntakeAnswer,
  IntakeAnswerSource,
  IntakeCase,
  IntakeMode,
  IntakeProgress,
  IntakeQuestion,
  IntakeQuestionId,
  IntakeReview
} from "./IntakeModel";

const LCSP = "LCSP-2017-CONSOLIDADA-2026";
const SAE = "SAE-GUIA-OPERATIVA-CONTRATACION";
const JA_MODELS = "JA-MODELOS-PCAP";

export const LB6_QUESTIONS: readonly IntakeQuestion[] = [
  { id: "contractingAuthority", section: "Identificación", label: "Órgano/entidad contratante", help: "Indique la entidad que tramita el contrato.", requirement: "REQUIRED", answerType: "TEXT", legalSourceIds: [LCSP] },
  { id: "promotingUnit", section: "Identificación", label: "Unidad promotora", help: "Unidad que formula la necesidad y aporta los hechos técnicos.", requirement: "REQUIRED", answerType: "TEXT", legalSourceIds: [SAE] },
  { id: "object", section: "Necesidad y objeto", label: "Objeto del contrato", help: "Describa de forma concreta la prestación que se pretende contratar.", requirement: "REQUIRED", answerType: "TEXT", legalSourceIds: [LCSP] },
  { id: "need", section: "Necesidad y objeto", label: "Necesidad e idoneidad", help: "Explique qué necesidad pública se satisface y por qué el contrato es idóneo.", requirement: "REQUIRED", answerType: "TEXT", legalSourceIds: [LCSP] },
  { id: "estimatedValue", section: "Economía", label: "Valor estimado sin IVA", help: "Importe total calculado conforme a la LCSP, incluidas opciones y prórrogas cuando proceda.", requirement: "REQUIRED", answerType: "MONEY", legalSourceIds: [LCSP] },
  { id: "durationMonths", section: "Economía", label: "Duración total prevista en meses", help: "Duración usada para el cálculo y la planificación del contrato.", requirement: "REQUIRED", answerType: "NUMBER", legalSourceIds: [LCSP] },
  { id: "judgmentValuePercent", section: "Adjudicación", label: "Porcentaje de criterios sujetos a juicio de valor", help: "Indique 0 si todos son automáticos.", requirement: "REQUIRED", answerType: "NUMBER", legalSourceIds: [LCSP] },
  { id: "allAwardCriteriaFormulaBased", section: "Adjudicación", label: "¿Todos los criterios son evaluables mediante fórmulas?", help: "Dato necesario para valorar el simplificado abreviado.", requirement: "REQUIRED", answerType: "BOOLEAN", legalSourceIds: [LCSP] },
  { id: "lotAssessment", section: "Lotes", label: "Criterio inicial sobre lotes", help: "Elija dividir, proponer no división por coordinación técnica declarada o dejar pendiente de análisis.", requirement: "SYSTEM_CAN_PROPOSE", answerType: "CHOICE", choices: ["DIVIDE", "NO_DIVIDE_TECHNICAL_COORDINATION", "UNASSESSED"], legalSourceIds: [LCSP] },
  { id: "lotsMotivation", section: "Lotes", label: "Motivación fáctica sobre lotes", help: "Solo cumplimente si dispone de hechos concretos; el sistema no inventará esta motivación.", requirement: "CONDITIONAL", answerType: "TEXT", legalSourceIds: [LCSP] },
  { id: "subrogationObligation", section: "Personal", label: "¿Existe obligación de subrogación aplicable?", help: "Debe derivar de norma, convenio o acuerdo colectivo aplicable.", requirement: "SYSTEM_CAN_PROPOSE", answerType: "CHOICE", choices: ["APPLIES", "DOES_NOT_APPLY", "UNKNOWN"], legalSourceIds: [LCSP] },
  { id: "publicBodyTransfersPersonalDataToContractor", section: "Protección de datos", label: "¿La entidad pública cederá datos personales al contratista?", help: "Activa las condiciones específicas de protección de datos cuando proceda.", requirement: "REQUIRED", answerType: "BOOLEAN", legalSourceIds: [LCSP] },
  { id: "budgetBaseVatIncluded", section: "Economía", label: "Presupuesto base de licitación con IVA", help: "Importe máximo de gasto previsto con IVA.", requirement: "REQUIRED", answerType: "MONEY", legalSourceIds: [LCSP] },
  { id: "vatRatePercent", section: "Economía", label: "Tipo de IVA aplicable (%)", help: "Indique el porcentaje aplicable a la prestación.", requirement: "REQUIRED", answerType: "NUMBER", legalSourceIds: [LCSP] },
  { id: "insufficiencyOfMeans", section: "Justificación", label: "Insuficiencia de medios propios", help: "En servicios, describa los hechos que justifican que la Administración no pueda atender la prestación con medios propios. No se admite texto inventado por el sistema.", requirement: "REQUIRED", answerType: "TEXT", legalSourceIds: [LCSP, SAE] },
  { id: "buildingsDescription", section: "PPT", label: "Ámbito material / edificios", help: "Descripción de centros, superficies o alcance técnico disponible.", requirement: "REQUIRED", answerType: "TEXT", legalSourceIds: [JA_MODELS] },
  { id: "serviceHours", section: "PPT", label: "Horarios o ventanas de prestación", help: "Puede dejarse vacío si todavía no está determinado.", requirement: "OPTIONAL", answerType: "TEXT", legalSourceIds: [JA_MODELS] },
  { id: "minimumTasks", section: "PPT", label: "Prestaciones/tareas mínimas", help: "Una por línea en la ficha.", requirement: "REQUIRED", answerType: "LIST", legalSourceIds: [JA_MODELS] },
  { id: "qualityIndicators", section: "PPT", label: "Indicadores de calidad y control", help: "Una condición verificable por línea.", requirement: "REQUIRED", answerType: "LIST", legalSourceIds: [JA_MODELS] },
  { id: "productsRequirements", section: "PPT", label: "Requisitos de productos o materiales", help: "Una condición por línea; evite marcas salvo justificación legal.", requirement: "OPTIONAL", answerType: "LIST", legalSourceIds: [JA_MODELS] },
  { id: "needPlacement", section: "Composición documental", label: "Ubicación de Necesidad e Idoneidad", help: "Puede integrarse en Memoria o generarse como informe independiente.", requirement: "REQUIRED", answerType: "CHOICE", choices: ["IN_MEMORY", "STANDALONE"], legalSourceIds: [LCSP, SAE] },
  { id: "insufficiencyPlacement", section: "Composición documental", label: "Ubicación de Insuficiencia de Medios", help: "Puede integrarse en Memoria o generarse como informe independiente.", requirement: "REQUIRED", answerType: "CHOICE", choices: ["IN_MEMORY", "STANDALONE"], legalSourceIds: [LCSP, SAE] },
  { id: "additionalDocumentInstruction", section: "Composición documental", label: "Documento adicional solicitado", help: "Opcional. Ej.: informe justificativo de no división en lotes y procedimiento.", requirement: "OPTIONAL", answerType: "TEXT", legalSourceIds: [SAE] }
];

const QUESTION_MAP = new Map(LB6_QUESTIONS.map(question => [question.id, question] as const));

function isoNow(): string { return new Date().toISOString(); }
function valueOf(caseValue: IntakeCase, id: IntakeQuestionId): unknown { return caseValue.answers[id]?.value; }
function text(caseValue: IntakeCase, id: IntakeQuestionId): string { const v = valueOf(caseValue, id); return typeof v === "string" ? v.trim() : ""; }
function num(caseValue: IntakeCase, id: IntakeQuestionId): number | undefined { const v = valueOf(caseValue, id); return typeof v === "number" && Number.isFinite(v) ? v : undefined; }
function bool(caseValue: IntakeCase, id: IntakeQuestionId): boolean | undefined { const v = valueOf(caseValue, id); return typeof v === "boolean" ? v : undefined; }
function list(caseValue: IntakeCase, id: IntakeQuestionId): readonly string[] { const v = valueOf(caseValue, id); return Array.isArray(v) ? v.map(String).map(x => x.trim()).filter(Boolean) : []; }

function requiredFor(caseValue: IntakeCase, id: IntakeQuestionId): boolean {
  if (id === "lotsMotivation") return valueOf(caseValue, "lotAssessment") === "NO_DIVIDE_TECHNICAL_COORDINATION";
  const question = QUESTION_MAP.get(id);
  return question?.requirement === "REQUIRED";
}

function normalize(question: IntakeQuestion, raw: unknown): string | number | boolean | readonly string[] {
  if (question.answerType === "BOOLEAN") {
    if (typeof raw === "boolean") return raw;
    const s = String(raw).trim().toLowerCase();
    if (["sí", "si", "true", "1", "yes"].includes(s)) return true;
    if (["no", "false", "0"].includes(s)) return false;
    throw new Error(`${question.label}: se esperaba Sí/No.`);
  }
  if (question.answerType === "NUMBER" || question.answerType === "MONEY") {
    const normalized = typeof raw === "number" ? raw : Number(String(raw).trim().replaceAll(".", "").replace(",", "."));
    if (!Number.isFinite(normalized)) throw new Error(`${question.label}: se esperaba un número.`);
    return normalized;
  }
  if (question.answerType === "LIST") {
    const values = Array.isArray(raw) ? raw.map(String) : String(raw).split(/\r?\n|;/g);
    const clean = values.map(value => value.trim()).filter(Boolean);
    if (clean.length === 0) throw new Error(`${question.label}: indique al menos un elemento.`);
    return clean;
  }
  const value = String(raw ?? "").trim();
  if (!value) throw new Error(`${question.label}: respuesta vacía.`);
  if (question.answerType === "CHOICE" && question.choices && !question.choices.includes(value)) {
    throw new Error(`${question.label}: valor no admitido (${value}).`);
  }
  return value;
}

export class LB6IntakeEngine {
  public create(mode: IntakeMode = "GUIDED", id = `EXP-${randomUUID()}`): IntakeCase {
    return { id, mode, createdAt: isoNow(), answers: {}, validation: { validated: false }, revision: 1 };
  }

  public answer(caseValue: IntakeCase, questionId: IntakeQuestionId, raw: unknown, source: IntakeAnswerSource = "USER_GUIDED"): IntakeCase {
    const question = QUESTION_MAP.get(questionId);
    if (!question) throw new Error(`Pregunta desconocida: ${questionId}`);
    const answer: IntakeAnswer = { questionId, value: normalize(question, raw), source, recordedAt: isoNow() };
    return { ...caseValue, answers: { ...caseValue.answers, [questionId]: answer }, validation: { validated: false }, revision: caseValue.revision + 1 };
  }

  public applyAnswers(caseValue: IntakeCase, answers: Readonly<Partial<Record<IntakeQuestionId, unknown>>>, source: IntakeAnswerSource): IntakeCase {
    let current = caseValue;
    for (const question of LB6_QUESTIONS) {
      const raw = answers[question.id];
      if (raw === undefined || raw === null || raw === "") continue;
      current = this.answer(current, question.id, raw, source);
    }
    return current;
  }

  public progress(caseValue: IntakeCase): IntakeProgress {
    const pending = LB6_QUESTIONS.filter(question => requiredFor(caseValue, question.id) && caseValue.answers[question.id] === undefined).map(q => q.id);
    const nextId = pending[0];
    const warnings: string[] = [];
    if (valueOf(caseValue, "lotAssessment") === "NO_DIVIDE_TECHNICAL_COORDINATION" && !text(caseValue, "lotsMotivation")) warnings.push("La no división propuesta requiere hechos concretos y motivación expresa.");
    if (valueOf(caseValue, "subrogationObligation") === "UNKNOWN") warnings.push("Debe verificarse la norma, convenio o acuerdo colectivo aplicable antes de cerrar la subrogación.");
    return {
      totalQuestions: LB6_QUESTIONS.length,
      answeredQuestions: Object.keys(caseValue.answers).length,
      requiredPending: pending,
      nextQuestion: nextId ? QUESTION_MAP.get(nextId) : undefined,
      canValidate: pending.length === 0,
      warnings
    };
  }

  public review(caseValue: IntakeCase): IntakeReview {
    const progress = this.progress(caseValue);
    if (!progress.canValidate) throw new Error(`Faltan respuestas obligatorias: ${progress.requiredPending.join(", ")}`);
    const plain = Object.fromEntries(Object.entries(caseValue.answers).map(([id, answer]) => [id, answer?.value]));
    const fingerprint = createHash("sha256").update(JSON.stringify(plain)).digest("hex");
    const proposals: string[] = [];
    if (!caseValue.answers.lotAssessment) proposals.push("Lotes: pendiente de análisis/validación humana.");
    if (!caseValue.answers.subrogationObligation) proposals.push("Subrogación: debe verificarse antes de cerrar el expediente.");
    return { caseId: caseValue.id, revision: caseValue.revision, answers: plain, proposals, warnings: progress.warnings, fingerprint, canGenerateAfterValidation: true };
  }

  public validate(caseValue: IntakeCase, validatedBy: string): IntakeCase {
    const review = this.review(caseValue);
    if (!validatedBy.trim()) throw new Error("Debe identificarse la validación humana.");
    return { ...caseValue, validation: { validated: true, validatedAt: isoNow(), validatedBy: validatedBy.trim(), fingerprint: review.fingerprint }, revision: caseValue.revision + 1 };
  }

  public toLB5Context(caseValue: IntakeCase): { context: LB5DocumentContext; needPlacement: BlockPlacement; insufficiencyPlacement: BlockPlacement; additionalDocumentInstruction?: string } {
    if (!caseValue.validation.validated) throw new Error("El expediente debe ser validado por una persona antes de generar documentos.");
    const currentFingerprint = this.review(caseValue).fingerprint;
    if (caseValue.validation.fingerprint !== currentFingerprint) throw new Error("El expediente cambió después de la validación humana; debe validarse de nuevo.");
    const estimatedValue = num(caseValue, "estimatedValue")!;
    const durationMonths = num(caseValue, "durationMonths")!;
    const judgmentValuePercent = num(caseValue, "judgmentValuePercent")!;
    const input = {
      object: text(caseValue, "object"), need: text(caseValue, "need"), estimatedValue, durationMonths, judgmentValuePercent,
      allAwardCriteriaFormulaBased: bool(caseValue, "allAwardCriteriaFormulaBased")!,
      lotAssessment: (valueOf(caseValue, "lotAssessment") ?? "UNASSESSED") as "DIVIDE" | "NO_DIVIDE_TECHNICAL_COORDINATION" | "UNASSESSED",
      subrogationObligation: (valueOf(caseValue, "subrogationObligation") ?? "UNKNOWN") as "APPLIES" | "DOES_NOT_APPLY" | "UNKNOWN",
      publicBodyTransfersPersonalDataToContractor: bool(caseValue, "publicBodyTransfersPersonalDataToContractor")!
    };
    const normativeDecision = new LB4CleaningServiceEngine().evaluate(input);
    const context: LB5DocumentContext = {
      expedienteId: caseValue.id,
      contractingAuthority: text(caseValue, "contractingAuthority"), promotingUnit: text(caseValue, "promotingUnit"), input, normativeDecision,
      budgetBaseVatIncluded: num(caseValue, "budgetBaseVatIncluded"), vatRatePercent: num(caseValue, "vatRatePercent"),
      insufficiencyOfMeans: text(caseValue, "insufficiencyOfMeans"), lotsMotivation: text(caseValue, "lotsMotivation") || undefined,
      technical: { buildingsDescription: text(caseValue, "buildingsDescription"), serviceHours: text(caseValue, "serviceHours") || undefined, minimumTasks: list(caseValue, "minimumTasks"), qualityIndicators: list(caseValue, "qualityIndicators"), productsRequirements: list(caseValue, "productsRequirements") },
      sources: [
        { id: LCSP, authority: "BOE", title: "Ley 9/2017, de Contratos del Sector Público, texto consolidado", locator: "https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902", effectiveContext: "Normativa vigente de referencia" },
        { id: JA_MODELS, authority: "Junta de Andalucía - Comisión Consultiva de Contratación Pública", title: "Modelos recomendados de pliegos y contratos", locator: "https://www.juntadeandalucia.es/temas/contratacion-publica/gestion/comision-consultiva/paginas/pliegos.html", effectiveContext: "Modelo administrativo de referencia; comprobar actualización aplicable" },
        { id: "JA-PCAP-LIMPIEZA-EJEMPLOS-USUARIO", authority: "Documentación administrativa aportada al proyecto", title: "PCAP, memorias y PPT de referencia", locator: "file-library", effectiveContext: "Patrón documental; no sustituye a la norma" },
        { id: SAE, authority: "Documentación operativa SAE aportada al proyecto", title: "Guía Operativa de Tramitación de Expedientes de Contratación", locator: "file-library", effectiveContext: "Flujo y composición documental" }
      ]
    };
    return {
      context,
      needPlacement: valueOf(caseValue, "needPlacement") as BlockPlacement,
      insufficiencyPlacement: valueOf(caseValue, "insufficiencyPlacement") as BlockPlacement,
      additionalDocumentInstruction: text(caseValue, "additionalDocumentInstruction") || undefined
    };
  }
}
