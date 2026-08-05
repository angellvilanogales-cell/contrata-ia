/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * REPOSITORY CONTEXT
 *
 * Punto único de acceso a todos los repositorios del sistema.
 *
 ******************************************************************************/

import { RepositoryManager } from "./RepositoryManager";

import { ExpedienteRepository } from "./ExpedienteRepository";
import { KnowledgeRepository } from "./KnowledgeRepository";
import { RulesRepository } from "./RulesRepository";
import { DocumentRepository } from "./DocumentRepository";
import { CacheRepository } from "./CacheRepository";

export class RepositoryContext {

    private readonly manager: RepositoryManager;

    private readonly cache =
        new CacheRepository();

    constructor(

        manager?: RepositoryManager

    ) {

        this.manager =
            manager ??
            new RepositoryManager();

    }

    /**************************************************************************
     *
     * Repositorios
     *
     **************************************************************************/

    public get expedientes()

        : ExpedienteRepository {

        return this.manager.expedientes();

    }

    public get knowledge()

        : KnowledgeRepository {

        return this.manager.knowledge();

    }

    public get rules()

        : RulesRepository {

        return this.manager.rules();

    }

    public get documents()

        : DocumentRepository {

        return this.manager.documents();

    }

    public get cacheRepository()

        : CacheRepository<unknown> {

        return this.cache;

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public diagnostics() {

        return {

            repositories:

                this.manager.diagnostics(),

            cache: {

                entries:

                    this.cache.size(),

                keys:

                    this.cache.keys()

            }

        };

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public clearCache()

        : void {

        this.cache.clear();

    }

    public resetRepositories()

        : void {

        this.manager.reset();

    }

}
