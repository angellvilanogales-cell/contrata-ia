import { ContractContextModel } from "../contract-generator/ContractContext";
import { WorkflowResult } from "../../modules/contract-generator/GenerationResult";

export class WorkflowEngine {
  private result: WorkflowResult = {
    workflowId: crypto.randomUUID(),
    currentStage: "INITIALIZATION",
    completedStages: [],
    skippedStages: [],
    failedStages: [],
    successful: true
  };

  public async execute(_context: ContractContextModel): Promise<void> {
    this.result = { ...this.result, currentStage: "COMPLETED", successful: true };
  }

  public getResult(): WorkflowResult {
    return { ...this.result, completedStages: [...this.result.completedStages], skippedStages: [...this.result.skippedStages], failedStages: [...this.result.failedStages] };
  }
}
