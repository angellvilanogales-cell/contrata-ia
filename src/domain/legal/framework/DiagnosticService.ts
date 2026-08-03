/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DiagnosticService
 * ------------------------------------------------------------
 * Servicio centralizado de diagnóstico.
 *
 * Todos los motores jurídicos publican aquí
 * su estado interno.
 *
 * ============================================================
 */

import { UUID } from "../../common/types";

export interface DiagnosticEntry {

    id: UUID;

    component: string;

    status: "OK" | "WARNING" | "ERROR";

    message: string;

    timestamp: Date;

    data?: unknown;

}

export interface DiagnosticReport {

    generatedAt: Date;

    total: number;

    ok: number;

    warnings: number;

    errors: number;

    entries: DiagnosticEntry[];

}

export class DiagnosticService {

    /**
     * Entradas registradas.
     */
    private readonly entries: DiagnosticEntry[] = [];

    /**
     * =====================================================
     * REGISTRO GENÉRICO
     * =====================================================
     */

    public log(

        component: string,

        status: "OK" | "WARNING" | "ERROR",

        message: string,

        data?: unknown

    ): void {

        this.entries.push({

            id: crypto.randomUUID() as UUID,

            component,

            status,

            message,

            timestamp: new Date(),

            data

        });

    }

    /**
     * =====================================================
     * OK
     * =====================================================
     */

    public ok(

        component: string,

        message: string,

        data?: unknown

    ): void {

        this.log(

            component,

            "OK",

            message,

            data

        );

    }

    /**
     * =====================================================
     * WARNING
     * =====================================================
     */

    public warning(

        component: string,

        message: string,

        data?: unknown

    ): void {

        this.log(

            component,

            "WARNING",

            message,

            data

        );

    }

    /**
     * =====================================================
     * ERROR
     * =====================================================
     */

    public error(

        component: string,

        message: string,

        data?: unknown

    ): void {

        this.log(

            component,

            "ERROR",

            message,

            data

        );

    }

    /**
     * =====================================================
     * HISTORIAL
     * =====================================================
     */

    public history()

    : ReadonlyArray<DiagnosticEntry> {

        return this.entries;

    }

    /**
     * =====================================================
     * FILTRAR POR COMPONENTE
     * =====================================================
     */

    public byComponent(

        component: string

    ): DiagnosticEntry[] {

        return this.entries.filter(

            entry =>

                entry.component === component

        );

    }

    /**
     * =====================================================
     * FILTRAR POR ESTADO
     * =====================================================
     */

    public byStatus(

        status: "OK" | "WARNING" | "ERROR"

    ): DiagnosticEntry[] {

        return this.entries.filter(

            entry =>

                entry.status === status

        );

    }

    /**
     * =====================================================
     * CONTADORES
     * =====================================================
     */

    public total(): number {

        return this.entries.length;

    }

    public okCount(): number {

        return this.byStatus("OK").length;

    }

    public warningCount(): number {

        return this.byStatus("WARNING").length;

    }

    public errorCount(): number {

        return this.byStatus("ERROR").length;

    }

    /**
     * =====================================================
     * ¿SISTEMA SANO?
     * =====================================================
     */

    public healthy(): boolean {

        return this.errorCount() === 0;

    }

    /**
     * =====================================================
     * INFORME
     * =====================================================
     */

    public report()

    : DiagnosticReport {

        return {

            generatedAt: new Date(),

            total: this.total(),

            ok: this.okCount(),

            warnings: this.warningCount(),

            errors: this.errorCount(),

            entries: [...this.entries]

        };

    }

    /**
     * =====================================================
     * LIMPIAR
     * =====================================================
     */

    public clear(): void {

        this.entries.length = 0;

    }

}
