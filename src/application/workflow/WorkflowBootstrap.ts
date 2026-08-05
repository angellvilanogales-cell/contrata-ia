/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * WORKFLOW BOOTSTRAP
 *
 * Inicializa todos los motores del Workflow.
 *
 ******************************************************************************/

import { WorkflowEngine } from "./WorkflowEngine";

export interface WorkflowModule {
    name: string;
    initialized: boolean;
    initialize(): Promise<void>;
}

export class WorkflowBootstrap {

    private readonly workflow: WorkflowEngine;

    private readonly modules: WorkflowModule[] = [];

    constructor(workflow: WorkflowEngine) {
        this.workflow = workflow;
    }

    /**********************************************************************
     * Registro de módulos
     **********************************************************************/

    public register(module: WorkflowModule): void {
        this.modules.push(module);
    }

    /**********************************************************************
     * Inicialización completa
     **********************************************************************/

    public async initialize(): Promise<void> {

        for (const module of this.modules) {

            if (!module.initialized) {

                await module.initialize();

            }

        }

    }

    /**********************************************************************
     * Registro de motores
     **********************************************************************/

    public registerRuleEngine(engine: any): void {
        this.workflow.registerRuleEngine(engine);
    }

    public registerInferenceEngine(engine: any): void {
        this.workflow.registerInferenceEngine(engine);
    }

    public registerValidationEngine(engine: any): void {
        this.workflow.registerValidationEngine(engine);
    }

    public registerLegalReasoner(engine: any): void {
        this.workflow.registerLegalReasoner(engine);
    }

    public registerDocumentGenerator(engine: any): void {
        this.workflow.registerDocumentGenerator(engine);
    }

    public registerExportManager(engine: any): void {
        this.workflow.registerExportManager(engine);
    }

    /**********************************************************************
     * Estado
     **********************************************************************/

    public status() {

        return {

            workflow: this.workflow.getStatus(),

            modules: this.modules.map(m => ({

                name: m.name,

                initialized: m.initialized

            }))

        };

    }

    /**********************************************************************
     * Diagnóstico completo
     **********************************************************************/

    public diagnostics() {

        return {

            workflow: this.workflow.diagnostics(),

            bootstrap: this.status()

        };

    }

}
