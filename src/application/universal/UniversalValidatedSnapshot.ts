import { createHash } from "node:crypto";
import { UniversalDecisionSession } from "./UniversalDecisionEngine";
import { UniversalGuidedContractFlow, UniversalGuidedFlowState } from "./UniversalGuidedContractFlow";

export interface UniversalValidatedDecisionEvidence {
  decisionId: string;
  field: string;
  value: unknown;
  validatedBy: string;
  validatedAt: string;
  legalBasisSourceIds: readonly string[];
}

export interface UniversalValidatedSnapshot {
  schemaVersion: "LB103-1";
  contractType: UniversalDecisionSession["contractType"];
  answers: Readonly<Record<string, unknown>>;
  decisions: readonly UniversalValidatedDecisionEvidence[];
  sha256: string;
  humanValidated: true;
}

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

export class UniversalValidatedSnapshotBuilder {
  private readonly flow = new UniversalGuidedContractFlow();

  public build(state: UniversalGuidedFlowState): UniversalValidatedSnapshot {
    const answers = this.flow.canonicalAnswers(state);
    const decisions = state.decisionSession.decisions
      .filter(decision => decision.status === "HUMAN_VALIDATED")
      .map(decision => {
        if (!decision.validatedBy || !decision.validatedAt) {
          throw new Error(`La decisión ${decision.definition.id} carece de evidencia completa de validación humana.`);
        }
        return {
          decisionId: decision.definition.id,
          field: decision.definition.field,
          value: decision.currentValue,
          validatedBy: decision.validatedBy,
          validatedAt: decision.validatedAt,
          legalBasisSourceIds: decision.definition.legalBasis.map(source => source.sourceId),
        } satisfies UniversalValidatedDecisionEvidence;
      });

    const payload = {
      schemaVersion: "LB103-1" as const,
      contractType: state.decisionSession.contractType,
      answers,
      decisions,
      humanValidated: true as const,
    };
    const sha256 = createHash("sha256").update(stable(payload)).digest("hex");
    return Object.freeze({ ...payload, sha256 });
  }
}
