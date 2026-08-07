import { ValidationEngine as CanonicalValidationEngine } from "../../../domain/validation/ValidationEngine";
import { ValidationReport } from "../../../domain/validation/ValidationEngine";

export class ValidationEngine extends CanonicalValidationEngine {
  public async execute(value: unknown): Promise<{
    valid: boolean;
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warnings: number;
    errors: number;
    executionTime: number;
    checks: string[];
  }> {
    const started = Date.now();
    const report: ValidationReport = this.validate(value);
    const failed = report.issues.filter(issue => issue.severity === "error").length;
    const warnings = report.issues.filter(issue => issue.severity === "warning").length;
    return {
      valid: report.valid,
      totalChecks: report.issues.length,
      passedChecks: Math.max(0, report.issues.length - failed - warnings),
      failedChecks: failed,
      warnings,
      errors: failed,
      executionTime: Date.now() - started,
      checks: report.issues.map(issue => `${issue.code}: ${issue.message}`)
    };
  }
}
