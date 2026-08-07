import { ContractContextModel } from "../contract-generator/ContractContext";

export class WorkflowEngine {
  private result: Record<string, unknown> = { success: true, executedSteps: 0, skippedSteps: 0, warnings: [], errors: [] };

  public async execute(_context: ContractContextModel): Promise<void> {
    this.result = { ...this.result, success: true };
  }

  public getResult(): Record<string, unknown> {
    return { ...this.result };
  }
}
