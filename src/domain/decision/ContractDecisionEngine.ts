/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ContractDecisionEngine
 * ------------------------------------------------------------
 *
 * Núcleo de orquestación del sistema.
 *
 * RESPONSABILIDADES
 *
 * • Coordinar todos los Resolvers.
 * • Gestionar el ciclo completo de decisión.
 * • Resolver dependencias entre motores.
 * • Agregar resultados.
 * • Detectar conflictos.
 * • Construir la decisión final.
 *
 * IMPORTANTE
 *
 * Este componente NO contiene reglas jurídicas.
 *
 * NO conoce la LCSP.
 *
 * NO conoce CPV.
 *
 * NO conoce procedimientos.
 *
 * Toda la inteligencia reside en los Resolvers y en
 * el sistema de conocimiento.
 * ============================================================
 */

import { DecisionContext } from "../DecisionContext";
import { BaseResolver } from "../resolvers/BaseResolver";

/**
 * Resultado producido por un Resolver.
 */
export interface ResolverExecutionResult<T = unknown> {

    /**
     * Nombre del resolver.
     */
    resolver: string;

    /**
     * Resultado.
     */
    value: T;

    /**
     * Tiempo de ejecución.
     */
    executionTime: number;

    /**
     * Prioridad.
     */
    priority: number;

    /**
     * Dependencias satisfechas.
     */
    dependencies: string[];

}

/**
 * Resultado global del motor.
 */
export interface ContractDecision {

    /**
     * Contexto utilizado.
     */
    context: DecisionContext;

    /**
     * Resultados individuales.
     */
    results: ResolverExecutionResult[];

    /**
     * Fecha.
     */
    timestamp: Date;

}

/**
 * Resolver registrado.
 */
interface RegisteredResolver {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Instancia.
     */
    resolver: BaseResolver<any>;

    /**
     * Prioridad.
     */
    priority: number;

    /**
     * Dependencias.
     */
    dependsOn: string[];

}

/**
 * ============================================================
 * MOTOR PRINCIPAL
 * ============================================================
 */

export class ContractDecisionEngine {

    /**
     * Registro de motores.
     */
    private readonly resolvers:

        RegisteredResolver[] = [];

    /**
     * Registro de resultados.
     */
    private readonly results:

        ResolverExecutionResult[] = [];

    /**
     * Contexto activo.
     */
    private context?: DecisionContext;

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public register(

        id: string,

        resolver: BaseResolver<any>,

        priority = 100,

        dependsOn: string[] = []

    ): void {

        this.resolvers.push({

            id,

            resolver,

            priority,

            dependsOn

        });

        this.sortResolvers();

    }

    /**
     * =====================================================
     * ELIMINACIÓN
     * =====================================================
     */

    public unregister(

        id: string

    ): void {

        const index =

            this.resolvers.findIndex(

                r => r.id === id

            );

        if (index >= 0) {

            this.resolvers.splice(

                index,

                1

            );

        }

    }

    /**
     * =====================================================
     * LISTADO
     * =====================================================
     */

    public registeredResolvers():

        string[] {

        return this.resolvers.map(

            r => r.id

        );

    }

    /**
     * =====================================================
     * ORDENACIÓN
     * =====================================================
     */

    private sortResolvers(): void {

        this.resolvers.sort(

            (a, b) =>

                a.priority - b.priority

        );

    }

      /**
     * =====================================================
     * EJECUCIÓN PRINCIPAL
     * =====================================================
     */

    public execute(

        context: DecisionContext

    ): ContractDecision {

        this.context = context;

        this.results.length = 0;

        for (

            const registered of

            this.resolvers

        ) {

            this.executeResolver(

                registered

            );

        }

        return {

            context,

            results: [

                ...this.results

            ],

            timestamp:

                new Date()

        };

    }

    /**
     * =====================================================
     * EJECUCIÓN DE UN RESOLVER
     * =====================================================
     */

    private executeResolver(

        registered: RegisteredResolver

    ): void {

        if (

            !this.dependenciesSatisfied(

                registered

            )

        ) {

            return;

        }

        const start =

            performance.now();

        const value =

            registered.resolver.resolve(

                this.context!

            );

        const end =

            performance.now();

        this.results.push({

            resolver:

                registered.id,

            value,

            executionTime:

                end - start,

            priority:

                registered.priority,

            dependencies:

                [...registered.dependsOn]

        });

    }

    /**
     * =====================================================
     * DEPENDENCIAS
     * =====================================================
     */

    private dependenciesSatisfied(

        registered: RegisteredResolver

    ): boolean {

        if (

            registered.dependsOn.length === 0

        ) {

            return true;

        }

        for (

            const dependency of

            registered.dependsOn

        ) {

            const executed =

                this.results.some(

                    result =>

                        result.resolver ===

                        dependency

                );

            if (!executed) {

                return false;

            }

        }

        return true;

    }

    /**
     * =====================================================
     * REEJECUCIÓN
     * =====================================================
     */

