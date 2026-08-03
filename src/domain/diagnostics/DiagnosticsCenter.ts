/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DiagnosticsCenter
 * ------------------------------------------------------------
 *
 * Centro único de diagnóstico del sistema.
 *
 * RESPONSABILIDADES
 *
 * • Consultar el estado de todos los componentes.
 * • Obtener métricas.
 * • Detectar errores.
 * • Detectar advertencias.
 * • Generar informes.
 * • Comprobar la integridad del sistema.
 *
 * IMPORTANTE
 *
 * Este componente NO contiene normativa.
 *
 * Su única responsabilidad es supervisar el estado
 * completo de Contrata-IA.
 * ============================================================
 */

export enum DiagnosticLevel {

    INFO = "INFO",

    WARNING = "WARNING",

    ERROR = "ERROR"

}

/**
 * Entrada de diagnóstico.
 */
export interface DiagnosticEntry {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Componente.
     */
    component: string;

    /**
     * Nivel.
     */
    level: DiagnosticLevel;

    /**
     * Mensaje.
     */
    message: string;

    /**
     * Fecha.
     */
    timestamp: Date;

}

/**
 * Resultado global.
 */
export interface DiagnosticReport {

    /**
     * Sistema correcto.
     */
    healthy: boolean;

    /**
     * Entradas.
     */
    entries: DiagnosticEntry[];

}

/**
 * ============================================================
 * DiagnosticsCenter
 * ============================================================
 */

export class DiagnosticsCenter {

    /**
     * Registro.
     */
    private readonly entries:

        DiagnosticEntry[] = [];

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public add(

        entry: DiagnosticEntry

    ): void {

        this.entries.push(

            entry

        );

    }

    /**
     * =====================================================
     * LIMPIEZA
     * =====================================================
     */

    public clear(): void {

        this.entries.length = 0;

    }

    /**
     * =====================================================
     * TOTAL
     * =====================================================
     */

    public count(): number {

        return this.entries.length;

    }

    /**
     * =====================================================
     * LISTADO
     * =====================================================
     */

    public all():

        readonly DiagnosticEntry[] {

        return this.entries;

    }

    /**
     * =====================================================
     * ESTADO GENERAL
     * =====================================================
     */

    public report():

        DiagnosticReport {

        return {

            healthy:

                !this.entries.some(

                    entry =>

                        entry.level ===

                        DiagnosticLevel.ERROR

                ),

            entries:

                [...this.entries]

        };

    }

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
     * FILTRAR POR NIVEL
     * =====================================================
     */

    public byLevel(

        level: DiagnosticLevel

    ): DiagnosticEntry[] {

        return this.entries.filter(

            entry =>

                entry.level === level

        );

    }

    /**
     * =====================================================
     * FILTRAR POR RANGO DE FECHAS
     * =====================================================
     */

    public between(

        from: Date,

        to: Date

    ): DiagnosticEntry[] {

        return this.entries.filter(

            entry =>

                entry.timestamp >= from &&

                entry.timestamp <= to

        );

    }

    /**
     * =====================================================
     * ÚLTIMA INCIDENCIA
     * =====================================================
     */

    public last():

        DiagnosticEntry | undefined {

        if (

            this.entries.length === 0

        ) {

            return undefined;

        }

        return this.entries[

            this.entries.length - 1

        ];

    }

    /**
     * =====================================================
     * CONTADORES
     * =====================================================
     */

    public statistics() {

        return {

            total:

                this.entries.length,

            info:

                this.byLevel(

                    DiagnosticLevel.INFO

                ).length,

            warnings:

                this.byLevel(

                    DiagnosticLevel.WARNING

                ).length,

            errors:

                this.byLevel(

                    DiagnosticLevel.ERROR

                ).length

        };

    }

    /**
     * =====================================================
     * RESUMEN POR COMPONENTE
     * =====================================================
     */

    public componentSummary() {

        const summary =

            new Map<

                string,

                number

            >();

        for (

            const entry of this.entries

        ) {

            summary.set(

                entry.component,

                (

                    summary.get(

                        entry.component

                    ) ?? 0

                ) + 1

            );

        }

        return Object.fromEntries(

            summary

        );

    }

    /**
     * =====================================================
     * COMPONENTES CON ERRORES
     * =====================================================
     */

    public componentsWithErrors():

        string[] {

        return [

            ...new Set(

                this.byLevel(

                    DiagnosticLevel.ERROR

                ).map(

                    entry =>

                        entry.component

                )

            )

        ];

    }

    /**
     * =====================================================
     * COMPONENTES CON AVISOS
     * =====================================================
     */

    public componentsWithWarnings():

        string[] {

        return [

            ...new Set(

                this.byLevel(

                    DiagnosticLevel.WARNING

                ).map(

                    entry =>

                        entry.component

                )

            )

        ];

    }

    /**
     * =====================================================
     * AUDITORÍA
     * =====================================================
     */

    public audit() {

        return {

            generatedAt: new Date(),

            totalEntries: this.entries.length,

            healthy: this.report().healthy,

            statistics: this.statistics(),

            componentSummary: this.componentSummary()

        };

    }

    /**
     * =====================================================
     * MÉTRICAS AVANZADAS
     * =====================================================
     */

