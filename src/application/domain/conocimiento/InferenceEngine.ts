import { InferenceEngine as CanonicalInferenceEngine } from "../../../domain/conocimiento/InferenceEngine";
import { RuleEngine } from "../../../domain/conocimiento/RuleEngine";

export class InferenceEngine extends CanonicalInferenceEngine {
  constructor() {
    super(new RuleEngine());
  }

  public async execute(_context: unknown): Promise<void> {}
}
