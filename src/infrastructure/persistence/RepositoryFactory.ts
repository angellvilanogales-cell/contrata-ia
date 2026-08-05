/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * REPOSITORY FACTORY
 *
 * Punto único de creación de repositorios.
 *
 ******************************************************************************/

import { ExpedienteRepository } from "./ExpedienteRepository";
import { KnowledgeRepository } from "./KnowledgeRepository";
import { RulesRepository } from "./RulesRepository";
import { DocumentRepository } from "./DocumentRepository";

export interface RepositoryConfiguration {

    rootDirectory: string;

}

export class RepositoryFactory {

    private static configuration: RepositoryConfiguration = {

        rootDirectory: "./storage"

    };

    private static expedienteRepository?:

        ExpedienteRepository;

    private static knowledgeRepository?:

        KnowledgeRepository;

    private static rulesRepository?:

        RulesRepository;

    private static documentRepository?:

        DocumentRepository;

    public static configure(

        configuration:

        Partial<RepositoryConfiguration>

    ): void {

        this.configuration = {

            ...this.configuration,

            ...configuration

        };

    }

    public static getExpedienteRepository()

        : ExpedienteRepository {

        if (

            !this.expedienteRepository

        ) {

            this.expedienteRepository =

                new ExpedienteRepository(

                    `${this.configuration.rootDirectory}/expedientes`

                );

        }

        return this.expedienteRepository;

    }

    public static getKnowledgeRepository()

        : KnowledgeRepository {

        if (

            !this.knowledgeRepository

        ) {

            this.knowledgeRepository =

                new KnowledgeRepository(

                    `${this.configuration.rootDirectory}/knowledge`

                );

        }

        return this.knowledgeRepository;

    }

    public static getRulesRepository()

        : RulesRepository {

        if (

            !this.rulesRepository

        ) {

            this.rulesRepository =

                new RulesRepository(

                    `${this.configuration.rootDirectory}/rules`

                );

        }

        return this.rulesRepository;

    }

    public static getDocumentRepository()

        : DocumentRepository {

        if (

            !this.documentRepository

        ) {

            this.documentRepository =

                new DocumentRepository(

                    `${this.configuration.rootDirectory}/documents`

                );

        }

        return this.documentRepository;

    }

    public static clear(): void {

        this.expedienteRepository = undefined;

        this.knowledgeRepository = undefined;

        this.rulesRepository = undefined;

        this.documentRepository = undefined;

    }

    public static diagnostics() {

        return {

            configured:

                this.configuration,

            repositories: {

                expedientes:

                    !!this.expedienteRepository,

                knowledge:

                    !!this.knowledgeRepository,

                rules:

                    !!this.rulesRepository,

                documents:

                    !!this.documentRepository

            }

        };

    }

}
