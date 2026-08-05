/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * SERVICE REGISTRY
 *
 ******************************************************************************/

import { ServiceContainer } from "./ServiceContainer";
import { RepositoryContext } from "../persistence/RepositoryContext";
import { AIManager } from "../ai/AIManager";
import { WorkflowEngine } from "../../application/workflow/WorkflowEngine";
import { RuleEngine } from "../../domain/conocimiento/RuleEngine";
import { CostEstimator } from "../../application/services/CostEstimator";
import { ConfigurationManager } from "../config/ConfigManager";

export class ServiceRegistry {

    constructor(

        private readonly container: ServiceContainer

    ) {

    }

    /**************************************************************************
     *
     * Registro completo
     *
     **************************************************************************/

    public registerAll(): void {

        this.registerInfrastructure();

        this.registerRepositories();

        this.registerDomain();

        this.registerApplication();

    }

    /**************************************************************************
     *
     * Infrastructure
     *
     **************************************************************************/

    private registerInfrastructure(): void {

        this.container.registerSingleton(

            "ConfigurationManager",

            () => new ConfigurationManager()

        );

    }

    /**************************************************************************
     *
     * Repositories
     *
     **************************************************************************/

    private registerRepositories(): void {

        this.container.registerSingleton(

            "RepositoryContext",

            () => new RepositoryContext()

        );

    }

    /**************************************************************************
     *
     * Domain
     *
     **************************************************************************/

    private registerDomain(): void {

        this.container.registerSingleton(

            "RuleEngine",

            () => new RuleEngine()

        );

    }

    /**************************************************************************
     *
     * Application
     *
     **************************************************************************/

    private registerApplication(): void {

        this.container.registerSingleton(

            "AIManager",

            () => new AIManager()

        );

        this.container.registerSingleton(

            "WorkflowEngine",

            () => new WorkflowEngine()

        );

        this.container.registerSingleton(

            "CostEstimator",

            () => new CostEstimator()

        );

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public diagnostics() {

        return this.container.diagnostics();

    }

}