    public metrics() {

        const oldest =

            this.entries.length > 0

                ? this.entries[0].timestamp

                : undefined;

        const newest =

            this.entries.length > 0

                ? this.entries[

                    this.entries.length - 1

                ].timestamp

                : undefined;

        return {

            totalEntries:

                this.entries.length,

            oldestEntry:

                oldest,

            newestEntry:

                newest,

            uniqueComponents:

                new Set(

                    this.entries.map(

                        e => e.component

                    )

                ).size,

            errorRatio:

                this.entries.length === 0

                    ? 0

                    : this.byLevel(

                        DiagnosticLevel.ERROR

                    ).length /

                    this.entries.length

        };

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export() {

        return {

            report:

                this.report(),

            audit:

                this.audit(),

            metrics:

                this.metrics()

        };

    }

    /**
     * =====================================================
     * IMPORTACIÓN
     * =====================================================
     */

    public import(

        entries:

            DiagnosticEntry[]

    ): void {

        this.clear();

        this.entries.push(

            ...entries

        );

    }

    /**
     * =====================================================
     * ELIMINAR COMPONENTE
     * =====================================================
     */

    public removeComponent(

        component: string

    ): void {

        const remaining =

            this.entries.filter(

                entry =>

                    entry.component !== component

            );

        this.entries.length = 0;

        this.entries.push(

            ...remaining

        );

    }

    /**
     * =====================================================
     * ELIMINAR NIVEL
     * =====================================================
     */

    public removeLevel(

        level: DiagnosticLevel

    ): void {

        const remaining =

            this.entries.filter(

                entry =>

                    entry.level !== level

            );

        this.entries.length = 0;

        this.entries.push(

            ...remaining

        );

    }

    /**
     * =====================================================
     * BÚSQUEDA POR TEXTO
     * =====================================================
     */

    public search(

        text: string

    ): DiagnosticEntry[] {

        const query =

            text.toLowerCase();

        return this.entries.filter(

            entry =>

                entry.message

                    .toLowerCase()

                    .includes(query)

        );

    }

    /**
     * =====================================================
     * LIMPIEZA AUTOMÁTICA
     * =====================================================
     */

    public purgeOlderThan(

        date: Date

    ): number {

        const originalSize =

            this.entries.length;

        const remaining =

            this.entries.filter(

                entry =>

                    entry.timestamp >= date

            );

        this.entries.length = 0;

        this.entries.push(

            ...remaining

        );

        return originalSize -

            remaining.length;

    }

    /**
     * =====================================================
     * LÍMITE DE HISTORIAL
     * =====================================================
     */

    public keepLast(

        maxEntries: number

    ): void {

        if (

            this.entries.length <= maxEntries

        ) {

            return;

        }

        const remaining =

            this.entries.slice(

                this.entries.length -

                maxEntries

            );

        this.entries.length = 0;

        this.entries.push(

            ...remaining

        );

    }

    /**
     * =====================================================
     * COMPONENTES REGISTRADOS
     * =====================================================
     */

    public registeredComponents():

        string[] {

        return [

            ...new Set(

                this.entries.map(

                    entry =>

                        entry.component

                )

            )

        ].sort();

    }

    /**
     * =====================================================
     * ERRORES CRÍTICOS
     * =====================================================
     */

    public criticalErrors():

        DiagnosticEntry[] {

        return this.entries.filter(

            entry =>

                entry.level ===

                DiagnosticLevel.ERROR

        );

    }

    /**
     * =====================================================
     * AVISOS ACTIVOS
     * =====================================================
     */

    public activeWarnings():

        DiagnosticEntry[] {

        return this.entries.filter(

            entry =>

                entry.level ===

                DiagnosticLevel.WARNING

        );

    }

    /**
     * =====================================================
     * COMPROBACIÓN GENERAL
     * =====================================================
     */

    public checkHealth() {

        const errors =

            this.criticalErrors();

        return {

            healthy:

                errors.length === 0,

            errorCount:

                errors.length,

            warningCount:

                this.activeWarnings().length,

            componentCount:

                this.registeredComponents().length

        };

    }

    /**
     * =====================================================
     * RESUMEN EJECUTIVO
     * =====================================================
     */

    public executiveSummary() {

        return {

            generated:

                new Date(),

            health:

                this.checkHealth(),

            metrics:

                this.metrics(),

            audit:

                this.audit()

        };

    }

    /**
     * =====================================================
     * IMPRIMIR RESUMEN
     * =====================================================
     */

    public printSummary(): void {

        console.table(

            this.executiveSummary()

        );

    }

    /**
     * =====================================================
     * FACTORÍA POR DEFECTO
     * =====================================================
     */

    public static createDefault():

        DiagnosticsCenter {

        const diagnostics =

            new DiagnosticsCenter();

        /**
         * Aquí podrán registrarse
         * comprobaciones automáticas del sistema.
         *
         * Ejemplos futuros:
         *
         * - DependencyContainer
         * - EventBus
         * - ResolverRegistry
         * - ValidationFramework
         * - DecisionEngine
         * - KnowledgeRepository
         */

        return diagnostics;

    }

    /**
     * =====================================================
     * ESTADO DEL SISTEMA
     * =====================================================
     */

    public systemStatus() {

        return {

            report:

                this.report(),

            health:

                this.checkHealth(),

            statistics:

                this.statistics(),

            metrics:

                this.metrics(),

            audit:

                this.audit()

        };

    }

    /**
     * =====================================================
     * SERIALIZACIÓN
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.systemStatus(),

            null,

            4

        );

    }

    /**
     * =====================================================
     * INFORMACIÓN
     * =====================================================
     */

    public info() {

        return {

            version:

                this.version(),

            registeredComponents:

                this.registeredComponents(),

            health:

                this.checkHealth(),

            entries:

                this.count()

        };

    }

    /**
     * =====================================================
     * VERSIÓN
     * =====================================================
     */

    public version(): string {

        return "1.0.0";

    }

}
