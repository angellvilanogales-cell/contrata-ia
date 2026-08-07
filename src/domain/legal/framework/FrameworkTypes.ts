/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * FrameworkTypes
 * ------------------------------------------------------------
 * Tipos base del Framework Jurídico.
 *
 * TODOS los motores jurídicos utilizarán estas interfaces.
 * ============================================================
 */

import { UUID, ValidationStatus } from "../../common/types";

export interface ResolverContext {
    readonly expedienteId?: UUID;
    readonly contract?: unknown;
    readonly procedure?: unknown;
    readonly cpv?: unknown;
    readonly metadata?: Record<string, unknown>;
}

export interface RuleResult {
    valid: boolean;
    message: string;
    value?: unknown;
    warnings?: string[];
    errors?: string[];
}

export interface RuleExecution {
    id: UUID;
    code: string;
    name: string;
    executed: boolean;
    executionTime: number;
    result: RuleResult;
}

export interface ValidationResult {
    valid: boolean;
    warnings: string[];
    errors: string[];
}

export interface ResolverReport {
    generatedAt: Date;
    warnings: string[];
    recommendations: string[];
}

export interface StatisticsResult {
    totalRules: number;
    executedRules: number;
    executionTime: number;
    extra?: Record<string, unknown>;
}

export interface DiagnosticResult {
    healthy: boolean;
    diagnostics: string[];
}

export interface AuditResult {
    generatedAt: Date;
    events: string[];
}

export interface ResolverDecision<T = unknown> {
    /** Resultado técnico de la evaluación. */
    valid: boolean;
    decision: T;
    validation: ValidationResult;
    report: ResolverReport;
    statistics?: StatisticsResult;
    diagnostics?: DiagnosticResult;
    audit?: AuditResult;

    /**
     * Estado de la decisión jurídica. `pending` significa que la propuesta
     * todavía requiere validación humana; nunca equivale a una decisión final.
     */
    status?: ValidationStatus;
    proposedAt?: Date;
    validatedBy?: UUID;
    validatedAt?: Date;
    validationJustification?: string;
    ruleIds?: string[];
    sourceIds?: string[];
}

export interface PipelineContext {
    resolver: string;
    startedAt: Date;
    finishedAt?: Date;
    variables: Map<string, unknown>;
}

export interface CacheEntry<T> {
    key: string;
    createdAt: Date;
    expiresAt?: Date;
    value: T;
}

export interface FrameworkService {
    reset(): void;
    diagnostics(): DiagnosticResult;
}
