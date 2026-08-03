/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ArchitectureBootstrap
 * ------------------------------------------------------------
 *
 * Punto único de inicialización de toda la plataforma.
 *
 * Este componente construye toda la arquitectura,
 * registra los servicios esenciales y devuelve una
 * única instancia preparada para utilizarse.
 *
 * A partir de aquí toda la aplicación deberá obtener
 * sus dependencias desde este Bootstrap.
 * ============================================================
 */

import { DependencyContainer } from "../domain/container/DependencyContainer";
import { EventBus } from "../domain/events/EventBus";
import { ValidationFramework } from "../domain/validation/ValidationFramework";
import { DiagnosticsCenter } from "../domain/diagnostics/DiagnosticsCenter";
import { PluginManager } from "../domain/plugins/PluginManager";

export interface ArchitectureContext {

    readonly container: DependencyContainer;

    readonly eventBus: EventBus;

    readonly validation: ValidationFramework;

    readonly diagnostics: DiagnosticsCenter;

    readonly plugins: PluginManager;

}

/**
 * ============================================================
 * ArchitectureBootstrap
 * ============================================================
 */

export class ArchitectureBootstrap {

    /**
     * Contexto global.
     */
    private readonly context: ArchitectureContext;

    /**
     * Constructor privado.
     */
    private constructor(

        context: ArchitectureContext

    ) {

        this.context = context;

    }

    /**
     * =====================================================
     * FACTORÍA PRINCIPAL
     * =====================================================
     */

    public static create():

        ArchitectureBootstrap {

        const container =

            DependencyContainer.createDefault();

        const eventBus =

            EventBus.createDefault();

        const validation =

            ValidationFramework.createDefault();

        const diagnostics =

            DiagnosticsCenter.createDefault();

        const plugins =

            PluginManager.createDefault();

        const bootstrap =

            new ArchitectureBootstrap({

                container,

                eventBus,

                validation,

                diagnostics,

                plugins

            });

        bootstrap.configure();

        return bootstrap;

    }

    /**
     * =====================================================
     * CONFIGURACIÓN GENERAL
     * =====================================================
     */

