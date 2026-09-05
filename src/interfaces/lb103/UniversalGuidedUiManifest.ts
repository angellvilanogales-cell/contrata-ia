import { UniversalDecisionEngine } from "../../application/universal/UniversalDecisionEngine";
import type { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";

export type UniversalGuidedEvidenceTransform = "IDENTITY" | "DELIVERY_MODE_TO_DA33_BOOLEAN";

export interface UniversalGuidedUiDecision {
  id: string;
  section: string;
  field: string;
  evidenceFieldPath: string;
  evidenceTransform: UniversalGuidedEvidenceTransform;
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

const EVIDENCE_BINDINGS: Readonly<Record<string, { fieldPath: string; transform?: UniversalGuidedEvidenceTransform }>> = Object.freeze({
  "common:object": { fieldPath: "object" },
  "common:cpv": { fieldPath: "cpvMain" },
  "common:lots": { fieldPath: "lots.divisionIntoLots" },
  "common:no-lots-justification": { fieldPath: "lots.noDivisionJustification" },
  "supply:delivery-mode": { fieldPath: "economic.needsBasedContractDa33", transform: "DELIVERY_MODE_TO_DA33_BOOLEAN" },
  "supply:pbl": { fieldPath: "baseTenderBudgetCents" },
  "supply:estimated-value": { fieldPath: "economic.legalEstimatedValueCents" },
  "service:pbl": { fieldPath: "baseTenderBudgetCents" },
  "service:estimated-value": { fieldPath: "economic.legalEstimatedValueCents" },
});

function manifestFor(contractType: UniversalTargetContractType): readonly UniversalGuidedUiDecision[] {
  const session = new UniversalDecisionEngine().start(contractType);
  return session.decisions.map(({ definition }) => {
    const binding = EVIDENCE_BINDINGS[definition.id];
    if (!binding) throw new Error(`LB103 UI sin binding de evidencia universal para ${definition.id}.`);
    return {
      id: definition.id,
      section: definition.section,
      field: definition.field,
      evidenceFieldPath: binding.fieldPath,
      evidenceTransform: binding.transform ?? "IDENTITY",
      question: definition.question,
      explanation: definition.explanation,
      risk: definition.risk,
      legalBasis: definition.legalBasis.map(source => ({ ...source })),
      ...(definition.id === "common:no-lots-justification"
        ? { activation: { field: "dividedIntoLots", equals: false } }
        : {}),
    };
  });
}

export const UNIVERSAL_GUIDED_UI_MANIFEST = Object.freeze({
  SUPPLY: manifestFor("SUPPLY"),
  SERVICE: manifestFor("SERVICE"),
});
