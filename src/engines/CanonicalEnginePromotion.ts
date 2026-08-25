import { DecisionJuridica } from "../domain/conocimiento/DecisionJuridica";
import { EvidenceField, EvidenceReference } from "../domain/expediente/EvidenceField";

export interface EnginePromotionOptions {
  key: string;
  motor: string;
  sourceId: string;
  legalBasis?: readonly string[];
  requiresHumanValidation?: boolean;
  diagnostics?: readonly string[];
}

function engineSource(options: EnginePromotionOptions): EvidenceReference {
  return {
    kind: "SYSTEM_PROPOSAL",
    sourceId: options.sourceId,
    note: `Resultado producido por ${options.motor}`,
  };
}

export function promoteEngineProposal<T>(
  decision: DecisionJuridica<T>,
  options: EnginePromotionOptions,
): EvidenceField<T> {
  return {
    key: options.key,
    value: decision.resultado ?? null,
    status: "SYSTEM_PROPOSAL",
    sources: [engineSource(options)],
    legalBasis: options.legalBasis ?? decision.articulos,
    humanValidationRequired: options.requiresHumanValidation ?? true,
    humanValidated: false,
    diagnostics: [
      `motor=${options.motor}`,
      `confianza=${decision.confianza}`,
      ...(decision.reglasAplicadas ?? []).map((rule) => `regla=${rule}`),
      ...(options.diagnostics ?? []),
    ],
  };
}

export function promoteNormativeEngineDecision<T>(
  decision: DecisionJuridica<T>,
  options: EnginePromotionOptions,
): EvidenceField<T> {
  const hasResult = decision.resultado !== undefined && decision.resultado !== null;
  return {
    key: options.key,
    value: hasResult ? decision.resultado! : null,
    status: hasResult ? "SYSTEM_PROPOSAL" : "PENDING",
    sources: hasResult
      ? [{ kind: "NORMATIVE_RULE", sourceId: options.sourceId, note: `Resultado producido por ${options.motor}` }]
      : [],
    legalBasis: options.legalBasis ?? decision.articulos,
    humanValidationRequired: hasResult ? (options.requiresHumanValidation ?? true) : false,
    humanValidated: false,
    diagnostics: [
      `motor=${options.motor}`,
      `confianza=${decision.confianza}`,
      ...(decision.reglasAplicadas ?? []).map((rule) => `regla=${rule}`),
      ...(options.diagnostics ?? []),
    ],
  };
}
