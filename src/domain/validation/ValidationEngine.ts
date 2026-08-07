export interface ValidationIssue {
  code: string;
  message: string;
  severity: "error" | "warning";
  source?: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
}

export class ValidationEngine {
  public validate(value: unknown): ValidationReport {
    const issues: ValidationIssue[] = [];
    if (value === null || value === undefined) {
      issues.push({ code: "VALUE_REQUIRED", message: "Se requiere un valor para validar.", severity: "error" });
    }
    return { valid: issues.every(issue => issue.severity !== "error"), issues };
  }
}
