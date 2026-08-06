/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPEDIENTE GENERATOR
 *
 * Generador principal del expediente administrativo.
 *
 ******************************************************************************/

import { WorkflowOrchestrator } from "../integration/WorkflowOrchestrator";
import { RepositoryContext } from "../../infrastructure/persistence/RepositoryContext";

export interface ExpedienteGenerationResult {

    expedienteId: string;

    generatedAt: string;

    success: boolean;

    generatedDocuments: string[];

}

export class ExpedienteGenerator {

    constructor(

        private readonly orchestrator: WorkflowOrchestrator,

        private readonly repositories: RepositoryContext

    ) {}

    /**************************************************************************
     *
     * Generación completa
     *
     **************************************************************************/

    public async generate(

        expedienteId: string

    ): Promise<ExpedienteGenerationResult> {

        await this.orchestrator.execute(

            expedienteId

        );

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

                "Expediente no encontrado."

            );

        }

        const generatedDocuments =

            await this.generateDocuments(

                expediente

            );

        return {

            expedienteId,

            generatedAt:

                new Date()

                    .toISOString(),

            success: true,

            generatedDocuments

        };

    }

    /**************************************************************************
     *
     * Documentación
     *
     **************************************************************************/

    private async generateDocuments(

        expediente: any

    ): Promise<string[]> {

        const documents: string[] = [];

        if (

            expediente.memoria

        ) {

            documents.push(

                "Memoria Justificativa"

            );

        }

        if (

            expediente.pcap

        ) {

            documents.push(

                "PCAP"

            );

        }

        if (

            expediente.ppt

        ) {

            documents.push(

                "PPT"

            );

        }

        if (

            expediente.informes

        ) {

            documents.push(

                "Informes"

            );

        }

        return documents;

    }

}
