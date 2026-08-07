/**
 * Clase base para cualquier decisión jurídica.
 * Toda decisión producida por el motor nace como propuesta pendiente de
 * validación humana y conserva la trazabilidad de esa validación.
 */

import type { UUID, ValidationStatus } from "../../common/types";
import {
    ResolverDecision,
    ValidationResult,
    ResolverReport,
    StatisticsResult,
    DiagnosticResult,
    AuditResult
} from "./FrameworkTypes";

export abstract class BaseDecision<T> implements ResolverDecision<T> {
    public valid = true;
    public decision!: T;
    public validation: ValidationResult = { valid: true, warnings: [], errors: [] };
    public report: ResolverReport = { generatedAt: new Date(), warnings: [], recommendations: [] };
    public statistics?: StatisticsResult;
    public diagnostics?: DiagnosticResult;
    public audit?: AuditResult;

    public status: ValidationStatus = "pending";
    public proposedAt = new Date();
    public validatedBy?: UUID;
    public validatedAt?: Date;
    public validationJustification?: string;
    public ruleIds?: string[];
    public sourceIds?: string[];

    public warning(message: string): void {
        this.validation.warnings.push(message);
        this.report.warnings.push(message);
    }

    public error(message: string): void {
        this.valid = false;
        this.validation.valid = false;
        this.validation.errors.push(message);
    }

    public recommendation(message: string): void {
        this.report.recommendations.push(message);
    }

    public setStatistics(statistics: StatisticsResult): void { this.statistics = statistics; }
    public setDiagnostics(diagnostics: DiagnosticResult): void { this.diagnostics = diagnostics; }
    public setAudit(audit: AuditResult): void { this.audit = audit; }

    public validateHuman(actor: UUID, justification: string): void {
        this.status = "validated";
        this.validatedBy = actor;
        this.validatedAt = new Date();
        this.validationJustification = justification;
    }

    public rejectHuman(actor: UUID, justification: string): void {
        this.status = "rejected";
        this.validatedBy = actor;
        this.validatedAt = new Date();
        this.validationJustification = justification;
    }

    public modifyHuman(actor: UUID, justification: string): void {
        this.status = "modified";
        this.validatedBy = actor;
        this.validatedAt = new Date();
        this.validationJustification = justification;
    }

    public toJSON() {
        return {
            valid: this.valid,
            decision: this.decision,
            validation: this.validation,
            report: this.report,
            statistics: this.statistics,
            diagnostics: this.diagnostics,
            audit: this.audit,
            status: this.status,
            proposedAt: this.proposedAt,
            validatedBy: this.validatedBy,
            validatedAt: this.validatedAt,
            validationJustification: this.validationJustification,
            ruleIds: this.ruleIds,
            sourceIds: this.sourceIds
        };
    }
}
