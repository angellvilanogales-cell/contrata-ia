import { UniversalTargetContractType } from "../../domain/capabilities/UniversalContractCoverage";
import {
  UniversalDecisionEngine,
  UniversalDecisionRecord,
  UniversalDecisionSession,
  UniversalDecisionSourceKind,
} from "./UniversalDecisionEngine";

export interface UniversalGuidedQuestionView {
  id: string;
  section: string;
  field: string;
  question: string;
  explanation: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  proposedValue?: unknown;
  legalBasis: readonly {
    sourceId: string;
    citation: string;
    rule: string;
    application: string;
    authority: "A" | "B" | "C" | "D" | "E";
  }[];
  actions: readonly ["VALIDATE", "REJECT_PROPOSAL", "REQUIRE_CLARIFICATION"];
}

export interface UniversalGuidedFlowState {
  decisionSession: UniversalDecisionSession;
  phase: "GUIDED_DECISIONS" | "READY_FOR_DOCUMENT_GENERATION";
  humanValidationRequired: true;
}

export class UniversalGuidedContractFlow {
  private readonly decisions = new UniversalDecisionEngine();

  public start(contractType: UniversalTargetContractType): UniversalGuidedFlowState {
    return this.wrap(this.decisions.start(contractType));
  }

  public current(state: UniversalGuidedFlowState): UniversalGuidedQuestionView | undefined {
    const decision = this.decisions.next(state.decisionSession);
    return decision ? this.view(decision) : undefined;
  }

  public propose(
    state: UniversalGuidedFlowState,
    decisionId: string,
    proposedValue: unknown,
    sourceKind: UniversalDecisionSourceKind,
  ): UniversalGuidedFlowState {
    return this.wrap(this.decisions.propose(state.decisionSession, decisionId, proposedValue, sourceKind));
  }

  public validate(
    state: UniversalGuidedFlowState,
    decisionId: string,
    value: unknown,
    validatedBy: string,
    validatedAt?: string,
  ): UniversalGuidedFlowState {
    return this.wrap(this.decisions.validate(state.decisionSession, decisionId, value, validatedBy, validatedAt));
  }

  public rejectProposal(state: UniversalGuidedFlowState, decisionId: string, reason: string): UniversalGuidedFlowState {
    return this.wrap(this.decisions.rejectProposal(state.decisionSession, decisionId, reason));
  }

  public requireClarification(state: UniversalGuidedFlowState, decisionId: string): UniversalGuidedFlowState {
    return this.wrap(this.decisions.requireClarification(state.decisionSession, decisionId));
  }

  public blockers(state: UniversalGuidedFlowState): readonly string[] {
    return state.decisionSession.decisions
      .filter(decision => decision.status !== "HUMAN_VALIDATED" && decision.status !== "NOT_APPLICABLE")
      .map(decision => `${decision.definition.id}:${decision.status}`);
  }

  public canonicalAnswers(state: UniversalGuidedFlowState): Readonly<Record<string, unknown>> {
    if (state.phase !== "READY_FOR_DOCUMENT_GENERATION") {
      throw new Error(`El expediente no está listo para generación: ${this.blockers(state).join(" | ")}`);
    }
    return Object.freeze({ ...state.decisionSession.answers });
  }

  private wrap(session: UniversalDecisionSession): UniversalGuidedFlowState {
    return {
      decisionSession: session,
      phase: this.decisions.readyForGeneration(session) ? "READY_FOR_DOCUMENT_GENERATION" : "GUIDED_DECISIONS",
      humanValidationRequired: true,
    };
  }

  private view(decision: UniversalDecisionRecord): UniversalGuidedQuestionView {
    return {
      id: decision.definition.id,
      section: decision.definition.section,
      field: decision.definition.field,
      question: decision.definition.question,
      explanation: decision.definition.explanation,
      risk: decision.definition.risk,
      proposedValue: decision.suggestedValue,
      legalBasis: decision.definition.legalBasis,
      actions: ["VALIDATE", "REJECT_PROPOSAL", "REQUIRE_CLARIFICATION"],
    };
  }
}
