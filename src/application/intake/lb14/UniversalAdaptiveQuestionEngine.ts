import { EvidenceField, isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";

export const BLOCK_14_ADAPTIVE_ENGINE_VERSION = "14.2.0" as const;

export type AdaptiveActionKind = "ASK_USER" | "VALIDATE_HUMAN" | "RESOLVE_SOURCE_CONFLICT" | "RUN_ENGINE" | "COMPLETE";
export type AdaptiveActionPriority = "BLOCKING" | "HIGH" | "NORMAL";

export interface UniversalAdaptiveAction {
  kind: AdaptiveActionKind;
  id: string;
  fieldKey?: string;
  engine?: "CONTRACT_NATURE_CLASSIFIER" | "CPVEngine" | "ProcedimientoEngine" | "DeadlineDecisionEngine";
  question?: string;
  help?: string;
  reason: string;
  priority: AdaptiveActionPriority;
}

function fieldNeedsHumanValidation(field: EvidenceField<unknown>): boolean {
  return field.status !== "SOURCE_CONFLICT" && field.status !== "PENDING" && field.humanValidationRequired && !field.humanValidated;
}

function conflictAction(field: EvidenceField<unknown>): UniversalAdaptiveAction | null {
  if (field.status !== "SOURCE_CONFLICT") return null;
  return { kind: "RESOLVE_SOURCE_CONFLICT", id: `resolve:${field.key}`, fieldKey: field.key, reason: `El campo ${field.key} contiene declaraciones de fuente incompatibles y no puede resolverse automáticamente.`, priority: "BLOCKING" };
}

function validationAction(field: EvidenceField<unknown>): UniversalAdaptiveAction | null {
  if (!fieldNeedsHumanValidation(field)) return null;
  return { kind: "VALIDATE_HUMAN", id: `validate:${field.key}`, fieldKey: field.key, reason: `Ya existe una propuesta o declaración para ${field.key}; debe validarse antes de pedir o calcular información dependiente.`, priority: "HIGH" };
}

function allEvidenceFields(expediente: UniversalExpedienteV13): EvidenceField<unknown>[] {
  const canonical = Object.values(expediente.canonical.fields) as EvidenceField<unknown>[];
  const domains = [expediente.processing, expediente.regulation, expediente.economic, expediente.administrative, expediente.technical, expediente.lots, expediente.guarantees, expediente.execution, expediente.criteria];
  return [...canonical, ...domains.flatMap(domain => Object.values(domain) as EvidenceField<unknown>[])];
}

function ask(fieldKey: string, id: string, question: string, help: string, reason: string): UniversalAdaptiveAction {
  return { kind: "ASK_USER", id, fieldKey, question, help, reason, priority: "NORMAL" };
}

function run(engine: NonNullable<UniversalAdaptiveAction["engine"]>, id: string, fieldKey: string, reason: string): UniversalAdaptiveAction {
  return { kind: "RUN_ENGINE", id, engine, fieldKey, reason, priority: "HIGH" };
}

function isKnown(field: EvidenceField<unknown> | undefined): boolean {
  return Boolean(field && field.value !== null && field.status !== "PENDING" && field.status !== "SOURCE_CONFLICT");
}

function coreIdentificationAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  if (!isKnown(f.object)) return ask(f.object.key, "ask:contract-need", "¿Qué necesita contratar la Administración y para qué?", "Descríbalo con lenguaje natural. No es necesario conocer el tipo jurídico del contrato ni el CPV.", "El objeto material de la necesidad es un hecho de partida que el sistema no debe inventar.");
  if (!isKnown(f.contractType)) return run("CONTRACT_NATURE_CLASSIFIER", "run:contract-nature", f.contractType.key, "Con una descripción de la necesidad ya disponible, primero debe intentarse una propuesta de naturaleza contractual antes de preguntar al usuario por una calificación jurídica.");
  if (!isKnown(f.cpvMain)) return run("CPVEngine", "run:cpv", f.cpvMain.key, "El objeto y el tipo contractual permiten obtener una propuesta CPV; no procede pedir al usuario un código que puede proponer el sistema.");
  return null;
}

function basicTermAndLotsAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  const contractType = f.contractType.value;

  if (!isKnown(f.lots)) {
    if (!isKnown(expediente.lots.divisionIntoLots)) {
      const question = contractType === "SUPPLY"
        ? "¿Las familias de artículos pueden adjudicarse por separado sin perjudicar la gestión de pedidos y entregas?"
        : "¿Las prestaciones pueden ejecutarse por empresas diferentes sin perjudicar la coordinación o el resultado del contrato?";
      return ask(expediente.lots.divisionIntoLots.key, "ask:lot-separability", question, "Responda desde la realidad técnica. El sistema propondrá después la configuración y motivación jurídica de los lotes.", "La divisibilidad depende de hechos técnicos y organizativos que no deben presumirse.");
    }
    if (expediente.lots.divisionIntoLots.value === true) {
      return ask(f.lots.key, "ask:lot-configuration", "¿Qué lotes funcionalmente autónomos se prevén?", "Indique una denominación clara para cada lote. Sus CPV, PBL y VE se completarán como evidencia individualizada, no como simples nombres.", "Una vez declarada la división, el sistema necesita identificar los lotes concretos.");
    }
  }

  if (!isKnown(f.durationMonths)) return ask(f.durationMonths.key, "ask:initial-duration", contractType === "SUPPLY" ? "¿Cuál será la duración inicial del suministro?" : "¿Cuál será la duración inicial del contrato?", "Indique la duración prevista en meses.", "La duración inicial es una decisión de configuración del expediente que condiciona la economía y los plazos.");
  if (!isKnown(f.extensionMonths)) return ask(f.extensionMonths.key, "ask:extensions", "¿Se prevén prórrogas y qué duración total tendrán?", "Indique la duración total prevista de las prórrogas en meses; si no habrá prórroga, indique 0.", "La existencia y duración de prórrogas no se deduce automáticamente del plazo inicial.");
  return null;
}

function economicAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  const contractType = f.contractType.value;
  if (contractType === "SUPPLY") {
    if (!isKnown(expediente.economic.maximumApprovedBudgetCents)) return ask(expediente.economic.maximumApprovedBudgetCents.key, "ask:supply-maximum-budget", "¿Cuál es el presupuesto máximo aprobado para la vigencia que se está configurando, sin IVA?", "En suministros por necesidades, indique el límite máximo presupuestario. No se confundirá con el consumo estimado ni con el valor estimado jurídico.", "El presupuesto máximo aprobado es una magnitud propia y no puede reconstruirse automáticamente a partir del consumo o del valor estimado.");
    if (!isKnown(expediente.economic.referenceConsumption)) return ask(expediente.economic.referenceConsumption.key, "ask:supply-reference-consumption", "¿Existe un consumo histórico o estimado de referencia para dimensionar el suministro?", "Puede indicar la referencia disponible o que no existe. Este dato no altera por sí solo el presupuesto máximo aprobado.", "El consumo de referencia es información técnica/económica distinta del presupuesto y del valor estimado.");
  } else if (!isKnown(f.baseTenderBudgetCents)) {
    return ask(f.baseTenderBudgetCents.key, "ask:base-tender-budget", "¿Cuál es el presupuesto base de licitación previsto, sin IVA?", "Si todavía es una estimación, se conservará como tal hasta su contraste y validación.", "El presupuesto base es un dato económico de configuración que necesita una fuente o decisión expresa.");
  }

  if (!isKnown(expediente.economic.legalEstimatedValueCents) && !isKnown(f.estimatedValueCents)) {
    return ask(expediente.economic.legalEstimatedValueCents.key, "ask:estimated-value", "Si ya está calculado, ¿cuál es el valor estimado jurídico del contrato, sin IVA?", "Si todavía no está calculado, debe mantenerse pendiente hasta que el motor económico del Bloque 15 disponga de todos sus componentes; no se inferirá a partir del PBL por una regla simplificada.", "El procedimiento necesita un VE jurídicamente determinado o una propuesta de cálculo trazable.");
  }
  return null;
}

function legalDecisionAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const f = expediente.canonical.fields;
  if (!isKnown(f.procedure)) {
    if (isPromotableEvidenceField(f.contractType) && (isPromotableEvidenceField(expediente.economic.legalEstimatedValueCents) || isPromotableEvidenceField(f.estimatedValueCents))) return run("ProcedimientoEngine", "run:procedure", f.procedure.key, "Con tipo contractual y valor estimado promocionables, el procedimiento debe ser propuesto por el motor normativo antes de preguntarlo al usuario.");
    return null;
  }
  if (isPromotableEvidenceField(f.procedure) && isPromotableEvidenceField(expediente.processing.processingType) && isPromotableEvidenceField(expediente.regulation.harmonizedRegulation) && isPromotableEvidenceField(expediente.processing.urgency) && isPromotableEvidenceField(expediente.processing.emergency) && isPromotableEvidenceField(expediente.regulation.europeanFunding) && !isKnown(expediente.regulation.deadlines)) return run("DeadlineDecisionEngine", "run:deadlines", expediente.regulation.deadlines.key, "Las entradas jurídicas necesarias están disponibles; los plazos deben calcularse mediante el motor existente y no preguntarse al usuario.");
  return null;
}

function missingLegalInputAction(expediente: UniversalExpedienteV13): UniversalAdaptiveAction | null {
  const candidates: Array<[EvidenceField<unknown>, string, string, string]> = [
    [expediente.processing.processingType, "ask:processing-type", "¿La tramitación será ordinaria, urgente o de otro régimen expresamente previsto?", "Este dato condiciona reglas de plazo y no debe inferirse del importe."],
    [expediente.regulation.harmonizedRegulation, "ask:harmonized", "¿Consta determinada la sujeción o no a regulación armonizada?", "Si todavía no está determinada, debe quedar pendiente para resolución normativa; no se asumirá por defecto."],
    [expediente.processing.urgency, "ask:urgency", "¿Se ha acordado o se prevé una declaración formal de urgencia?", "La urgencia requiere una decisión expresa; no se deduce de que el expediente tenga prisa."],
    [expediente.processing.emergency, "ask:emergency", "¿Existe una situación jurídicamente calificada de emergencia?", "La emergencia es excepcional y nunca se presume."],
    [expediente.regulation.europeanFunding, "ask:eu-funding", "¿El contrato está financiado total o parcialmente con fondos europeos?", "Indíquelo porque puede abrir obligaciones y controles adicionales."],
  ];
  for (const [field, id, question, help] of candidates) if (!isKnown(field)) return ask(field.key, id, question, help, "El motor jurídico necesita este hecho antes de poder continuar.");
  return null;
}

export class UniversalAdaptiveQuestionEngine {
  public next(expediente: UniversalExpedienteV13): UniversalAdaptiveAction {
    const fields = allEvidenceFields(expediente);
    for (const field of fields) { const action = conflictAction(field); if (action) return action; }
    const criticalValidationOrder: EvidenceField<unknown>[] = [expediente.canonical.fields.contractType, expediente.canonical.fields.object, expediente.canonical.fields.cpvMain, expediente.economic.legalEstimatedValueCents, expediente.canonical.fields.procedure, expediente.regulation.deadlines];
    for (const field of criticalValidationOrder) { const action = validationAction(field); if (action) return action; }
    return coreIdentificationAction(expediente) ?? basicTermAndLotsAction(expediente) ?? economicAction(expediente) ?? legalDecisionAction(expediente) ?? missingLegalInputAction(expediente) ?? { kind: "COMPLETE", id: "adaptive:complete", reason: "No queda ninguna pregunta o acción automática imprescindible en el alcance actual del planificador adaptativo.", priority: "NORMAL" };
  }
}