    public reExecute(

        resolverId: string

    ): void {

        const resolver =

            this.resolvers.find(

                r =>

                    r.id === resolverId

            );

        if (!resolver) {

            return;

        }

        this.results.splice(

            this.results.findIndex(

                r =>

                    r.resolver === resolverId

            ),

            1

        );

        this.executeResolver(

            resolver

        );

    }

    /**
     * =====================================================
     * LIMPIEZA
     * =====================================================
     */

    public clear(): void {

        this.results.length = 0;

        this.context = undefined;

    }

    /**
     * =====================================================
     * CONTEXTO ACTUAL
     * =====================================================
     */

    public currentContext():

        DecisionContext | undefined {

        return this.context;

    }

    /**
     * =====================================================
     * RESULTADOS ACTUALES
     * =====================================================
     */

    public currentResults():

        ResolverExecutionResult[] {

        return [

            ...this.results

        ];

    }
    /**
     * =====================================================
     * OBTENER RESULTADO DE UN RESOLVER
     * =====================================================
     */

    public resultOf<T = unknown>(

        resolverId: string

    ): T | undefined {

        const result =

            this.results.find(

                r =>

                    r.resolver === resolverId

            );

        if (!result) {

            return undefined;

        }

        return result.value as T;

    }

    /**
     * =====================================================
     * COMPROBAR EJECUCIÓN
     * =====================================================
     */

    public hasExecuted(

        resolverId: string

    ): boolean {

        return this.results.some(

            r =>

                r.resolver === resolverId

        );

    }

    /**
     * =====================================================
     * AGREGACIÓN DE RESULTADOS
     * =====================================================
     */

    public aggregate():

        Record<string, unknown> {

        const aggregated:

            Record<string, unknown> = {};

        for (

            const result of

            this.results

        ) {

            aggregated[

                result.resolver

            ] = result.value;

        }

        return aggregated;

    }

    /**
     * =====================================================
     * DETECCIÓN DE CONFLICTOS
     * =====================================================
     */

    public detectConflicts():

        ResolverConflict[] {

        const conflicts:

            ResolverConflict[] = [];

        const values =

            new Map<string, unknown>();

        for (

            const result of

            this.results

        ) {

            const previous =

                values.get(

                    result.resolver

                );

            if (

                previous !== undefined &&

                previous !== result.value

            ) {

                conflicts.push({

                    resolver:

                        result.resolver,

                    expected:

                        previous,

                    received:

                        result.value

                });

            }

            values.set(

                result.resolver,

                result.value

            );

        }

        return conflicts;

    }

    /**
     * =====================================================
     * EXISTEN CONFLICTOS
     * =====================================================
     */

    public hasConflicts():

        boolean {

        return (

            this.detectConflicts()

                .length > 0

        );

    }

    /**
     * =====================================================
     * RESUMEN
     * =====================================================
     */

    public summary() {

        return {

            executedResolvers:

                this.results.length,

            registeredResolvers:

                this.resolvers.length,

            conflicts:

                this.detectConflicts()

                    .length,

            executionTime:

                this.totalExecutionTime()

        };

    }

    /**
     * =====================================================
     * TIEMPO TOTAL
     * =====================================================
     */

    public totalExecutionTime():

        number {

        return this.results.reduce(

            (total, result) =>

                total +

                result.executionTime,

            0

        );

    }

    /**
     * =====================================================
     * ORDEN DE EJECUCIÓN
     * =====================================================
     */

    public executionOrder():

        string[] {

        return this.results.map(

            result =>

                result.resolver

        );

    }


      /**
     * =====================================================
     * EVENTOS
     * =====================================================
     */

    private readonly emittedEvents:

        DecisionEvent[] = [];

    /**
     * Registra un evento interno.
     */
    private emit(

        type: DecisionEventType,

        payload?: unknown

    ): void {

        this.emittedEvents.push({

            type,

            timestamp: new Date(),

            payload

        });

    }

    /**
     * Obtiene todos los eventos.
     */
    public events():

        readonly DecisionEvent[] {

        return this.emittedEvents;

    }

    /**
     * Limpia eventos.
     */
    public clearEvents(): void {

        this.emittedEvents.length = 0;

    }

    /**
     * =====================================================
     * MÉTRICAS
     * =====================================================
     */

    private readonly metrics = {

        executions: 0,

        resolverExecutions: 0,

        totalExecutionTime: 0,

        averageExecutionTime: 0,

        conflictsDetected: 0

    };

    /**
     * Actualiza métricas.
     */
    private updateMetrics(): void {

        this.metrics.executions++;

        this.metrics.resolverExecutions +=

            this.results.length;

        const executionTime =

            this.totalExecutionTime();

        this.metrics.totalExecutionTime +=

            executionTime;

        this.metrics.averageExecutionTime =

            this.metrics.totalExecutionTime /

            this.metrics.executions;

        this.metrics.conflictsDetected +=

            this.detectConflicts().length;

    }

    /**
     * Devuelve métricas.
     */
    public getMetrics() {

        return {

            ...this.metrics

        };

    }

