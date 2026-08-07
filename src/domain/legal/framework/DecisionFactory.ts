/**
 * Fábrica común de decisiones jurídicas.
 * Una decisión creada por el motor es una propuesta y queda pendiente
 * de validación humana hasta que el expediente la valide expresamente.
 */

import {
    ResolverDecision,
    ValidationResult,
    ResolverReport,
    StatisticsResult,
    DiagnosticResult,
    AuditResult
} from "./FrameworkTypes";

export class DecisionFactory {
    public static create<T>(decision: T): ResolverDecision<T> {
        return {
            valid: true,
            decision,
            validation: this.defaultValidation(),
            report: this.defaultReport(),
            status: "pending",
            proposedAt: new Date()
        };
    }

    public static invalid<T>(decision: T, error: string): ResolverDecision<T> {
        return {
            valid: false,
            decision,
            validation: { valid: false, warnings: [], errors: [error] },
            report: this.defaultReport(),
            status: "pending",
            proposedAt: new Date()
        };
    }

    public static withValidation<T>(decision: ResolverDecision<T>, validation: ValidationResult): ResolverDecision<T> {
        decision.validation = validation;
        decision.valid = validation.valid;
        return decision;
    }

    public static withReport<T>(decision: ResolverDecision<T>, report: ResolverReport): ResolverDecision<T> {
        decision.report = report;
        return decision;
    }

    public static withStatistics<T>(decision: ResolverDecision<T>, statistics: StatisticsResult): ResolverDecision<T> {
        decision.statistics = statistics;
        return decision;
    }

    public static withDiagnostics<T>(decision: ResolverDecision<T>, diagnostics: DiagnosticResult): ResolverDecision<T> {
        decision.diagnostics = diagnostics;
        return decision;
    }

    public static withAudit<T>(decision: ResolverDecision<T>, audit: AuditResult): ResolverDecision<T> {
        decision.audit = audit;
        return decision;
    }

    public static addWarning<T>(decision: ResolverDecision<T>, warning: string): ResolverDecision<T> {
        decision.validation.warnings.push(warning);
        decision.report.warnings.push(warning);
        return decision;
    }

    public static addError<T>(decision: ResolverDecision<T>, error: string): ResolverDecision<T> {
        decision.valid = false;
        decision.validation.valid = false;
        decision.validation.errors.push(error);
        return decision;
    }

    public static addRecommendation<T>(decision: ResolverDecision<T>, recommendation: string): ResolverDecision<T> {
        decision.report.recommendations.push(recommendation);
        return decision;
    }

    private static defaultValidation(): ValidationResult {
        return { valid: true, warnings: [], errors: [] };
    }

    private static defaultReport(): ResolverReport {
        return { generatedAt: new Date(), warnings: [], recommendations: [] };
    }
}
