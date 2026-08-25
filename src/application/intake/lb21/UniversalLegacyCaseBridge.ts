import { IntakeCase } from "../lb6/IntakeModel";
import { CanonicalExpedienteState } from "../../../domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../../../domain/expediente/EstadoExpediente";
import { EvidenceField, createPendingEvidenceField } from "../../../domain/expediente/EvidenceField";
import { UniversalExpedienteV13, createUniversalExpedienteFromCanonical } from "../../../domain/expediente/UniversalExpedienteV13";

export interface UniversalLegacyCaseBridgeResult {
  expediente: UniversalExpedienteV13;
  migratedFields: readonly string[];
  skippedLegacyAnswers: readonly string[];
  diagnostics: readonly string[];
}

function declared<T>(key: string, value: T, caseId: string, questionId: string): EvidenceField<T> {
  return {
    key,
    value,
    status: "SOURCE_DECLARED",
    sources: [{ kind: "USER_INPUT", sourceId: `lb6-case:${caseId}`, locator: `answer:${questionId}` }],
    humanValidationRequired: false,
    humanValidated: false,
    diagnostics: ["Migrado conservadoramente desde una respuesta LB6; no implica validación jurídica adicional."],
  };
}

function pendingCanonical(caseId: string): CanonicalExpedienteState {
  return {
    id: caseId,
    lifecycleState: EstadoExpediente.BORRADOR,
    fields: {
      contractType: createPendingEvidenceField("contractType"),
      object: createPendingEvidenceField("object"),
      cpvMain: createPendingEvidenceField("cpvMain"),
      lots: createPendingEvidenceField("lots"),
      estimatedValueCents: createPendingEvidenceField("estimatedValueCents"),
      baseTenderBudgetCents: createPendingEvidenceField("baseTenderBudgetCents"),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: createPendingEvidenceField("durationMonths"),
      extensionMonths: createPendingEvidenceField("extensionMonths"),
      modificationPercent: createPendingEvidenceField("modificationPercent"),
      awardCriteria: createPendingEvidenceField("awardCriteria"),
      solvency: createPendingEvidenceField("solvency"),
      publicity: createPendingEvidenceField("publicity"),
    },
    blockers: [],
    warnings: [],
  };
}

/**
 * Bloque 21.1. Migra únicamente equivalencias semánticas directas desde LB6.
 * No presume tipo contractual, CPV, procedimiento ni conversión monetaria a
 * céntimos, porque el modelo LB6 no acredita esas equivalencias con precisión.
 */
export function bridgeLegacyIntakeCaseToUniversal(caseValue: IntakeCase): UniversalLegacyCaseBridgeResult {
  const canonical = pendingCanonical(caseValue.id);
  const expediente = createUniversalExpedienteFromCanonical(canonical);
  const migratedFields: string[] = [];
  const skippedLegacyAnswers: string[] = [];
  const diagnostics: string[] = [];

  const object = caseValue.answers.object;
  if (object && typeof object.value === "string" && object.value.trim()) {
    expediente.canonical.fields.object = declared("object", object.value.trim(), caseValue.id, "object");
    migratedFields.push("object");
  }

  const duration = caseValue.answers.durationMonths;
  if (duration && typeof duration.value === "number" && Number.isFinite(duration.value)) {
    expediente.canonical.fields.durationMonths = declared("durationMonths", duration.value, caseValue.id, "durationMonths");
    migratedFields.push("durationMonths");
  }

  const authority = caseValue.answers.contractingAuthority;
  if (authority && typeof authority.value === "string" && authority.value.trim()) {
    expediente.administrative.contractingAuthority = declared(
      "administrative.contractingAuthority",
      authority.value.trim(),
      caseValue.id,
      "contractingAuthority",
    );
    migratedFields.push("administrative.contractingAuthority");
  }

  const promotingUnit = caseValue.answers.promotingUnit;
  if (promotingUnit && typeof promotingUnit.value === "string" && promotingUnit.value.trim()) {
    expediente.administrative.promotingUnit = declared(
      "administrative.promotingUnit",
      promotingUnit.value.trim(),
      caseValue.id,
      "promotingUnit",
    );
    migratedFields.push("administrative.promotingUnit");
  }

  for (const questionId of Object.keys(caseValue.answers)) {
    const mapped = ["object", "durationMonths", "contractingAuthority", "promotingUnit"].includes(questionId);
    if (!mapped) skippedLegacyAnswers.push(questionId);
  }

  if (caseValue.answers.estimatedValue) {
    diagnostics.push(
      "estimatedValue de LB6 no se migra automáticamente: el puente no presume que su unidad histórica coincida con estimatedValueCents.",
    );
  }
  if (caseValue.validation.validated) {
    diagnostics.push(
      "La validación global LB6 no promociona automáticamente los campos universales; cada evidencia conserva las puertas LB14-LB20.",
    );
  }

  return { expediente, migratedFields, skippedLegacyAnswers, diagnostics };
}
