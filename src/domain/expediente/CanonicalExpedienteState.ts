import { EstadoExpediente } from "./EstadoExpediente";
import { EvidenceField, assertNoSilentConflictResolution, isPromotableEvidenceField } from "./EvidenceField";

export type CanonicalContractType = "SUPPLY" | "SERVICE" | "WORKS" | "CONCESSION" | "MIXED" | "OTHER";

export interface CanonicalExpedienteFields {
  contractType: EvidenceField<CanonicalContractType>;
  object: EvidenceField<string>;
  cpvMain: EvidenceField<string>;
  lots: EvidenceField<readonly string[]>;
  estimatedValueCents: EvidenceField<number>;
  baseTenderBudgetCents: EvidenceField<number>;
  procedure: EvidenceField<string>;
  durationMonths: EvidenceField<number>;
  extensionMonths: EvidenceField<number>;
  modificationPercent: EvidenceField<number>;
  awardCriteria: EvidenceField<readonly string[]>;
  solvency: EvidenceField<readonly string[]>;
  publicity?: EvidenceField<string>;
}

/**
 * Vista auxiliar para motores heredados. No forma parte de la autoridad
 * canónica ni se promociona por sí sola: solo transporta datos universales ya
 * acreditados necesarios para aplicar reglas sin completar silenciosamente
 * condiciones jurídicas.
 */
export interface CanonicalProcedureContext {
  umbralSara?: number;
  regulacionArmonizada?: boolean;
  porcentajeJuicioValor?: number;
  prestacionesIntelectuales?: boolean;
  contratoMenorJustificado?: boolean;
}

export interface CanonicalExpedienteState {
  id: string;
  lifecycleState: EstadoExpediente;
  fields: CanonicalExpedienteFields;
  blockers: readonly string[];
  warnings: readonly string[];
  procedureContext?: CanonicalProcedureContext;
}

export interface CanonicalPromotionCheck {
  promotable: boolean;
  blockers: readonly string[];
}

export function evaluateCanonicalPromotion(state: CanonicalExpedienteState): CanonicalPromotionCheck {
  const blockers: string[] = [];
  const entries = Object.entries(state.fields) as Array<[string, EvidenceField<unknown>]>;

  for (const [name, field] of entries) {
    try {
      assertNoSilentConflictResolution(field);
    } catch (error) {
      blockers.push(error instanceof Error ? error.message : `Conflicto inválido en ${name}`);
      continue;
    }

    if (!isPromotableEvidenceField(field)) {
      blockers.push(`Campo no promocionable: ${field.key}`);
    }
  }

  blockers.push(...state.blockers);

  return {
    promotable: blockers.length === 0,
    blockers,
  };
}
