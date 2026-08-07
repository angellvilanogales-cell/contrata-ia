/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ArchitectureBootstrap
 * ------------------------------------------------------------
 * Punto único de inicialización de toda la plataforma.
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

export class ArchitectureBootstrap {
    private readonly context: ArchitectureContext;

    private constructor(context: ArchitectureContext) {
        this.context = context;
    }

    public static create(): ArchitectureBootstrap {
        const container = DependencyContainer.createDefault();
        const eventBus = EventBus.createDefault();
        const validation = ValidationFramework.createDefault();
        const diagnostics = DiagnosticsCenter.createDefault();
        const plugins = PluginManager.createDefault();

        const bootstrap = new ArchitectureBootstrap({
            container,
            eventBus,
            validation,
            diagnostics,
            plugins
        });

        bootstrap.configure();
        return bootstrap;
    }

    private configure(): void {
        this.registerInfrastructure();
        this.registerCoreServices();
        this.registerPlugins();
    }

    private registerInfrastructure(): void {
        const container = this.context.container;

        container.registerInstance(DependencyContainer, container);
        container.registerInstance(EventBus, this.context.eventBus);
        container.registerInstance(ValidationFramework, this.context.validation);
        container.registerInstance(DiagnosticsCenter, this.context.diagnostics);
        container.registerInstance(PluginManager, this.context.plugins);
    }

    private registerCoreServices(): void {
        // Los motores principales se registrarán progresivamente mediante el contenedor canónico.
    }

    private registerPlugins(): void {
        // El PluginManager mantiene el registro de plugins oficiales.
    }

    public context(): Readonly<ArchitectureContext> {
        return this.context;
    }

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

    public async start(): Promise<void> {
        await this.context.plugins.enableAll();
        this.context.container.warmUp();
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

    public async stop(): Promise<void> {
        await this.context.eventBus.publish({
            id: crypto.randomUUID(),
            type: "APPLICATION_STOPPING",
            timestamp: new Date(),
            payload: {}
        });
        await this.context.plugins.disableAll();
    }

    public integrity() {
        const containerValidation = this.context.container.validate();
        return {
            valid: containerValidation.valid,
            container: containerValidation,
            plugins: this.context.plugins.health(),
            diagnostics: this.context.diagnostics.health()
        };
    }

    public health() {
        const integrity = this.integrity();
        return {
            healthy: integrity.valid,
            containerHealthy: integrity.container.valid,
            pluginsHealthy: integrity.plugins.healthy,
            diagnosticsHealthy: integrity.diagnostics.healthy
        };
    }

    public status() {
        return {
            version: this.version(),
            health: this.health(),
            integrity: this.integrity(),
            startedAt: new Date()
        };
    }

    public exportState() {
        return {
            architecture: this.status(),
            diagnostics: this.context.diagnostics.systemStatus(),
            plugins: this.context.plugins.exportState(),
            validation: this.context.validation.info()
        };
    }

    public async reload(): Promise<void> {
        await this.stop();
        this.context.diagnostics.clear();
        await this.start();
    }

    public async reloadPlugins(): Promise<void> {
        await this.context.plugins.disableAll();
        await this.context.plugins.enableAll();
    }

    public async restartEventBus(): Promise<void> {
        await this.context.eventBus.publish({
            id: crypto.randomUUID(),
            type: "EVENTBUS_RESTART",
            timestamp: new Date(),
            payload: {}
        });
    }

    public diagnosticsReport() {
        return {
            architecture: this.status(),
            diagnostics: this.context.diagnostics.systemStatus(),
            validation: this.context.validation.info(),
            plugins: this.context.plugins.info()
        };
    }

    public ready(): boolean {
        return this.health().healthy && this.context.plugins.health().healthy;
    }

    public info() {
        return {
            version: this.version(),
            ready: this.ready(),
            health: this.health(),
            diagnostics: this.context.diagnostics.statistics(),
            plugins: this.context.plugins.statistics()
        };
    }

    public toJSON(): string {
        return JSON.stringify(this.info(), null, 4);
    }

    public static bootstrap(): ArchitectureBootstrap {
        return ArchitectureBootstrap.create();
    }

    public fullInformation() {
        return {
            version: this.version(),
            context: {
                container: this.context.container.info(),
                validation: this.context.validation.info(),
                diagnostics: this.context.diagnostics.info(),
                plugins: this.context.plugins.info()
            },
            status: this.status()
        };
    }

    public exportArchitecture() {
        return {
            bootstrap: this.fullInformation(),
            diagnostics: this.context.diagnostics.export(),
            plugins: this.context.plugins.exportState(),
            validation: this.context.validation.info()
        };
    }

    public version(): string {
        return "1.0.0";
    }

    public build(): string {
        return "Architecture-1.0";
    }

    public application(): string {
        return "Contrata-IA";
    }
}
