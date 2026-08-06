/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * WORKFLOW ORCHESTRATOR
 *
 * Coordina todos los motores de negocio durante la creación
 * de un expediente administrativo.
 *
 ******************************************************************************/

import { WorkflowEngine } from "../workflow/WorkflowEngine";
import { RuleEngine } from "../../domain/conocimiento/RuleEngine";
import { AIManager } from "../../infrastructure/ai/AIManager";
import { RepositoryContext } from "../../infrastructure/persistence/RepositoryContext";
import { CostEstimator } from "../services/CostEstimator";

export class WorkflowOrchestrator {

    constructor(

        private readonly workflow: WorkflowEngine,

        private readonly rules: RuleEngine,

        private readonly ai: AIManager,

        private readonly repositories: RepositoryContext,

        private readonly estimator: CostEstimator

    ) {}

    /**************************************************************************
     *
     * Ejecución completa
     *
     **************************************************************************/

    public async execute(

        expedienteId: string

    ): Promise<void> {

        const expediente =

            await this.repositories

                .expedientes

                .findById(

                    expedienteId

                );

        if (

            !expediente

        ) {

            throw new Error(

                `Expediente '${expedienteId}' no encontrado.`

            );

        }

        await this.validateRules(

            expediente

        );

        await this.calculateBudget(

            expediente

        );

        await this.generateRecommendations(

            expediente

        );

        await this.executeWorkflow(

            expediente

        );

        await this.repositories

            .expedientes

            .update(

                expediente.id,

                expediente

            );

    }

    /**************************************************************************
     *
     * Validación normativa
     *
     **************************************************************************/

    private async validateRules(

        expediente: any

    ): Promise<void> {

        await this.rules.execute(

            expediente

        );

    }

    /**************************************************************************
     *
     * Estimación económica
     *
     **************************************************************************/

    private async calculateBudget(

        expediente: any

    ): Promise<void> {

        expediente.costEstimate =

            await this.estimator

                .estimate(

                    expediente

                );

    }

    /**************************************************************************
     *
     * IA
     *
     **************************************************************************/

    private async generateRecommendations(

        expediente: any

    ): Promise<void> {

        expediente.aiRecommendations =

            await this.ai.complete(

                {

                    expediente

                }

            );

    }

    /**************************************************************************
     *
     * Workflow
     *
     **************************************************************************/

    private async executeWorkflow(

        expediente: any

    ): Promise<void> {

        await this.workflow.run(

            expediente

        );

    }

}
