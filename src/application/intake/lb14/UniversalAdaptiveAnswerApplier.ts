import { EvidenceField, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UniversalAdaptiveAction, UniversalAdaptiveQuestionEngine } from "./UniversalAdaptiveQuestionEngine";
import { CriterioAdjudicacion } from "../../../domain/expediente/CriterioAdjudicacion";
import { CriterioSolvencia } from "../../../domain/expediente/CriterioSolvencia";
import { UniversalAnnuality, UniversalLot, UniversalUnitPrice } from "../../../domain/expediente/UniversalExpedienteDomains";

export interface AdaptiveAnswerApplicationResult {
  expediente: UniversalExpedienteV13;
  next: UniversalAdaptiveAction;
  updatedFieldKey: string;
}

function declared<T>(key: string, value: T, actionId: string): EvidenceField<T> {
  return { key, value, status: "SOURCE_DECLARED", sources: [{ kind: "USER_INPUT", sourceId: `adaptive:${actionId}` }], humanValidationRequired: false, humanValidated: false, diagnostics: ["Respuesta incorporada por el flujo adaptativo; no equivale por sí sola a validación jurídica."] };
}

function notApplicable<T>(key: string, actionId: string, reason: string): EvidenceField<T> {
  return { key, value: null, status: "NOT_APPLICABLE", sources: [{ kind: "USER_INPUT", sourceId: `adaptive:${actionId}` }], humanValidationRequired: false, humanValidated: false, diagnostics: [reason] };
}

function appendSource(expediente: UniversalExpedienteV13, source: EvidenceReference): UniversalExpedienteV13 {
  const current = expediente.traceability.sourceRegistry;
  if (current.some(item => item.kind === source.kind && item.sourceId === source.sourceId)) return expediente;
  return { ...expediente, traceability: { ...expediente.traceability, sourceRegistry: [...current, source] } };
}

