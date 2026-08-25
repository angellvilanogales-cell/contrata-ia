import { EconomicCalculationInput, EconomicContractKind } from "./UniversalEconomicCalculation";
import { EvidenceField, isPromotableEvidenceField } from "../expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../expediente/UniversalExpedienteV13";

export interface UniversalEconomicInputBuildResult {
  ready: boolean;
  input?: EconomicCalculationInput;
  missingFields: readonly string[];
  blockers: readonly string[];
}

function contractKind(expediente: UniversalExpedienteV13): EconomicContractKind | null {
  const value = expediente.canonical.fields.contractType.value;
  if (value === "SERVICE" || value === "SUPPLY" || value === "WORKS") return value;
  if (value === "OTHER" || value === "MIXED" || value === "CONCESSION") return "OTHER";
  return null;
}

function componentValue(field: EvidenceField<number>, missing: string[], blockers: string[]): number | null {
  if (field.status === "SOURCE_CONFLICT") {
    blockers.push(`Conflicto de fuente en ${field.key}; no puede utilizarse para calcular el valor estimado.`);
    return null;
  }
  if (field.status === "NOT_APPLICABLE") return 0;
  if (!isPromotableEvidenceField(field) || field.value === null) {
    missing.push(field.key);
    return null;
  }
  return field.value;
}

export function buildEconomicInputFromUniversal(expediente: UniversalExpedienteV13): UniversalEconomicInputBuildResult {
  const missingFields: string[] = [];
  const blockers: string[] = [];
  const kind = contractKind(expediente);
  if (!kind) blockers.push("La naturaleza contractual debe estar disponible antes de construir la entrada económica.");

  const e = expediente.economic;
  const initial = componentValue(e.initialEstimatedValueBaseCents, missingFields, blockers);
  const extension = componentValue(e.extensionAmountExVatCents, missingFields, blockers);
  const modification = componentValue(e.modificationAmountExVatCents, missingFields, blockers);
  const options = componentValue(e.optionsAmountExVatCents, missingFields, blockers);
  const other = componentValue(e.otherEstimatedValueComponentsCents, missingFields, blockers);

  if (!kind || blockers.length > 0 || missingFields.length > 0 || initial === null || extension === null || modification === null || options === null || other === null) {
    return { ready: false, missingFields, blockers };
  }

  const input: EconomicCalculationInput = {
    contractKind: kind,
    initialAmountExVatCents: initial,
    extensionAmountExVatCents: extension,
    modificationAmountExVatCents: modification,
    optionsAmountExVatCents: options,
    otherEstimatedValueComponentsCents: other,
  };

  if (kind === "SUPPLY") {
    if (isPromotableEvidenceField(e.maximumApprovedBudgetCents) && e.maximumApprovedBudgetCents.value !== null) input.maximumApprovedBudgetCents = e.maximumApprovedBudgetCents.value;
    if (isPromotableEvidenceField(e.referenceConsumption) && e.referenceConsumption.value !== null) input.referenceConsumption = e.referenceConsumption.value;
    if (isPromotableEvidenceField(e.projectedConsumption) && e.projectedConsumption.value !== null) input.projectedConsumption = e.projectedConsumption.value;
  }

  return { ready: true, input, missingFields: [], blockers: [] };
}
