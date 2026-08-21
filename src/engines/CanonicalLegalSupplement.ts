import { CanonicalExpedienteState } from "../domain/expediente/CanonicalExpedienteState";
import { EvidenceField, isPromotableEvidenceField } from "../domain/expediente/EvidenceField";
import { DeadlineDecision } from "../domain/legal/modules/plazos/DeadlineDecision";
import { DeadlineDecisionEngine } from "../domain/legal/modules/plazos/DeadlineDecisionEngine";
import { DeadlineRule } from "../domain/legal/modules/plazos/DeadlineRule";

export interface CanonicalDeadlineInputs {
  processingType: EvidenceField<string>;
  harmonizedRegulation: EvidenceField<boolean>;
  urgency: EvidenceField<boolean>;
  emergency: EvidenceField<boolean>;
  europeanFunding: EvidenceField<boolean>;
}

export interface CanonicalLegalDocumentResults {
  threshold?: EvidenceField<number>;
  deadlines?: EvidenceField<DeadlineDecision>;
}

export interface CanonicalDeadlineResolutionResult {
  ready: boolean;
  field?: EvidenceField<DeadlineDecision>;
  blockers: readonly string[];
}

export function resolveCanonicalDeadlineDecision(
  state: CanonicalExpedienteState,
  inputs: CanonicalDeadlineInputs,
  rules: DeadlineRule[],
  engine: DeadlineDecisionEngine = new DeadlineDecisionEngine(),
): CanonicalDeadlineResolutionResult {
  const blockers: string[] = [];
  const required = [
    state.fields.contractType,
    state.fields.procedure,
    state.fields.estimatedValueCents,
    inputs.processingType,
    inputs.harmonizedRegulation,
    inputs.urgency,
    inputs.emergency,
    inputs.europeanFunding,
  ] as const;

  for (const field of required) {
    if (!isPromotableEvidenceField(field) || field.value === null) {
      blockers.push(`Entrada no promocionable para motor de plazos: ${field.key}`);
    }
  }

  if (blockers.length > 0) return { ready: false, blockers };

  const result = engine.execute(
    {
      tipoContrato: String(state.fields.contractType.value),
      procedimiento: String(state.fields.procedure.value),
      tramitacion: String(inputs.processingType.value),
      regulacionArmonizada: Boolean(inputs.harmonizedRegulation.value),
      valorEstimado: Number(state.fields.estimatedValueCents.value) / 100,
      urgencia: Boolean(inputs.urgency.value),
      emergencia: Boolean(inputs.emergency.value),
      financiacionEuropea: Boolean(inputs.europeanFunding.value),
    },
    rules,
  );

  if (!result.success || !result.selected) {
    return {
      ready: false,
      blockers: [
        ...result.errors,
        ...result.warnings,
        "El motor de plazos no produjo una decisión seleccionable.",
      ],
    };
  }

  const decision = result.selected;
  const field: EvidenceField<DeadlineDecision> = {
    key: "deadlines",
    value: decision,
    status: "SYSTEM_PROPOSAL",
    sources: [{ kind: "NORMATIVE_RULE", sourceId: `deadline:${decision.articulo}` }],
    legalBasis: [decision.normativa, decision.articulo],
    humanValidationRequired: true,
    humanValidated: false,
    diagnostics: [
      decision.justificacion,
      `confidence=${decision.confidence}`,
      `candidates=${result.candidates.length}`,
    ],
  };

  return { ready: true, field, blockers: [] };
}
