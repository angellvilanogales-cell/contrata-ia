import type { ResolverDecision, ResolverContext, ValidationResult } from "./FrameworkTypes";

export type Validator<T> = (context: ResolverContext, decision: ResolverDecision<T>) => ValidationResult;

export class ValidationPipeline {
  public constructor(private readonly validators: Array<Validator<unknown>> = []) {}
  public validate<T>(context: ResolverContext, decision: ResolverDecision<T>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    for (const validator of this.validators) {
      const result = validator(context, decision as ResolverDecision<unknown>);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  public run<T>(context: ResolverContext, decision: ResolverDecision<T>): ValidationResult {
    return this.validate(context, decision);
  }
}
