import { EvidenceField, EvidenceReference } from "../../../expediente/EvidenceField";
import { UniversalExpedienteV13 } from "../../../expediente/UniversalExpedienteV13";

export interface HarmonizedValidationInput {
  validatedBy: string;
}

export interface HarmonizedValidationResult {
  expediente: UniversalExpedienteV13;
  validatedFields: readonly string[];
  blockers: readonly string[];
}

function normativeSourceIds(field: EvidenceField<unknown>): readonly string[] {
  return field.sources.filter(source => source.kind === "NORMATIVE_RULE").map(source => source.sourceId);
}

function humanReference(validatedBy: string): EvidenceReference {
  return {
    kind: "USER_INPUT",
    sourceId: `human-validation:${validatedBy}`,
    note: "Validación humana conjunta de umbral y sujeción a regulación armonizada en Bloque 15.11.",
  };
}

function validateField<T>(field: EvidenceField<T>, source: EvidenceReference): EvidenceField<T> {
  return {
    ...field,
    status: "HUMAN_VALIDATED",
    sources: [...field.sources, source],
    humanValidationRequired: true,
    humanValidated: true,
    diagnostics: [
      ...(field.diagnostics ?? []),
      "Propuesta SARA validada humanamente sin alterar la regla, el umbral ni la decisión calculada.",
    ],
  };
}

/** Bloque 15.11: valida de forma atómica el paquete regla/umbral/SARA. */
export function validateHarmonizedRegulationProposal(
  expediente: UniversalExpedienteV13,
  input: HarmonizedValidationInput,
): HarmonizedValidationResult {
  const blockers: string[] = [];
  const threshold = expediente.regulation.threshold;
  const sara = expediente.regulation.harmonizedRegulation;

  if (!input.validatedBy.trim()) blockers.push("Debe identificarse a la persona que valida la decisión SARA.");
  if (threshold.status === "SOURCE_CONFLICT" || sara.status === "SOURCE_CONFLICT") blockers.push("No puede validarse SARA mientras exista un conflicto de fuente.");
  if (threshold.status !== "SYSTEM_PROPOSAL" || sara.status !== "SYSTEM_PROPOSAL") blockers.push("Umbral y SARA deben encontrarse conjuntamente en estado SYSTEM_PROPOSAL.");
  if (threshold.value === null || typeof threshold.value !== "number" || threshold.value <= 0) blockers.push("El umbral propuesto debe contener un importe positivo.");
  if (sara.value === null || typeof sara.value !== "boolean") blockers.push("La propuesta SARA debe contener una decisión booleana explícita.");

  const thresholdRules = normativeSourceIds(threshold);
  const saraRules = normativeSourceIds(sara);
  if (thresholdRules.length === 0 || saraRules.length === 0) blockers.push("Umbral y SARA deben conservar referencia a la regla normativa aplicada.");
  if (thresholdRules.length > 0 && saraRules.length > 0 && !thresholdRules.some(id => saraRules.includes(id))) {
    blockers.push("Umbral y SARA no proceden de la misma fuente normativa; debe revisarse la selección de regla.");
  }
  if ((threshold.legalBasis?.length ?? 0) === 0 || (sara.legalBasis?.length ?? 0) === 0) blockers.push("Umbral y SARA deben conservar fundamento jurídico antes de validarse.");

  if (blockers.length > 0) return { expediente, validatedFields: [], blockers };

  const validationSource = humanReference(input.validatedBy);
  const updatedThreshold = validateField(threshold, validationSource);
  const updatedSara = validateField(sara, validationSource);
  const alreadyRegistered = expediente.traceability.sourceRegistry.some(
    item => item.kind === validationSource.kind && item.sourceId === validationSource.sourceId,
  );

  return {
    expediente: {
      ...expediente,
      regulation: {
        ...expediente.regulation,
        threshold: updatedThreshold,
        harmonizedRegulation: updatedSara,
      },
      traceability: {
        ...expediente.traceability,
        sourceRegistry: alreadyRegistered
          ? expediente.traceability.sourceRegistry
          : [...expediente.traceability.sourceRegistry, validationSource],
      },
    },
    validatedFields: [threshold.key, sara.key],
    blockers: [],
  };
}
