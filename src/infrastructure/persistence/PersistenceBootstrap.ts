/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PERSISTENCE BOOTSTRAP
 *
 * Inicialización de toda la capa de persistencia.
 *
 ******************************************************************************/

import { RepositoryFactory } from "./RepositoryFactory";

import { ExpedienteRepository } from "./ExpedienteRepository";
import { KnowledgeRepository } from "./KnowledgeRepository";
import { RulesRepository } from "./RulesRepository";
import { DocumentRepository } from "./DocumentRepository";

export interface PersistenceEnvironment {

    storageDirectory: string;

}

export class PersistenceBootstrap {

    private static initialized = false;

    private static environment: PersistenceEnvironment = {

        storageDirectory: "./storage"

    };

    public static initialize(

        environment?: Partial<PersistenceEnvironment>

    ): void {

        if (

            this.initialized

        ) {

            return;

        }

        this.environment = {

            ...this.environment,

            ...environment

        };

        RepositoryFactory.configure({

            rootDirectory:

                this.environment.storageDirectory

        });

        this.initialized = true;

    }

    public static shutdown(): void {

        RepositoryFactory.clear();

        this.initialized = false;

    }

    public static isInitialized()

        : boolean {

        return this.initialized;

    }

    public static getExpedientes()

        : ExpedienteRepository {

        this.ensureInitialized();

        return RepositoryFactory

            .getExpedienteRepository();

    }

    public static getKnowledge()

        : KnowledgeRepository {

        this.ensureInitialized();

        return RepositoryFactory

            .getKnowledgeRepository();

    }

    public static getRules()

        : RulesRepository {

        this.ensureInitialized();

        return RepositoryFactory

            .getRulesRepository();

    }

    public static getDocuments()

        : DocumentRepository {

        this.ensureInitialized();

        return RepositoryFactory

            .getDocumentRepository();

    }

    public static diagnostics() {

        return {

            initialized:

                this.initialized,

            environment:

                this.environment,

            repositories:

                RepositoryFactory

                    .diagnostics()

        };

    }

    private static ensureInitialized()

        : void {

        if (

            !this.initialized

        ) {

            throw new Error(

                "PersistenceBootstrap has not been initialized."

            );

        }

    }

}
