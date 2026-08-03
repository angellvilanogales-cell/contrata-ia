/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * FrameworkTypes
 * ------------------------------------------------------------
 * Tipos base del Framework Jurídico.
 *
 * TODOS los motores jurídicos utilizarán estas interfaces.
 *
 * ============================================================
 */

import { UUID } from "../../common/types";

/* ============================================================
 * CONTEXTO
 * ============================================================
 */

export interface ResolverContext {

    readonly expedienteId?: UUID;

    readonly contract?: unknown;

    readonly procedure?: unknown;

    readonly cpv?: unknown;

    readonly metadata?: Record<string, unknown>;

}

/* ============================================================
 * RESULTADO DE REGLA
 * ============================================================
 */

export interface RuleResult {

    valid: boolean;

    message: string;

    value?: unknown;

    warnings?: string[];

    errors?: string[];

}

/* ============================================================
 * EJECUCIÓN DE REGLA
 * ============================================================
 */

export interface RuleExecution {

    id: UUID;

    code: string;

    name: string;

    executed: boolean;

    executionTime: number;

    result: RuleResult;

}

/* ============================================================
 * VALIDACIÓN
 * ============================================================
 */

export interface ValidationResult {

    valid: boolean;

    warnings: string[];

    errors: string[];

}

/* ============================================================
 * INFORME
 * ============================================================
 */

export interface ResolverReport {

    generatedAt: Date;

    warnings: string[];

    recommendations: string[];

}

/* ============================================================
 * ESTADÍSTICAS
 * ============================================================
 */

export interface StatisticsResult {

    totalRules: number;

    executedRules: number;

    executionTime: number;

}

/* ============================================================
 * DIAGNÓSTICO
 * ============================================================
 */

export interface DiagnosticResult {

    healthy: boolean;

    diagnostics: string[];

}

/* ============================================================
 * AUDITORÍA
 * ============================================================
 */

export interface AuditResult {

    generatedAt: Date;

    events: string[];

}

/* ============================================================
 * DECISIÓN
 * ============================================================
 */

export interface ResolverDecision<T = unknown> {

    valid: boolean;

    decision: T;

    validation: ValidationResult;

    report: ResolverReport;

    statistics?: StatisticsResult;

    diagnostics?: DiagnosticResult;

    audit?: AuditResult;

}

/* ============================================================
 * PIPELINE
 * ============================================================
 */

export interface PipelineContext {

    resolver: string;

    startedAt: Date;

    finishedAt?: Date;

    variables: Map<string, unknown>;

}

/* ============================================================
 * CACHE
 * ============================================================
 */

export interface CacheEntry<T> {

    key: string;

    createdAt: Date;

    expiresAt?: Date;

    value: T;

}

/* ============================================================
 * SERVICIO
 * ============================================================
 */

export interface FrameworkService {

    reset(): void;

    diagnostics(): DiagnosticResult;

}
