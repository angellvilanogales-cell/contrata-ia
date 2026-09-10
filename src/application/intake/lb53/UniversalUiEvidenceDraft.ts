import type { EvidenceField, EvidenceReference } from "../../../domain/expediente/EvidenceField";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST, type UniversalUiControlKind } from "../lb51/UniversalV1UiFieldManifest";
import { SUPPLY_VERTICAL_FIELD_MANIFEST } from "../lb93/SupplyVerticalFieldManifest";
import { SUPPLY_ASA_PCAP_FIELD_MANIFEST } from "../lb95/SupplyAsaPcapFieldManifest";
import { assertSupplyAsaAnnexIResidualDecisions } from "../lb95/SupplyAsaAnnexIResidualCompletion";

export interface UniversalUiDraftMutation {
  fieldPath: string;
  value: unknown;
  sourceId?: string;
  note?: string;
}

function manifestField(fieldPath: string) {
  const definition = [...SUPPLY_VERTICAL_FIELD_MANIFEST, ...SUPPLY_ASA_PCAP_FIELD_MANIFEST, ...UNIVERSAL_V1_UI_FIELD_MANIFEST, {fieldPath:"lots.lots",control:"TABLE" as const}].find(item => item.fieldPath === fieldPath);
  if (!definition) throw new Error(`Campo universal no expuesto por la UI: ${fieldPath}.`);
  return definition;
}

function assertControlValue(control: UniversalUiControlKind, value: unknown): void {
  if (value === null || value === undefined) throw new Error("El valor del campo universal no puede ser nulo en una declaración de fuente.");
  if ((control === "TEXT" || control === "TEXTAREA" || control === "SELECT") && (typeof value !== "string" || !value.trim())) {
    throw new Error("El campo universal requiere un texto no vacío.");
  }
  if (control === "BOOLEAN" && typeof value !== "boolean") throw new Error("El campo universal requiere un valor booleano.");
  if ((control === "MONEY_CENTS" || control === "INTEGER") && (!Number.isInteger(value) || Number(value) < 0)) {
    throw new Error("El campo universal requiere un número entero no negativo.");
  }
  if (control === "TABLE" && !Array.isArray(value)) throw new Error("El campo universal requiere una colección estructurada.");
}

function userReference(sourceId: string, note?: string): EvidenceReference {
  return { kind: "USER_INPUT", sourceId, ...(note ? { note } : {}) };
}

export function declareUniversalUiEvidence(mutation: UniversalUiDraftMutation, actorId: string): EvidenceField<unknown> {
  const definition = manifestField(mutation.fieldPath);
  if (mutation.fieldPath === "administrative.pcapAnnexIResidualDecisions") {
    assertSupplyAsaAnnexIResidualDecisions(mutation.value);
  } else if (mutation.fieldPath === "execution.plannedModificationRegime" && typeof mutation.value === "object" && mutation.value && !Array.isArray(mutation.value)) {
    // The PCAP renderer validates the structured causes, limits and percentages.
  } else assertControlValue(definition.control, mutation.value);
  if ("options" in definition && definition.options && !definition.options.includes(mutation.value as never)) throw new Error("Seleccione una opción válida para este campo.");
  const sourceId = mutation.sourceId?.trim() || `ui:${actorId}`;
  return {
    key: mutation.fieldPath,
    value: mutation.value,
    status: "SOURCE_DECLARED",
    sources: [userReference(sourceId, mutation.note)],
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics: ["Valor declarado desde la interfaz universal; pendiente de validación humana."],
  };
}

export function validateUniversalUiEvidence(field: EvidenceField<unknown>, reviewerId: string, validatedAt = new Date().toISOString()): EvidenceField<unknown> {
  manifestField(field.key);
  if (field.status === "SOURCE_CONFLICT") throw new Error(`No se puede validar ${field.key} mientras exista un conflicto de fuentes.`);
  if (field.value === null || field.value === undefined) throw new Error(`No se puede validar ${field.key} sin valor.`);
  if (!reviewerId.trim()) throw new Error("La identidad de la persona revisora es obligatoria.");
  return {
    ...field,
    status: "HUMAN_VALIDATED",
    humanValidationRequired: true,
    humanValidated: true,
    humanValidation: { by: reviewerId, at: validatedAt },
    diagnostics: [...(field.diagnostics ?? []), `Validación humana registrada por ${reviewerId} en ${validatedAt}.`],
  };
}

export function markUniversalUiEvidenceConflict(
  fieldPath: string,
  statements: readonly string[],
  sources: readonly EvidenceReference[],
): EvidenceField<unknown> {
  manifestField(fieldPath);
  if (statements.length < 2) throw new Error("Un conflicto de fuente requiere al menos dos declaraciones incompatibles.");
  return {
    key: fieldPath,
    value: null,
    status: "SOURCE_CONFLICT",
    sources,
    humanValidationRequired: true,
    humanValidated: false,
    conflict: { statements, treatment: "DO_NOT_AUTO_RESOLVE" },
    diagnostics: ["Conflicto de fuentes bloqueante. No se ha promovido ningún valor."],
  };
}