    private configure(): void {

        this.registerInfrastructure();

        this.registerCoreServices();

        this.registerPlugins();

    }

}

    /**
     * =====================================================
     * REGISTRO DE INFRAESTRUCTURA
     * =====================================================
     */

    private registerInfrastructure(): void {

        const container = this.context.container;

        /*
         * Registrar el propio contenedor.
         */
        container.registerInstance(
            DependencyContainer,
            container
        );

        /*
         * EventBus
         */
        container.registerInstance(
            EventBus,
            this.context.eventBus
        );

        /*
         * Validation Framework
         */
        container.registerInstance(
            ValidationFramework,
            this.context.validation
        );

        /*
         * Diagnostics Center
         */
        container.registerInstance(
            DiagnosticsCenter,
            this.context.diagnostics
        );

        /*
         * Plugin Manager
         */
        container.registerInstance(
            PluginManager,
            this.context.plugins
        );

    }

    /**
     * =====================================================
     * REGISTRO DEL NÚCLEO
     * =====================================================
     */

    private registerCoreServices(): void {

        /**
         * En este método se registrarán
         * progresivamente todos los motores
         * principales de Contrata-IA.
         *
         * Ejemplo:
         *
         * container.register(...)
         *
         * RuleEngine
         * ResolverRegistry
         * DecisionEngine
         * KnowledgeRepository
         * WorkflowEngine
         * DocumentComposer
         */

    }

    /**
     * =====================================================
     * REGISTRO DE PLUGINS
     * =====================================================
     */

    private registerPlugins(): void {

        /**
         * Registro automático de plugins
         * oficiales.
         *
         * Esta sección será utilizada por:
         *
         * LCSPPlugin
         * CPVPlugin
         * JuntaPlugin
         * BOEPlugin
         * TEDPlugin
         * IAPlugin
         */

    }

    /**
     * =====================================================
     * ACCESO AL CONTEXTO
     * =====================================================
     */

    public context(): Readonly<ArchitectureContext> {

        return this.context;

    }

    /**
     * =====================================================
     * GETTERS
     * =====================================================
     */

    public container(): DependencyContainer {

        return this.context.container;

    }

    public eventBus(): EventBus {

        return this.context.eventBus;

    }

    public validation(): ValidationFramework {

        return this.context.validation;

    }

    public diagnostics(): DiagnosticsCenter {

        return this.context.diagnostics;

    }

    public plugins(): PluginManager {

        return this.context.plugins;

    }

    /**
     * =====================================================
     * ARRANQUE DEL SISTEMA
     * =====================================================
     */

    public async start(): Promise<void> {

        /*
         * Inicializar plugins oficiales.
         */
        await this.context.plugins.enableAll();

        /*
         * Precalentar servicios Singleton.
         */
        this.context.container.warmUp();

        /*
         * Registrar evento de inicio.
         */
        await this.context.eventBus.publish({

            id: crypto.randomUUID(),

            type: "APPLICATION_STARTED",

            timestamp: new Date(),

            payload: {

                version: this.version(),

                environment: "production"

            }

        });

    }

    /**
     * =====================================================
     * PARADA CONTROLADA
     * =====================================================
     */

    public async stop(): Promise<void> {

        await this.context.eventBus.publish({

            id: crypto.randomUUID(),

            type: "APPLICATION_STOPPING",

            timestamp: new Date(),

            payload: {}

        });

        await this.context.plugins.disableAll();

    }

    /**
     * =====================================================
     * COMPROBACIÓN DE INTEGRIDAD
     * =====================================================
     */

    public integrity() {

        const containerValidation =

            this.context.container.validate();

        return {

            valid:

                containerValidation.valid,

            container:

                containerValidation,

            plugins:

                this.context.plugins.health(),

            diagnostics:

                this.context.diagnostics.health()

        };

    }

    /**
     * =====================================================
     * HEALTH GENERAL
     * =====================================================
     */

    public health() {

        const integrity =

            this.integrity();

        return {

            healthy:

                integrity.valid,

            containerHealthy:

                integrity.container.valid,

            pluginsHealthy:

                integrity.plugins.healthy,

            diagnosticsHealthy:

                integrity.diagnostics.healthy

        };

    }

    /**
     * =====================================================
     * ESTADO DEL SISTEMA
     * =====================================================
     */

    public status() {

        return {

            version:

                this.version(),

            health:

                this.health(),

            integrity:

                this.integrity(),

            startedAt:

                new Date()

        };

    }

    /**
     * =====================================================
     * EXPORTACIÓN DEL ESTADO
     * =====================================================
     */

    public exportState() {

        return {

            architecture:

                this.status(),

            diagnostics:

                this.context.diagnostics.systemStatus(),

            plugins:

                this.context.plugins.exportState(),

            validation:

                this.context.validation.info()

        };

    }

    /**
     * =====================================================
     * RECARGA COMPLETA DE LA ARQUITECTURA
     * =====================================================
     */

    public async reload(): Promise<void> {

        await this.stop();

        this.context.diagnostics.clear();

        await this.start();

    }

    /**
     * =====================================================
     * REINICIO DE PLUGINS
     * =====================================================
     */

    public async reloadPlugins(): Promise<void> {

        await this.context.plugins.disableAll();

        await this.context.plugins.enableAll();

    }

    /**
     * =====================================================
     * REINICIO DEL BUS DE EVENTOS
     * =====================================================
     */

    public async restartEventBus(): Promise<void> {

        await this.context.eventBus.publish({

            id: crypto.randomUUID(),

            type: "EVENTBUS_RESTART",

            timestamp: new Date(),

            payload: {}

        });

    }

    /**
     * =====================================================
     * EJECUTAR DIAGNÓSTICO GENERAL
     * =====================================================
     */

    public diagnosticsReport() {

        return {

            architecture:

                this.status(),

            diagnostics:

                this.context.diagnostics.systemStatus(),

            validation:

                this.context.validation.info(),

            plugins:

                this.context.plugins.info()

        };

    }

    /**
     * =====================================================
     * COMPROBAR PREPARACIÓN DEL SISTEMA
     * =====================================================
     */

    public ready(): boolean {

        return (

            this.health().healthy &&

            this.context.plugins.health().healthy

        );

    }

    /**
     * =====================================================
     * INFORMACIÓN DEL BOOTSTRAP
     * =====================================================
     */

    public info() {

        return {

            version:

                this.version(),

            ready:

                this.ready(),

            health:

                this.health(),

            diagnostics:

                this.context.diagnostics.statistics(),

            plugins:

                this.context.plugins.statistics()

        };

    }

    /**
     * =====================================================
     * SERIALIZACIÓN
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.info(),

            null,

            4

        );

    }

    /**
     * =====================================================
     * FACTORÍA GLOBAL
     * =====================================================
     */

    public static bootstrap():

        ArchitectureBootstrap {

        return ArchitectureBootstrap.create();

    }

    /**
     * =====================================================
     * INFORMACIÓN COMPLETA
     * =====================================================
     */

    public fullInformation() {

        return {

            version:

                this.version(),

            context: {

                container:

                    this.context.container.info(),

                validation:

                    this.context.validation.info(),

                diagnostics:

                    this.context.diagnostics.info(),

                plugins:

                    this.context.plugins.info()

            },

            status:

                this.status()

        };

    }

    /**
     * =====================================================
     * EXPORTACIÓN COMPLETA
     * =====================================================
     */

    public exportArchitecture() {

        return {

            bootstrap:

                this.fullInformation(),

            diagnostics:

                this.context.diagnostics.export(),

            plugins:

                this.context.plugins.exportState(),

            validation:

                this.context.validation.info()

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

    /**
     * =====================================================
     * BUILD
     * =====================================================
     */

    public build(): string {

        return "Architecture-1.0";

    }

    /**
     * =====================================================
     * NOMBRE
     * =====================================================
     */

    public application(): string {

        return "Contrata-IA";

    }

    /**
     * =====================================================
     * CIERRE
     * =====================================================
     */

}

