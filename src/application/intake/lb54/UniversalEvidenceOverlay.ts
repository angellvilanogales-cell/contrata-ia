import type { CanonicalContractType } from "../../../domain/expediente/CanonicalExpedienteState";
import type { CriterioAdjudicacion } from "../../../domain/expediente/CriterioAdjudicacion";
import type { EvidenceField } from "../../../domain/expediente/EvidenceField";
import { isPromotableEvidenceField } from "../../../domain/expediente/EvidenceField";
import type { UniversalAnnualityBudgetRow, UniversalUnitPrice } from "../../../domain/expediente/UniversalExpedienteDomains";
import type { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST } from "../lb51/UniversalV1UiFieldManifest";

const manifestPaths = new Set(UNIVERSAL_V1_UI_FIELD_MANIFEST.map(item => item.fieldPath));

function typed<T>(field: EvidenceField<unknown>): EvidenceField<T> {
  return field as EvidenceField<T>;
}

/**
 * LB54 — superpone evidencia persistida de UI sobre el UniversalExpedienteV13.
 *
 * No interpreta ni reescribe el valor: únicamente aplica EvidenceField ya validado y
 * promocionable a una ruta conocida. Un PENDING/SOURCE_CONFLICT/SOURCE_DECLARED que
 * requiera revisión no entra en el expediente que se entrega a los gates documentales.
 */
export function applyUniversalEvidenceOverlay(
  expediente: UniversalExpedienteV13,
  evidence: Readonly<Record<string, EvidenceField<unknown>>>,
) {
  let current = expediente;
  const applied: string[] = [];
  const blocked: string[] = [];

  for (const [fieldPath, field] of Object.entries(evidence)) {
    if (!manifestPaths.has(fieldPath)) {
      blocked.push(`Ruta no reconocida por la UI universal: ${fieldPath}.`);
      continue;
    }
    if (!isPromotableEvidenceField(field)) {
      blocked.push(`Evidencia no promocionable: ${fieldPath} (${field.status}).`);
      continue;
    }

    switch (fieldPath) {
      case "contractType": current = { ...current, canonical: { ...current.canonical, fields: { ...current.canonical.fields, contractType: typed<CanonicalContractType>(field) } } }; break;
      case "object": current = { ...current, canonical: { ...current.canonical, fields: { ...current.canonical.fields, object: typed<string>(field) } } }; break;
      case "cpvMain": current = { ...current, canonical: { ...current.canonical, fields: { ...current.canonical.fields, cpvMain: typed<string>(field) } } }; break;
      case "baseTenderBudgetCents": current = { ...current, canonical: { ...current.canonical, fields: { ...current.canonical.fields, baseTenderBudgetCents: typed<number>(field) } } }; break;
      case "durationMonths": current = { ...current, canonical: { ...current.canonical, fields: { ...current.canonical.fields, durationMonths: typed<number>(field) } } }; break;
      case "extensionMonths": current = { ...current, canonical: { ...current.canonical, fields: { ...current.canonical.fields, extensionMonths: typed<number>(field) } } }; break;

      case "administrative.contractingAuthority": current = { ...current, administrative: { ...current.administrative, contractingAuthority: typed<string>(field) } }; break;
      case "administrative.reservedContractDa4": current = { ...current, administrative: { ...current.administrative, reservedContractDa4: typed<boolean>(field) } }; break;
      case "technical.executionLocations": current = { ...current, technical: { ...current.technical, executionLocations: typed<readonly string[]>(field) } }; break;
      case "lots.divisionIntoLots": current = { ...current, lots: { ...current.lots, divisionIntoLots: typed<boolean>(field) } }; break;
      case "lots.noDivisionJustification": current = { ...current, lots: { ...current.lots, noDivisionJustification: typed<string>(field) } }; break;

      case "economic.initialVatAmountCents": current = { ...current, economic: { ...current.economic, initialVatAmountCents: typed<number>(field) } }; break;
      case "economic.initialPblVatIncludedCents": current = { ...current, economic: { ...current.economic, initialPblVatIncludedCents: typed<number>(field) } }; break;
      case "economic.needsBasedContractDa33": current = { ...current, economic: { ...current.economic, needsBasedContractDa33: typed<boolean>(field) } }; break;
      case "economic.budgetCoversEntireContractLife": current = { ...current, economic: { ...current.economic, budgetCoversEntireContractLife: typed<boolean>(field) } }; break;
      case "economic.maximumApprovedBudgetCents": current = { ...current, economic: { ...current.economic, maximumApprovedBudgetCents: typed<number>(field) } }; break;
      case "economic.legalEstimatedValueCents": current = { ...current, economic: { ...current.economic, legalEstimatedValueCents: typed<number>(field) } }; break;
      case "economic.estimatedValueCalculationMethod": current = { ...current, economic: { ...current.economic, estimatedValueCalculationMethod: typed<string>(field) } }; break;
      case "economic.priceDeterminationRegime": current = { ...current, economic: { ...current.economic, priceDeterminationRegime: typed<string>(field) } }; break;
      case "economic.priceRevisionRegime": current = { ...current, economic: { ...current.economic, priceRevisionRegime: typed<string>(field) } }; break;
      case "economic.annualityBudgetRows": current = { ...current, economic: { ...current.economic, annualityBudgetRows: typed<readonly UniversalAnnualityBudgetRow[]>(field) } }; break;
      case "economic.unitPrices": current = { ...current, economic: { ...current.economic, unitPrices: typed<readonly UniversalUnitPrice[]>(field) } }; break;

      case "execution.extensionStructure": current = { ...current, execution: { ...current.execution, extensionStructure: typed<string>(field) } }; break;
      case "execution.extensionNoticeMonths": current = { ...current, execution: { ...current.execution, extensionNoticeMonths: typed<number>(field) } }; break;
      case "execution.plannedModificationRegime": current = { ...current, execution: { ...current.execution, plannedModificationRegime: typed<string>(field) } }; break;
      case "execution.specialExecutionConditions": current = { ...current, execution: { ...current.execution, specialExecutionConditions: typed<readonly string[]>(field) } }; break;
      case "criteria.awardCriteria": current = { ...current, criteria: { ...current.criteria, awardCriteria: typed<readonly CriterioAdjudicacion[]>(field) } }; break;
      case "criteria.singleCriterionMotivation": current = { ...current, criteria: { ...current.criteria, singleCriterionMotivation: typed<string>(field) } }; break;
      default: blocked.push(`La ruta ${fieldPath} figura en el manifiesto pero todavía no tiene destino de overlay.`); continue;
    }
    applied.push(fieldPath);
  }

  return { expediente: current, applied, blocked, ready: blocked.length === 0 } as const;
}
