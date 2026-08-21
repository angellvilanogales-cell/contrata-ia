import { EvidenceField, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalAdaptiveAction, UniversalAdaptiveQuestionEngine } from "./UniversalAdaptiveQuestionEngine";

export interface AdaptiveAnswerApplicationResult {
  expediente: UniversalExpedienteV13;
  next: UniversalAdaptiveAction;
  updatedFieldKey: string;
}

function declared<T>(key: string, value: T, actionId: string): EvidenceField<T> {
  return {
    key,
    value,
    status: "SOURCE_DECLARED",
    sources: [{ kind: "USER_INPUT", sourceId: `adaptive:${actionId}` }],
    humanValidationRequired: false,
    humanValidated: false,
    diagnostics: ["Respuesta incorporada por el flujo adaptativo; no equivale por sí sola a validación jurídica."],
  };
}

function appendSource(expediente: UniversalExpedienteV13, source: EvidenceReference): UniversalExpedienteV13 {
  const current = expediente.traceability.sourceRegistry;
  if (current.some(item => item.kind === source.kind && item.sourceId === source.sourceId)) return expediente;
  return { ...expediente, traceability: { ...expediente.traceability, sourceRegistry: [...current, source] } };
}

function setKnownField(expediente: UniversalExpedienteV13, fieldKey: string, value: unknown, actionId: string): UniversalExpedienteV13 {
  switch (fieldKey) {
    case "object":
      return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, object: declared("object", String(value), actionId) } } };
    case "lots.divisionIntoLots": {
      const divided = Boolean(value);
      const canonicalFields = divided || expediente.canonical.fields.lots.status !== "PENDING"
        ? expediente.canonical.fields
        : { ...expediente.canonical.fields, lots: declared("lots", ["Lote único"], actionId) };
      return {
        ...expediente,
        canonical: { ...expediente.canonical, fields: canonicalFields },
        lots: { ...expediente.lots, divisionIntoLots: declared(fieldKey, divided, actionId) },
      };
    }
    case "lots":
      return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, lots: declared("lots", value as readonly string[], actionId) } } };
    case "durationMonths":
      return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, durationMonths: declared("durationMonths", Number(value), actionId) } } };
    case "extensionMonths":
      return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, extensionMonths: declared("extensionMonths", Number(value), actionId) } } };
    case "baseTenderBudgetCents":
      return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, baseTenderBudgetCents: declared("baseTenderBudgetCents", Number(value), actionId) } } };
    case "economic.maximumApprovedBudgetCents":
      return { ...expediente, economic: { ...expediente.economic, maximumApprovedBudgetCents: declared(fieldKey, Number(value), actionId) } };
    case "economic.referenceConsumption":
      return { ...expediente, economic: { ...expediente.economic, referenceConsumption: declared(fieldKey, String(value), actionId) } };
    case "economic.legalEstimatedValueCents":
      return { ...expediente, economic: { ...expediente.economic, legalEstimatedValueCents: declared(fieldKey, Number(value), actionId) } };
    case "processing.processingType":
      return { ...expediente, processing: { ...expediente.processing, processingType: declared(fieldKey, String(value), actionId) } };
    case "regulation.harmonizedRegulation":
      return { ...expediente, regulation: { ...expediente.regulation, harmonizedRegulation: declared(fieldKey, Boolean(value), actionId) } };
    case "processing.urgency":
      return { ...expediente, processing: { ...expediente.processing, urgency: declared(fieldKey, Boolean(value), actionId) } };
    case "processing.emergency":
      return { ...expediente, processing: { ...expediente.processing, emergency: declared(fieldKey, Boolean(value), actionId) } };
    case "regulation.europeanFunding":
      return { ...expediente, regulation: { ...expediente.regulation, europeanFunding: declared(fieldKey, Boolean(value), actionId) } };
    default:
      throw new Error(`El campo ${fieldKey} todavía no admite respuesta directa en el flujo adaptativo.`);
  }
}

export class UniversalAdaptiveAnswerApplier {
  constructor(private readonly planner = new UniversalAdaptiveQuestionEngine()) {}

  public apply(expediente: UniversalExpedienteV13, action: UniversalAdaptiveAction, value: unknown): AdaptiveAnswerApplicationResult {
    if (action.kind !== "ASK_USER" || !action.fieldKey) throw new Error("Solo pueden aplicarse respuestas a acciones ASK_USER con campo de destino explícito.");
    let updated = setKnownField(expediente, action.fieldKey, value, action.id);
    const source = { kind: "USER_INPUT" as const, sourceId: `adaptive:${action.id}` };
    updated = appendSource(updated, source);
    return { expediente: updated, next: this.planner.next(updated), updatedFieldKey: action.fieldKey };
  }
}
