import { UniversalDecisionEngine } from "../../application/universal/UniversalDecisionEngine";
import type { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";

export interface UniversalGuidedUiDecision {
  id: string;
  section: string;
  field: string;
  question: string;
  explanation: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  legalBasis: readonly {
    sourceId: string;
    citation: string;
    rule: string;
    application: string;
    authority: "A" | "B" | "C" | "D" | "E";
  }[];
  activation?: { field: string; equals: unknown };
}

function manifestFor(contractType: UniversalTargetContractType): readonly UniversalGuidedUiDecision[] {
  const session = new UniversalDecisionEngine().start(contractType);
  return session.decisions.map(({ definition }) => ({
    id: definition.id,
    section: definition.section,
    field: definition.field,
    question: definition.question,
    explanation: definition.explanation,
    risk: definition.risk,
    legalBasis: definition.legalBasis.map(source => ({ ...source })),
    ...(definition.id === "common:no-lots-justification"
      ? { activation: { field: "dividedIntoLots", equals: false } }
      : {}),
  }));
}

export const UNIVERSAL_GUIDED_UI_MANIFEST = Object.freeze({
  SUPPLY: manifestFor("SUPPLY"),
  SERVICE: manifestFor("SERVICE"),
});
