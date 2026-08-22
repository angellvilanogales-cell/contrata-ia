export type EvidenceFieldStatus =
  | "PENDING"
  | "SOURCE_DECLARED"
  | "SOURCE_CONFIRMED"
  | "SYSTEM_PROPOSAL"
  | "HUMAN_VALIDATED"
  | "SOURCE_CONFLICT"
  | "NOT_APPLICABLE";

export type EvidenceSourceKind =
  | "USER_INPUT"
  | "PRIMARY_DOCUMENT"
  | "OFFICIAL_TEMPLATE"
  | "NORMATIVE_RULE"
  | "DERIVED_CALCULATION"
  | "SYSTEM_PROPOSAL";

export interface EvidenceReference {
  kind: EvidenceSourceKind;
  sourceId: string;
  locator?: string;
  note?: string;
}

export interface EvidenceField<T> {
  key: string;
  value: T | null;
  status: EvidenceFieldStatus;
  sources: readonly EvidenceReference[];
  legalBasis?: readonly string[];
  humanValidationRequired: boolean;
  humanValidated: boolean;
  conflict?: {
    statements: readonly string[];
    treatment: "DO_NOT_AUTO_RESOLVE";
  };
  diagnostics?: readonly string[];
}

export function createPendingEvidenceField<T>(key: string): EvidenceField<T> {
  return {
    key,
    value: null,
    status: "PENDING",
    sources: [],
    humanValidationRequired: false,
    humanValidated: false,
  };
}

/**
 * Promotion is status-based and independent of the concrete value type. Using
 * EvidenceField<unknown> deliberately permits heterogeneous universal field
 * collections without weakening the evidence semantics.
 */
export function isPromotableEvidenceField(field: EvidenceField<unknown>): boolean {
  if (field.status === "SOURCE_CONFLICT" || field.status === "PENDING") return false;
  if (field.humanValidationRequired && !field.humanValidated) return false;
  return true;
}

export function assertNoSilentConflictResolution(field: EvidenceField<unknown>): void {
  if (field.status !== "SOURCE_CONFLICT") return;
  if (!field.conflict || field.conflict.treatment !== "DO_NOT_AUTO_RESOLVE") {
    throw new Error(`El campo ${field.key} contiene una contradicción sin tratamiento bloqueante.`);
  }
  if (field.value !== null) {
    throw new Error(`El campo ${field.key} no puede tener un valor promovido mientras exista contradicción de fuente.`);
  }
}
