/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DecisionFactory
 * ------------------------------------------------------------
 * Fábrica común de decisiones jurídicas.
 *
 * Centraliza la creación de cualquier ResolverDecision.
 *
 * ============================================================
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

    /**
     * =====================================================
     * CREA UNA DECISIÓN
     * =====================================================
     */

    public static create<T>(

        decision: T

    ): ResolverDecision<T> {

        return {

            valid: true,

            decision,

            validation: this.defaultValidation(),

            report: this.defaultReport()

        };

    }

    /**
     * =====================================================
     * CREA UNA DECISIÓN INVÁLIDA
     * =====================================================
     */

    public static invalid<T>(

        decision: T,

        error: string

    ): ResolverDecision<T> {

        return {

            valid: false,

            decision,

            validation: {

                valid: false,

                warnings: [],

                errors: [error]

            },

            report: this.defaultReport()

        };

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    public static withValidation<T>(

        decision: ResolverDecision<T>,

        validation: ValidationResult

    ): ResolverDecision<T> {

        decision.validation = validation;

        decision.valid = validation.valid;

        return decision;

    }

    /**
     * =====================================================
     * INFORME
     * =====================================================
     */

    public static withReport<T>(

        decision: ResolverDecision<T>,

        report: ResolverReport

    ): ResolverDecision<T> {

        decision.report = report;

        return decision;

    }

    /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public static withStatistics<T>(

        decision: ResolverDecision<T>,

        statistics: StatisticsResult

    ): ResolverDecision<T> {

        decision.statistics = statistics;

        return decision;

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public static withDiagnostics<T>(

        decision: ResolverDecision<T>,

        diagnostics: DiagnosticResult

    ): ResolverDecision<T> {

        decision.diagnostics = diagnostics;

        return decision;

    }

    /**
     * =====================================================
     * AUDITORÍA
     * =====================================================
     */

    public static withAudit<T>(

        decision: ResolverDecision<T>,

        audit: AuditResult

    ): ResolverDecision<T> {

        decision.audit = audit;

        return decision;

    }

    /**
     * =====================================================
     * ADVERTENCIA
     * =====================================================
     */

    public static addWarning<T>(

        decision: ResolverDecision<T>,

        warning: string

    ): ResolverDecision<T> {

        decision.validation.warnings.push(

            warning

        );

        decision.report.warnings.push(

            warning

        );

        return decision;

    }

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    public static addError<T>(

        decision: ResolverDecision<T>,

        error: string

    ): ResolverDecision<T> {

        decision.valid = false;

        decision.validation.valid = false;

        decision.validation.errors.push(

            error

        );

        return decision;

    }

    /**
     * =====================================================
     * RECOMENDACIÓN
     * =====================================================
     */

    public static addRecommendation<T>(

        decision: ResolverDecision<T>,

        recommendation: string

    ): ResolverDecision<T> {

        decision.report.recommendations.push(

            recommendation

        );

        return decision;

    }

    /**
     * =====================================================
     * VALIDACIÓN POR DEFECTO
     * =====================================================
     */

    private static defaultValidation()

    : ValidationResult {

        return {

            valid: true,

            warnings: [],

            errors: []

        };

    }

    /**
     * =====================================================
     * INFORME POR DEFECTO
     * =====================================================
     */

    private static defaultReport()

    : ResolverReport {

        return {

            generatedAt: new Date(),

            warnings: [],

            recommendations: []

        };

    }

}
