import { UniversalExpedienteV13 } from "../../../domain/expediente/UniversalExpedienteV13";
import {
  HumanDecisionMetadata,
  UniversalAdaptiveHumanDecisionApplier,
} from "./UniversalAdaptiveHumanDecisionApplier";
import { UniversalAdaptiveAction } from "./UniversalAdaptiveQuestionEngine";
import {
  UniversalAdaptiveAdvanceResult,
  UniversalAdaptiveOrchestrator,
} from "./UniversalAdaptiveOrchestrator";

export interface HumanLoopResult extends UniversalAdaptiveAdvanceResult {
  humanActionId: string;
  updatedFieldKey: string;
}

export class UniversalAdaptiveHumanLoop {
  constructor(
    private readonly applier: UniversalAdaptiveHumanDecisionApplier,
    private readonly orchestrator: UniversalAdaptiveOrchestrator,
  ) {}

  public validateAndResume(
    expediente: UniversalExpedienteV13,
    action: UniversalAdaptiveAction,
    metadata: HumanDecisionMetadata,
  ): HumanLoopResult {
    const applied = this.applier.validate(expediente, action, metadata);
    const resumed = this.orchestrator.advance(applied.expediente);
    return {
      ...resumed,
      humanActionId: action.id,
      updatedFieldKey: applied.updatedFieldKey,
    };
  }

  public resolveConflictAndResume(
    expediente: UniversalExpedienteV13,
    action: UniversalAdaptiveAction,
    chosenValue: unknown,
    metadata: HumanDecisionMetadata,
  ): HumanLoopResult {
    const applied = this.applier.resolveConflict(expediente, action, chosenValue, metadata);
    const resumed = this.orchestrator.advance(applied.expediente);
    return {
      ...resumed,
      humanActionId: action.id,
      updatedFieldKey: applied.updatedFieldKey,
    };
  }
}
