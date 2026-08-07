export class RuleEngineMock {
  execute(_input: any){
    return { decisions: [], rulesApplied: [], warnings: [] };
  }
}
