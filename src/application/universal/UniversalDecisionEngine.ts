import { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";

export type UniversalDecisionStatus =
  | "PENDING_USER_DECISION"
  | "HUMAN_VALIDATED"
  | "USER_REJECTED_PROPOSAL"
  | "REQUIRES_CLARIFICATION"
  | "NOT_APPLICABLE";

export type UniversalDecisionRisk = "LOW" | "MEDIUM" | "HIGH";
export type UniversalDecisionSourceKind = "USER_INPUT" | "LEGAL_RULE" | "OFFICIAL_MODEL" | "CASE_EVIDENCE" | "CALCULATED" | "DERIVED";

export interface UniversalLegalBasis {
  sourceId: string;
  citation: string;
  rule: string;
  application: string;
  authority: "A" | "B" | "C" | "D" | "E";
}

export interface UniversalDecisionDefinition {
  id: string;
  family: UniversalTargetContractType | "COMMON";
  section: string;
  field: string;
  question: string;
  explanation: string;
  legalBasis: readonly UniversalLegalBasis[];
  risk: UniversalDecisionRisk;
  applicability?: (answers: Readonly<Record<string, unknown>>) => boolean;
}

export interface UniversalDecisionRecord {
  definition: UniversalDecisionDefinition;
  currentValue?: unknown;
  suggestedValue?: unknown;
  sourceKind?: UniversalDecisionSourceKind;
  status: UniversalDecisionStatus;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
}

export interface UniversalDecisionSession {
  contractType: UniversalTargetContractType;
  answers: Readonly<Record<string, unknown>>;
  decisions: readonly UniversalDecisionRecord[];
}

const LCSP = "Ley 9/2017, de 8 de noviembre, de Contratos del Sector Público";

const COMMON: readonly UniversalDecisionDefinition[] = [
  {
    id: "common:object",
    family: "COMMON",
    section: "IDENTIFICACION",
    field: "object",
    question: "¿Cuál es el objeto del contrato?",
    explanation: "El objeto debe quedar definido de forma determinada y coherente con la necesidad administrativa y con los documentos del expediente.",
    legalBasis: [{ sourceId: "LCSP-99", citation: `${LCSP}, art. 99`, rule: "El objeto del contrato debe ser determinado.", application: "La descripción validada alimentará de forma canónica Memoria, PCAP y PPT.", authority: "A" }],
    risk: "HIGH",
  },
  {
    id: "common:cpv",
    family: "COMMON",
    section: "IDENTIFICACION",
    field: "cpv",
    question: "¿Qué código CPV corresponde al objeto principal?",
    explanation: "El código CPV debe corresponder materialmente a la prestación principal y no sustituye la definición del objeto.",
    legalBasis: [{ sourceId: "CPV", citation: "Reglamento (CE) n.º 2195/2002 y normativa de contratación aplicable", rule: "Los contratos se identifican mediante la nomenclatura CPV.", application: "El código validado se utilizará de forma idéntica en los documentos generados.", authority: "A" }],
    risk: "MEDIUM",
  },
  {
    id: "common:lots",
    family: "COMMON",
    section: "LOTES",
    field: "dividedIntoLots",
    question: "¿Se divide el contrato en lotes?",
    explanation: "La decisión sobre lotes requiere valoración expresa; si no se divide, la motivación debe quedar documentada.",
    legalBasis: [{ sourceId: "LCSP-99.3", citation: `${LCSP}, art. 99.3`, rule: "Siempre que la naturaleza o el objeto lo permitan debe preverse la realización independiente por lotes, salvo motivos válidos debidamente justificados.", application: "La respuesta activa, en su caso, la pregunta de justificación de no división.", authority: "A" }],
    risk: "HIGH",
  },
  {
    id: "common:no-lots-justification",
    family: "COMMON",
    section: "LOTES",
    field: "noLotsJustification",
    question: "Indique la justificación de la no división en lotes.",
    explanation: "No se generará automáticamente una justificación jurídica de no división.",
    legalBasis: [{ sourceId: "LCSP-99.3", citation: `${LCSP}, art. 99.3`, rule: "La no división debe apoyarse en motivos válidos que consten en el expediente.", application: "La persona debe validar la motivación concreta del expediente.", authority: "A" }],
    risk: "HIGH",
    applicability: answers => answers.dividedIntoLots === false,
  },
];

const SUPPLY: readonly UniversalDecisionDefinition[] = [
  {
    id: "supply:delivery-mode",
    family: "SUPPLY",
    section: "NECESIDAD",
    field: "deliveryMode",
    question: "¿El suministro es una adquisición cerrada o se ejecutará mediante entregas sucesivas según necesidades?",
    explanation: "Esta decisión condiciona la construcción económica y el régimen de cantidades estimadas/presupuesto máximo.",
    legalBasis: [{ sourceId: "LCSP-DA33", citation: `${LCSP}, disposición adicional 33.ª`, rule: "En determinados suministros y servicios por necesidades puede aprobarse un presupuesto máximo sin obligación de agotar unidades.", application: "Solo se aplicará el régimen por necesidades cuando la persona lo valide expresamente.", authority: "A" }],
    risk: "HIGH",
  },
  {
    id: "supply:pbl",
    family: "SUPPLY",
    section: "ECONOMIA",
    field: "baseTenderBudgetExVatCents",
    question: "¿Cuál es el presupuesto base de licitación sin IVA?",
    explanation: "Debe introducirse la magnitud aprobada para el expediente, separada del valor estimado.",
    legalBasis: [{ sourceId: "LCSP-100", citation: `${LCSP}, art. 100`, rule: "El presupuesto base de licitación constituye el límite máximo de gasto que puede comprometer el órgano de contratación, incluido IVA salvo disposición en contrario.", application: "El aplicativo conservará por separado base imponible, IVA y total.", authority: "A" }],
    risk: "HIGH",
  },
  {
    id: "supply:estimated-value",
    family: "SUPPLY",
    section: "ECONOMIA",
    field: "estimatedValueExVatCents",
    question: "¿Cuál es el valor estimado del contrato sin IVA?",
    explanation: "El valor estimado es una magnitud jurídica distinta del presupuesto base y debe incluir los conceptos legalmente computables.",
    legalBasis: [{ sourceId: "LCSP-101", citation: `${LCSP}, art. 101`, rule: "El valor estimado se calcula sin IVA e incorpora las opciones y modificaciones previstas que deban computarse.", application: "La cifra validada no se sustituirá por una inferencia silenciosa desde el PBL.", authority: "A" }],
    risk: "HIGH",
  },
];

const SERVICE: readonly UniversalDecisionDefinition[] = [
  {
    id: "service:pbl",
    family: "SERVICE",
    section: "ECONOMIA",
    field: "baseTenderBudgetExVatCents",
    question: "¿Cuál es el presupuesto base de licitación sin IVA?",
    explanation: "La cifra debe corresponder a la prestación y al periodo contractual definido.",
    legalBasis: [{ sourceId: "LCSP-100", citation: `${LCSP}, art. 100`, rule: "El presupuesto base debe ser adecuado a precios de mercado y constituye el límite máximo de gasto.", application: "La persona valida la cifra que se proyectará en toda la tríada documental.", authority: "A" }],
    risk: "HIGH",
  },
  {
    id: "service:estimated-value",
    family: "SERVICE",
    section: "ECONOMIA",
    field: "estimatedValueExVatCents",
    question: "¿Cuál es el valor estimado del contrato sin IVA?",
    explanation: "Debe mantenerse separado del PBL e incorporar prórrogas, opciones y modificaciones computables cuando proceda.",
    legalBasis: [{ sourceId: "LCSP-101", citation: `${LCSP}, art. 101`, rule: "El valor estimado se determina conforme a la duración y opciones económicamente previsibles, sin IVA.", application: "La cifra validada será la única fuente canónica para Memoria y PCAP.", authority: "A" }],
    risk: "HIGH",
  },
];

function definitionsFor(contractType: UniversalTargetContractType): readonly UniversalDecisionDefinition[] {
  if (contractType === "SUPPLY") return [...COMMON, ...SUPPLY];
  if (contractType === "SERVICE") return [...COMMON, ...SERVICE];
  return COMMON;
}

function applicable(definition: UniversalDecisionDefinition, answers: Readonly<Record<string, unknown>>): boolean {
  return definition.applicability ? definition.applicability(answers) : true;
}

export class UniversalDecisionEngine {
  public start(contractType: UniversalTargetContractType): UniversalDecisionSession {
    const answers: Readonly<Record<string, unknown>> = {};
    return {
      contractType,
      answers,
      decisions: definitionsFor(contractType).map(definition => ({
        definition,
        status: applicable(definition, answers) ? "PENDING_USER_DECISION" : "NOT_APPLICABLE",
      })),
    };
  }

  public next(session: UniversalDecisionSession): UniversalDecisionRecord | undefined {
    return session.decisions.find(decision => decision.status === "PENDING_USER_DECISION" && applicable(decision.definition, session.answers));
  }

  public propose(session: UniversalDecisionSession, decisionId: string, suggestedValue: unknown, sourceKind: UniversalDecisionSourceKind): UniversalDecisionSession {
    return this.replace(session, decisionId, decision => ({ ...decision, suggestedValue, sourceKind }));
  }

  public validate(session: UniversalDecisionSession, decisionId: string, value: unknown, validatedBy: string, validatedAt = new Date().toISOString()): UniversalDecisionSession {
    if (!validatedBy.trim()) throw new Error("validatedBy es obligatorio para una validación humana.");
    const answers = { ...session.answers, [this.definition(session, decisionId).field]: value };
    const decisions = session.decisions.map(decision => {
      if (decision.definition.id === decisionId) {
        return { ...decision, currentValue: value, status: "HUMAN_VALIDATED" as const, validatedBy, validatedAt, rejectionReason: undefined };
      }
      const isApplicable = applicable(decision.definition, answers);
      if (!isApplicable && decision.status !== "HUMAN_VALIDATED") return { ...decision, status: "NOT_APPLICABLE" as const };
      if (isApplicable && decision.status === "NOT_APPLICABLE") return { ...decision, status: "PENDING_USER_DECISION" as const };
      return decision;
    });
    return { ...session, answers, decisions };
  }

  public rejectProposal(session: UniversalDecisionSession, decisionId: string, reason: string): UniversalDecisionSession {
    if (!reason.trim()) throw new Error("La motivación del rechazo es obligatoria.");
    return this.replace(session, decisionId, decision => ({ ...decision, status: "USER_REJECTED_PROPOSAL", rejectionReason: reason }));
  }

  public requireClarification(session: UniversalDecisionSession, decisionId: string): UniversalDecisionSession {
    return this.replace(session, decisionId, decision => ({ ...decision, status: "REQUIRES_CLARIFICATION" }));
  }

  public readyForGeneration(session: UniversalDecisionSession): boolean {
    return session.decisions
      .filter(decision => applicable(decision.definition, session.answers))
      .every(decision => decision.status === "HUMAN_VALIDATED");
  }

  private definition(session: UniversalDecisionSession, decisionId: string): UniversalDecisionDefinition {
    const definition = session.decisions.find(decision => decision.definition.id === decisionId)?.definition;
    if (!definition) throw new Error(`Decisión desconocida: ${decisionId}`);
    return definition;
  }

  private replace(session: UniversalDecisionSession, decisionId: string, transform: (decision: UniversalDecisionRecord) => UniversalDecisionRecord): UniversalDecisionSession {
    this.definition(session, decisionId);
    return { ...session, decisions: session.decisions.map(decision => decision.definition.id === decisionId ? transform(decision) : decision) };
  }
}