function setKnownField(expediente: UniversalExpedienteV13, fieldKey: string, value: unknown, actionId: string): UniversalExpedienteV13 {
  switch (fieldKey) {
    case "object": return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, object: declared("object", String(value), actionId) } } };
    case "lots.divisionIntoLots": {
      const divided = Boolean(value);
      const canonicalFields = divided || expediente.canonical.fields.lots.status !== "PENDING" ? expediente.canonical.fields : { ...expediente.canonical.fields, lots: declared("lots", ["Lote único"], actionId) };
      return { ...expediente, canonical: { ...expediente.canonical, fields: canonicalFields }, lots: { ...expediente.lots, divisionIntoLots: declared(fieldKey, divided, actionId) } };
    }
    case "lots": return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, lots: declared("lots", value as readonly string[], actionId) } } };
    case "durationMonths": return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, durationMonths: declared("durationMonths", Number(value), actionId) } } };
    case "extensionMonths": return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, extensionMonths: declared("extensionMonths", Number(value), actionId) } } };
    case "baseTenderBudgetCents": return { ...expediente, canonical: { ...expediente.canonical, fields: { ...expediente.canonical.fields, baseTenderBudgetCents: declared("baseTenderBudgetCents", Number(value), actionId) } } };

    case "economic.maximumApprovedBudgetCents": return { ...expediente, economic: { ...expediente.economic, maximumApprovedBudgetCents: declared(fieldKey, Number(value), actionId) } };
    case "economic.referenceConsumption": return { ...expediente, economic: { ...expediente.economic, referenceConsumption: declared(fieldKey, String(value), actionId) } };
    case "economic.projectedConsumption": return { ...expediente, economic: { ...expediente.economic, projectedConsumption: declared(fieldKey, String(value), actionId) } };
    case "economic.legalEstimatedValueCents": return { ...expediente, economic: { ...expediente.economic, legalEstimatedValueCents: declared(fieldKey, Number(value), actionId) } };
    case "economic.vatPercent": return { ...expediente, economic: { ...expediente.economic, vatPercent: declared(fieldKey, Number(value), actionId) } };
    case "economic.budgetApplication": return { ...expediente, economic: { ...expediente.economic, budgetApplication: declared(fieldKey, String(value), actionId) } };
    case "economic.annualities": return { ...expediente, economic: { ...expediente.economic, annualities: declared(fieldKey, value as readonly UniversalAnnuality[], actionId) } };
    case "economic.fundingSource": return { ...expediente, economic: { ...expediente.economic, fundingSource: declared(fieldKey, String(value), actionId) } };
    case "economic.priceRevisionRegime": return { ...expediente, economic: { ...expediente.economic, priceRevisionRegime: declared(fieldKey, String(value), actionId) } };
    case "economic.unitPrices": return { ...expediente, economic: { ...expediente.economic, unitPrices: declared(fieldKey, value as readonly UniversalUnitPrice[], actionId) } };

    case "processing.processingType": return { ...expediente, processing: { ...expediente.processing, processingType: declared(fieldKey, String(value), actionId) } };
    case "processing.urgency": return { ...expediente, processing: { ...expediente.processing, urgency: declared(fieldKey, Boolean(value), actionId) } };
    case "processing.emergency": return { ...expediente, processing: { ...expediente.processing, emergency: declared(fieldKey, Boolean(value), actionId) } };
    case "regulation.harmonizedRegulation": return { ...expediente, regulation: { ...expediente.regulation, harmonizedRegulation: declared(fieldKey, Boolean(value), actionId) } };
    case "regulation.europeanFunding": return { ...expediente, regulation: { ...expediente.regulation, europeanFunding: declared(fieldKey, Boolean(value), actionId) } };
    case "regulation.threshold": return { ...expediente, regulation: { ...expediente.regulation, threshold: declared(fieldKey, Number(value), actionId) } };

    case "administrative.contractingAuthority": return { ...expediente, administrative: { ...expediente.administrative, contractingAuthority: declared(fieldKey, String(value), actionId) } };
    case "administrative.promotingUnit": return { ...expediente, administrative: { ...expediente.administrative, promotingUnit: declared(fieldKey, String(value), actionId) } };
    case "administrative.competentBody": return { ...expediente, administrative: { ...expediente.administrative, competentBody: declared(fieldKey, String(value), actionId) } };
    case "administrative.administrativeFileNumber": return { ...expediente, administrative: { ...expediente.administrative, administrativeFileNumber: declared(fieldKey, String(value), actionId) } };
    case "administrative.contractManager": return { ...expediente, administrative: { ...expediente.administrative, contractManager: declared(fieldKey, String(value), actionId) } };

    case "technical.technicalPurpose": return { ...expediente, technical: { ...expediente.technical, technicalPurpose: declared(fieldKey, String(value), actionId) } };
    case "technical.technicalRequirements": return { ...expediente, technical: { ...expediente.technical, technicalRequirements: declared(fieldKey, value as readonly string[], actionId) } };
    case "technical.executionLocations": return { ...expediente, technical: { ...expediente.technical, executionLocations: declared(fieldKey, value as readonly string[], actionId) } };
    case "technical.subrogationRequired": {
      const required = Boolean(value);
      return { ...expediente, technical: { ...expediente.technical, subrogationRequired: declared(fieldKey, required, actionId), subrogationRegime: required ? expediente.technical.subrogationRegime : notApplicable("technical.subrogationRegime", actionId, "No aplicable porque se ha declarado que no existe obligación de subrogación.") } };
    }
    case "technical.subrogationRegime": return { ...expediente, technical: { ...expediente.technical, subrogationRegime: declared(fieldKey, String(value), actionId) } };

    case "lots.lots": return { ...expediente, lots: { ...expediente.lots, lots: declared(fieldKey, value as readonly UniversalLot[], actionId) } };
    case "lots.maxOfferableLots": return { ...expediente, lots: { ...expediente.lots, maxOfferableLots: declared(fieldKey, Number(value), actionId) } };
    case "lots.maxAwardableLots": return { ...expediente, lots: { ...expediente.lots, maxAwardableLots: declared(fieldKey, Number(value), actionId) } };

    case "criteria.awardCriteria": return { ...expediente, criteria: { ...expediente.criteria, awardCriteria: declared(fieldKey, value as readonly CriterioAdjudicacion[], actionId) } };
    case "criteria.judgmentCriteriaExist": return { ...expediente, criteria: { ...expediente.criteria, judgmentCriteriaExist: declared(fieldKey, Boolean(value), actionId) } };
    case "criteria.economicSolvency": return { ...expediente, criteria: { ...expediente.criteria, economicSolvency: declared(fieldKey, value as readonly CriterioSolvencia[], actionId) } };
    case "criteria.technicalSolvency": return { ...expediente, criteria: { ...expediente.criteria, technicalSolvency: declared(fieldKey, value as readonly CriterioSolvencia[], actionId) } };

    case "guarantees.provisionalGuaranteeRequired": {
      const required = Boolean(value);
      return { ...expediente, guarantees: { ...expediente.guarantees, provisionalGuaranteeRequired: declared(fieldKey, required, actionId), provisionalGuaranteePercent: required ? expediente.guarantees.provisionalGuaranteePercent : notApplicable("guarantees.provisionalGuaranteePercent", actionId, "No aplicable porque no se exige garantía provisional.") } };
    }
    case "guarantees.provisionalGuaranteePercent": return { ...expediente, guarantees: { ...expediente.guarantees, provisionalGuaranteePercent: declared(fieldKey, Number(value), actionId) } };
    case "guarantees.definitiveGuaranteePercent": return { ...expediente, guarantees: { ...expediente.guarantees, definitiveGuaranteePercent: declared(fieldKey, Number(value), actionId) } };
    case "guarantees.complementaryGuaranteePercent": return { ...expediente, guarantees: { ...expediente.guarantees, complementaryGuaranteePercent: declared(fieldKey, Number(value), actionId) } };

    case "execution.specialExecutionConditions": return { ...expediente, execution: { ...expediente.execution, specialExecutionConditions: declared(fieldKey, value as readonly string[], actionId) } };
    case "execution.specificPenalties": return { ...expediente, execution: { ...expediente.execution, specificPenalties: declared(fieldKey, value as readonly string[], actionId) } };
    case "execution.subcontractingRegime": return { ...expediente, execution: { ...expediente.execution, subcontractingRegime: declared(fieldKey, String(value), actionId) } };
    case "execution.assignmentRegime": return { ...expediente, execution: { ...expediente.execution, assignmentRegime: declared(fieldKey, String(value), actionId) } };
    case "execution.paymentRegime": return { ...expediente, execution: { ...expediente.execution, paymentRegime: declared(fieldKey, String(value), actionId) } };
    case "execution.receiptAndAcceptanceRegime": return { ...expediente, execution: { ...expediente.execution, receiptAndAcceptanceRegime: declared(fieldKey, String(value), actionId) } };
    default: throw new Error(`El campo ${fieldKey} todavía no admite respuesta directa en el flujo adaptativo.`);
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
