import type { UniversalEvidenceRecord } from "../lb52/UniversalEvidenceWorkspace";

export interface SupplyEconomicConsistencyResult {
  coherent: boolean;
  blockers: readonly string[];
  warnings: readonly string[];
  legalReferences: readonly string[];
}

function numberValue(record: UniversalEvidenceRecord, path: string): number | undefined {
  const value = record.fields[path]?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Comprobaciones aritméticas conservadoras. No recalculan ni corrigen la fuente:
 * detectan contradicciones que deben revisarse antes de generar documentos.
 */
export function evaluateSupplyEconomicConsistency(record: UniversalEvidenceRecord): SupplyEconomicConsistencyResult {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const pblBase = numberValue(record, "baseTenderBudgetCents");
  const vat = numberValue(record, "economic.initialVatAmountCents");
  const pblVat = numberValue(record, "economic.initialPblVatIncludedCents");
  const estimatedValue = numberValue(record, "economic.legalEstimatedValueCents");
  const maximumBudget = numberValue(record, "economic.maximumApprovedBudgetCents");
  const da33 = record.fields["economic.needsBasedContractDa33"]?.value;

  if (pblBase !== undefined && vat !== undefined && pblVat !== undefined && pblBase + vat !== pblVat) {
    blockers.push("El PBL con IVA no coincide con PBL sin IVA + cuota de IVA. Los valores declarados no se corrigen automáticamente.");
  }
  if (pblBase !== undefined && estimatedValue !== undefined && estimatedValue < pblBase) {
    blockers.push("El valor estimado declarado es inferior al presupuesto base sin IVA; debe revisarse el cálculo conforme a los arts. 100 y 101 LCSP.");
  }
  if (da33 === true && maximumBudget === undefined) {
    blockers.push("Un suministro declarado por necesidades/DA 33.ª debe identificar su presupuesto máximo aprobado antes de cerrar la economía del expediente.");
  }
  if (da33 !== true && maximumBudget !== undefined && pblBase !== undefined && maximumBudget !== pblBase) {
    warnings.push("Existe un presupuesto máximo distinto del PBL sin haberse declarado régimen por necesidades/DA 33.ª; requiere confirmar el fundamento económico antes de reutilizar ese dato.");
  }

  return {
    coherent: blockers.length === 0,
    blockers,
    warnings,
    legalReferences: ["LCSP art. 100 (presupuesto base de licitación)", "LCSP art. 101 (valor estimado)", "LCSP DA 33.ª cuando proceda"],
  };
}
