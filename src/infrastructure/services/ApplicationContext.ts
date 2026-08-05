/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * APPLICATION CONTEXT
 *
 * Punto único de acceso a toda la infraestructura.
 *
 ******************************************************************************/

import { ServiceContainer } from "./ServiceContainer";
import { DependencyResolver } from "./DependencyResolver";
import { ServiceRegistry } from "./ServiceRegistry";
import { LifetimeManager } from "./LifetimeManager";

import { RepositoryContext } from "../persistence/RepositoryContext";

import { EventBus } from "../events/EventBus";
import { EventDispatcher } from "../events/EventDispatcher";
import { EventStore } from "../events/EventStore";

export class ApplicationContext {

    public readonly services: ServiceContainer;

    public readonly resolver: DependencyResolver;

    public readonly registry: ServiceRegistry;

    public readonly lifetime: LifetimeManager;

    public readonly repositories: RepositoryContext;

    public readonly eventBus: EventBus;

    public readonly eventDispatcher: EventDispatcher;

    public readonly eventStore: EventStore;

    constructor() {

        this.services =

            new ServiceContainer();

        this.resolver =

            new DependencyResolver(

                this.services

            );

        this.registry =

            new ServiceRegistry(

                this.services

            );

        this.lifetime =

            new LifetimeManager();

        this.repositories =

            new RepositoryContext();

        this.eventBus =

            new EventBus();

        this.eventDispatcher =

            new EventDispatcher(

                this.eventBus

            );

        this.eventStore =

            new EventStore();

    }

    /**************************************************************************
     *
     * Inicialización
     *
     **************************************************************************/

    public initialize(): void {

        this.registry.registerAll();

    }

    /**************************************************************************
     *
     * Diagnóstico
     *
     **************************************************************************/

    public diagnostics() {

        return {

            services:

                this.registry.diagnostics(),

            repositories:

                this.repositories.diagnostics(),

            lifetimes:

                this.lifetime.diagnostics(),

            events: {

                stored:

                    this.eventStore.count()

            }

        };

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public dispose(): void {

        this.repositories.clearCache();

        this.services.clear();

        this.resolver.clear();

        this.lifetime.clear();

    }

}
