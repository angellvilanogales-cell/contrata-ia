/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * APPLICATION KERNEL
 *
 * Punto central de integración de todos los motores.
 *
 ******************************************************************************/

import { Bootstrapper } from "../../infrastructure/services/Bootstrapper";
import { ApplicationContext } from "../../infrastructure/services/ApplicationContext";

import { AIManager } from "../../infrastructure/ai/AIManager";

import { WorkflowEngine } from "../workflow/WorkflowEngine";

import { RuleEngine } from "../../domain/conocimiento/RuleEngine";

import { RepositoryContext } from "../../infrastructure/persistence/RepositoryContext";

import { CostEstimator } from "../services/CostEstimator";

export class ApplicationKernel {

    private readonly bootstrapper;

    private context!: ApplicationContext;

    constructor() {

        this.bootstrapper =

            new Bootstrapper();

    }

    /**************************************************************************
     *
     * Inicialización
     *
     **************************************************************************/

    public async initialize(): Promise<void> {

        this.context =

            await this.bootstrapper.initialize();

    }

    /**************************************************************************
     *
     * Motores
     *
     **************************************************************************/

    public get ai(): AIManager {

        return this.context

            .services

            .resolve<AIManager>(

                "AIManager"

            );

    }

    public get workflow(): WorkflowEngine {

        return this.context

            .services

            .resolve<WorkflowEngine>(

                "WorkflowEngine"

            );

    }

    public get rules(): RuleEngine {

        return this.context

            .services

            .resolve<RuleEngine>(

                "RuleEngine"

            );

    }

    public get repositories(): RepositoryContext {

        return this.context.repositories;

    }

    public get estimator(): CostEstimator {

        return this.context

            .services

            .resolve<CostEstimator>(

                "CostEstimator"

            );

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public diagnostics() {

        return this.context

            .diagnostics();

    }

    /**************************************************************************
     *
     * Finalización
     *
     **************************************************************************/

    public async shutdown(): Promise<void> {

        await this.bootstrapper

            .shutdown();

    }

}
