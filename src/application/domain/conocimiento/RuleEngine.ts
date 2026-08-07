import { RuleEngine as CanonicalRuleEngine } from "../../../domain/conocimiento/RuleEngine";

export class RuleEngine extends CanonicalRuleEngine {
  public async execute(_context: unknown): Promise<void> {}
}
