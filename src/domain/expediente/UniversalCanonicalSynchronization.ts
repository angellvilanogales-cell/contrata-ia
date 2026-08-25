import { CanonicalExpedienteState } from "./CanonicalExpedienteState";
import { EvidenceField, isPromotableEvidenceField } from "./EvidenceField";
import { UniversalExpedienteV13 } from "./UniversalExpedienteV13";

export type UniversalSynchronizationStatus =
  | "SYNCED_EXACT"
  | "ALIGNED_EXACT"
  | "BLOCKED_EXACT_DIVERGENCE"
  | "BLOCKED_NON_ISOMORPHIC";

export interface UniversalSynchronizationRecord {
  sourceKey: string;
  targetKey: string;
  status: UniversalSynchronizationStatus;
  reason: string;
}

export interface UniversalSynchronizationResult {
  expediente: UniversalExpedienteV13;
  records: readonly UniversalSynchronizationRecord[];
  blockers: readonly string[];
}

function rekey<T>(field: EvidenceField<T>, key: string): EvidenceField<T> {
  return { ...field, key };
}

/**
 * Sincroniza únicamente equivalencias semánticas exactas entre la vista
 * canónica heredada y los dominios universales. Nunca completa por analogía
 * ni resuelve divergencias eligiendo silenciosamente una de las dos fuentes.
 */
export function synchronizeCanonicalIntoUniversal(
  expediente: UniversalExpedienteV13,
): UniversalSynchronizationResult {
  const records: UniversalSynchronizationRecord[] = [];
  const blockers: string[] = [];
  const canonical = expediente.canonical;

  let economic = expediente.economic;
  const sourceVe = canonical.fields.estimatedValueCents;
  const targetVe = economic.legalEstimatedValueCents;

  if (targetVe.status === "PENDING") {
    economic = {
      ...economic,
      legalEstimatedValueCents: rekey(sourceVe, "economic.legalEstimatedValueCents"),
    };
    records.push({
      sourceKey: sourceVe.key,
      targetKey: "economic.legalEstimatedValueCents",
      status: "SYNCED_EXACT",
      reason: "El valor estimado jurídico es la misma magnitud expresada en céntimos.",
    });
  } else if (sourceVe.value === targetVe.value) {
    records.push({
      sourceKey: sourceVe.key,
      targetKey: "economic.legalEstimatedValueCents",
      status: "ALIGNED_EXACT",
      reason: "Ambas vistas contienen el mismo valor estimado jurídico; se conserva la evidencia universal existente.",
    });
  } else {
    const reason = `Divergencia entre VE canónico (${String(sourceVe.value)}) y VE jurídico universal (${String(targetVe.value)}); requiere revisión de fuente y validación humana.`;
    records.push({
      sourceKey: sourceVe.key,
      targetKey: "economic.legalEstimatedValueCents",
      status: "BLOCKED_EXACT_DIVERGENCE",
      reason,
    });
    blockers.push(reason);
  }

  const nonIsomorphic: Array<[string, string, string]> = [
    [
      canonical.fields.baseTenderBudgetCents.key,
      "economic.maximumApprovedBudgetCents",
      "PBL y presupuesto máximo aprobado no son conceptos intercambiables, especialmente en suministros por necesidades.",
    ],
    [
      canonical.fields.awardCriteria.key,
      "criteria.awardCriteria",
      "La lista antigua no contiene obligatoriamente ponderación, fórmula ni clasificación formula/juicio de valor.",
    ],
    [
      canonical.fields.solvency.key,
      "criteria.economicSolvency/technicalSolvency",
      "La lista antigua no separa solvencia económica y técnica ni conserva todos sus parámetros.",
    ],
    [
      canonical.fields.lots.key,
      "lots.lots",
      "Los nombres antiguos de lote no contienen necesariamente CPV, PBL y VE individualizados.",
    ],
  ];

  for (const [sourceKey, targetKey, reason] of nonIsomorphic) {
    records.push({ sourceKey, targetKey, status: "BLOCKED_NON_ISOMORPHIC", reason });
  }

  return {
    expediente: { ...expediente, economic },
    records,
    blockers,
  };
}

function procedureContext(expediente: UniversalExpedienteV13): CanonicalExpedienteState["procedureContext"] {
  const result: NonNullable<CanonicalExpedienteState["procedureContext"]> = {};
  const threshold = expediente.regulation.threshold;
  if (isPromotableEvidenceField(threshold) && typeof threshold.value === "number" && Number.isFinite(threshold.value) && threshold.value > 0) {
    result.umbralSara = threshold.value;
  }

  const criteria = expediente.criteria.awardCriteria;
  if (isPromotableEvidenceField(criteria) && criteria.value) {
    result.porcentajeJuicioValor = criteria.value
      .filter(criterion => !criterion.evaluableMedianteFormula)
      .reduce((sum, criterion) => sum + criterion.ponderacion, 0);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Vista de compatibilidad para motores anteriores al Bloque 13.
 * La autoridad de arquitectura sigue siendo UniversalExpedienteV13. Solo se
 * adjuntan como contexto auxiliar datos universales ya promocionables; nunca se
 * degradan a hechos canónicos ni se inventan equivalencias.
 */
export function canonicalCompatibilityView(
  expediente: UniversalExpedienteV13,
): CanonicalExpedienteState {
  const context = procedureContext(expediente);
  return context
    ? { ...expediente.canonical, procedureContext: context }
    : expediente.canonical;
}
