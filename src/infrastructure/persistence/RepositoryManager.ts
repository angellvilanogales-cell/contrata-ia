/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * REPOSITORY MANAGER
 *
 ******************************************************************************/

import { RepositoryFactory } from "./RepositoryFactory";

import { ExpedienteRepository } from "./ExpedienteRepository";
import { KnowledgeRepository } from "./KnowledgeRepository";
import { RulesRepository } from "./RulesRepository";
import { DocumentRepository } from "./DocumentRepository";

export class RepositoryManager {

    private readonly expedienteRepository: ExpedienteRepository;

    private readonly knowledgeRepository: KnowledgeRepository;

    private readonly rulesRepository: RulesRepository;

    private readonly documentRepository: DocumentRepository;

    constructor() {

        this.expedienteRepository =

            RepositoryFactory.getExpedienteRepository();

        this.knowledgeRepository =

            RepositoryFactory.getKnowledgeRepository();

        this.rulesRepository =

            RepositoryFactory.getRulesRepository();

        this.documentRepository =

            RepositoryFactory.getDocumentRepository();

    }

    /**************************************************************************
     *
     * Getters
     *
     **************************************************************************/

    public expedientes()

        : ExpedienteRepository {

        return this.expedienteRepository;

    }

    public knowledge()

        : KnowledgeRepository {

        return this.knowledgeRepository;

    }

    public rules()

        : RulesRepository {

        return this.rulesRepository;

    }

    public documents()

        : DocumentRepository {

        return this.documentRepository;

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public diagnostics() {

        return {

            expedienteRepository:

                this.expedienteRepository.constructor.name,

            knowledgeRepository:

                this.knowledgeRepository.constructor.name,

            rulesRepository:

                this.rulesRepository.constructor.name,

            documentRepository:

                this.documentRepository.constructor.name

        };

    }

    /**************************************************************************
     *
     * Reinicio
     *
     **************************************************************************/

    public reset(): void {

        RepositoryFactory.clear();

    }

}
