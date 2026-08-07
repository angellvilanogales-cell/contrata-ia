import type { ResolverContext, RuleExecution } from "./FrameworkTypes";

export interface ExecutableRule {
  id: string;
  evaluate(context: ResolverContext): boolean;
  explain?(context: ResolverContext): string;
  source?: string;
}

export class RuleExecutor {
  public constructor(private readonly rules: ExecutableRule[] = []) {}
  public execute(context: ResolverContext): RuleExecution[] {
    return this.rules.map(rule => ({
      ruleId: rule.id,
      matched: rule.evaluate(context),
      explanation: rule.explain?.(context),
      source: rule.source
    }));
  }
}
