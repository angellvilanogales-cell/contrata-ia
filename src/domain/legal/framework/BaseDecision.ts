/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseDecision
 * ------------------------------------------------------------
 * Clase base para cualquier decisión jurídica.
 *
 * Todos los motores devolverán objetos derivados
 * de esta clase.
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

export abstract class BaseDecision<T>
implements ResolverDecision<T> {

    /**
     * ¿La decisión es válida?
     */
    public valid = true;

    /**
     * Decisión producida por el motor.
     */
    public decision!: T;

    /**
     * Resultado de validación.
     */
    public validation: ValidationResult = {

        valid: true,

        warnings: [],

        errors: []

    };

    /**
     * Informe.
     */
    public report: ResolverReport = {

        generatedAt: new Date(),

        warnings: [],

        recommendations: []

    };

    /**
     * Estadísticas.
     */
    public statistics?: StatisticsResult;

    /**
     * Diagnóstico.
     */
    public diagnostics?: DiagnosticResult;

    /**
     * Auditoría.
     */
    public audit?: AuditResult;

    /**
     * =====================================================
     * Añade advertencia
     * =====================================================
     */

    public warning(

        message: string

    ): void {

        this.validation.warnings.push(

            message

        );

        this.report.warnings.push(

            message

        );

    }

    /**
     * =====================================================
     * Añade error
     * =====================================================
     */

    public error(

        message: string

    ): void {

        this.valid = false;

        this.validation.valid = false;

        this.validation.errors.push(

            message

        );

    }

    /**
     * =====================================================
     * Añade recomendación
     * =====================================================
     */

    public recommendation(

        message: string

    ): void {

        this.report.recommendations.push(

            message

        );

    }

    /**
     * =====================================================
     * Estadísticas
     * =====================================================
     */

    public setStatistics(

        statistics: StatisticsResult

    ): void {

        this.statistics = statistics;

    }

    /**
     * =====================================================
     * Diagnóstico
     * =====================================================
     */

    public setDiagnostics(

        diagnostics: DiagnosticResult

    ): void {

        this.diagnostics = diagnostics;

    }

    /**
     * =====================================================
     * Auditoría
     * =====================================================
     */

    public setAudit(

        audit: AuditResult

    ): void {

        this.audit = audit;

    }

    /**
     * =====================================================
     * Exportación JSON
     * =====================================================
     */

    public toJSON() {

        return {

            valid: this.valid,

            decision: this.decision,

            validation: this.validation,

            report: this.report,

            statistics: this.statistics,

            diagnostics: this.diagnostics,

            audit: this.audit

        };

    }

}
