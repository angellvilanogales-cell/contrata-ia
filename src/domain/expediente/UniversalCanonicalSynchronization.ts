import { CanonicalExpedienteState } from "./CanonicalExpedienteState";
import { EvidenceField } from "./EvidenceField";
import { UniversalExpedienteV13 } from "./UniversalExpedienteV13";

export type UniversalSynchronizationStatus =
  | "SYNCED_EXACT"
  | "SKIPPED_ALREADY_POPULATED"
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
 * canónica heredada y los dominios universales. Nunca completa por analogía.
 */
export function synchronizeCanonicalIntoUniversal(
  expediente: UniversalExpedienteV13,
): UniversalSynchronizationResult {
  const records: UniversalSynchronizationRecord[] = [];
  const blockers: string[] = [];
  const canonical = expediente.canonical;

  let economic = expediente.economic;

  if (economic.legalEstimatedValueCents.status === "PENDING") {
    economic = {
      ...economic,
      legalEstimatedValueCents: rekey(
        canonical.fields.estimatedValueCents,
        "economic.legalEstimatedValueCents",
      ),
    };
    records.push({
      sourceKey: canonical.fields.estimatedValueCents.key,
      targetKey: "economic.legalEstimatedValueCents",
      status: "SYNCED_EXACT",
      reason: "El valor estimado jurídico es la misma magnitud expresada en céntimos.",
    });
  } else {
    records.push({
      sourceKey: canonical.fields.estimatedValueCents.key,
      targetKey: "economic.legalEstimatedValueCents",
      status: "SKIPPED_ALREADY_POPULATED",
      reason: "El dominio universal ya contiene evidencia propia y no se sobrescribe.",
    });
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
    blockers.push(`Sincronización no automática ${sourceKey} -> ${targetKey}: ${reason}`);
  }

  return {
    expediente: { ...expediente, economic },
    records,
    blockers,
  };
}

/**
 * Reconstruye la vista canónica heredada exclusivamente desde la copia
 * de compatibilidad incluida en el universal. Esta función centraliza el
 * acceso para motores antiguos y evita escrituras externas directas.
 */
export function canonicalCompatibilityView(
  expediente: UniversalExpedienteV13,
): CanonicalExpedienteState {
  return expediente.canonical;
}