    /**
     * Reinicia métricas.
     */
    public resetMetrics(): void {

        this.metrics.executions = 0;

        this.metrics.resolverExecutions = 0;

        this.metrics.totalExecutionTime = 0;

        this.metrics.averageExecutionTime = 0;

        this.metrics.conflictsDetected = 0;

    }

    /**
     * =====================================================
     * AUDITORÍA
     * =====================================================
     */

    public auditTrail():

        DecisionAuditEntry[] {

        return this.results.map(

            result => ({

                resolver:

                    result.resolver,

                executedAt:

                    new Date(),

                executionTime:

                    result.executionTime,

                priority:

                    result.priority,

                dependencies:

                    [...result.dependencies]

            })

        );

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public exportDecision():

        ContractDecision {

        return {

            context:

                this.context!,

            results:

                [...this.results],

            timestamp:

                new Date()

        };

    }

      /**
     * =====================================================
     * VALIDACIÓN INTERNA
     * =====================================================
     */

    public validate(): EngineValidationResult {

        const errors: string[] = [];

        if (!this.context) {

            errors.push(

                "DecisionContext no inicializado."

            );

        }

        if (this.resolvers.length === 0) {

            errors.push(

                "No existen resolvers registrados."

            );

        }

        for (const resolver of this.resolvers) {

            for (const dependency of resolver.dependsOn) {

                const exists = this.resolvers.some(

                    r => r.id === dependency

                );

                if (!exists) {

                    errors.push(

                        `La dependencia '${dependency}' del resolver '${resolver.id}' no existe.`

                    );

                }

            }

        }

        return {

            valid:

                errors.length === 0,

            errors

        };

    }

    /**
     * =====================================================
     * COMPROBACIÓN DE INTEGRIDAD
     * =====================================================
     */

    public healthCheck(): EngineHealthStatus {

        const validation =

            this.validate();

        return {

            healthy:

                validation.valid,

            registeredResolvers:

                this.resolvers.length,

            executedResolvers:

                this.results.length,

            activeContext:

                this.context !== undefined,

            cacheSize:

                this.results.length,

            errors:

                validation.errors

        };

    }

    /**
     * =====================================================
     * RECUPERACIÓN
     * =====================================================
     */

    public reset(): void {

        this.clear();

        this.clearEvents();

        this.resetMetrics();

    }

    /**
     * =====================================================
     * DIAGNÓSTICO COMPLETO
     * =====================================================
     */

    public diagnostics() {

        return {

            summary:

                this.summary(),

            validation:

                this.validate(),

            health:

                this.healthCheck(),

            metrics:

                this.getMetrics(),

            audit:

                this.auditTrail(),

            conflicts:

                this.detectConflicts(),

            executionOrder:

                this.executionOrder(),

            registeredResolvers:

                this.registeredResolvers()

        };

    }

    /**
     * =====================================================
     * TRAZABILIDAD
     * =====================================================
     */

    public trace(

        resolverId: string

    ): ResolverExecutionResult | undefined {

        return this.results.find(

            r =>

                r.resolver === resolverId

        );

    }

    /**
     * =====================================================
     * EXPORTACIÓN JSON
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.exportDecision(),

            null,

            4

        );

    }


      /**
     * =====================================================
     * MODO DEBUG
     * =====================================================
     */

    private debug = false;

    /**
     * Activa o desactiva el modo debug.
     */
    public enableDebug(

        enabled = true

    ): void {

        this.debug = enabled;

    }

    /**
     * Estado del debug.
     */
    public isDebugEnabled(): boolean {

        return this.debug;

    }

    /**
     * =====================================================
     * LOG INTERNO
     * =====================================================
     */

    private log(

        message: string

    ): void {

        if (!this.debug) {

            return;

        }

        console.log(

            `[ContractDecisionEngine] ${message}`

        );

    }

    /**
     * =====================================================
     * EJECUCIÓN SEGURA
     * =====================================================
     */

    private safeExecute(

        resolver: RegisteredResolver

    ): void {

        try {

            this.log(

                `Ejecutando ${resolver.id}`

            );

            this.executeResolver(

                resolver

            );

            this.emit(

                DecisionEventType.RESOLVER_EXECUTED,

                resolver.id

            );

        }

        catch (error) {

            this.emit(

                DecisionEventType.CONFLICT_DETECTED,

                {

                    resolver:

                        resolver.id,

                    error

                }

            );

            console.error(

                error

            );

        }

    }

    /**
     * =====================================================
     * EJECUCIÓN COMPLETA
     * =====================================================
     */

    public run(

        context: DecisionContext

    ): ContractDecision {

        this.emit(

            DecisionEventType.ENGINE_STARTED

        );

        this.context = context;

        this.results.length = 0;

        for (

            const resolver of

            this.resolvers

        ) {

            this.safeExecute(

                resolver

            );

        }

        this.updateMetrics();

        this.emit(

            DecisionEventType.ENGINE_FINISHED

        );

        return this.exportDecision();

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

