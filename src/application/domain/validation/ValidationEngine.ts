import { ValidationEngine as CanonicalValidationEngine } from "../../../domain/validation/ValidationEngine";

export class ValidationEngine extends CanonicalValidationEngine {
  public async execute(value: unknown) {
    return this.validate(value);
  }
}
