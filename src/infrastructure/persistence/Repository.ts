/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * REPOSITORY
 *
 * Contrato base de todos los repositorios del sistema.
 *
 ******************************************************************************/

export interface Repository<T, ID = string> {

    /**
     * Devuelve todos los elementos.
     */
    findAll(): Promise<ReadonlyArray<T>>;

    /**
     * Busca un elemento por identificador.
     */
    findById(

        id: ID

    ): Promise<T | undefined>;

    /**
     * Comprueba si existe.
     */
    exists(

        id: ID

    ): Promise<boolean>;

    /**
     * Guarda un elemento.
     */
    save(

        entity: T

    ): Promise<void>;

    /**
     * Guarda múltiples elementos.
     */
    saveAll(

        entities: ReadonlyArray<T>

    ): Promise<void>;

    /**
     * Actualiza un elemento.
     */
    update(

        id: ID,

        entity: T

    ): Promise<void>;

    /**
     * Elimina un elemento.
     */
    delete(

        id: ID

    ): Promise<void>;

    /**
     * Elimina todos.
     */
    clear(): Promise<void>;

    /**
     * Número de registros.
     */
    count(): Promise<number>;

}

/******************************************************************************
 *
 * Repositorio versionable.
 *
 ******************************************************************************/

export interface VersionedRepository<T, ID = string>

    extends Repository<T, ID> {

    createVersion(

        id: ID

    ): Promise<void>;

    listVersions(

        id: ID

    ): Promise<ReadonlyArray<string>>;

    restoreVersion(

        id: ID,

        version: string

    ): Promise<void>;

}

/******************************************************************************
 *
 * Repositorio de sólo lectura.
 *
 ******************************************************************************/

export interface ReadOnlyRepository<T, ID = string> {

    findAll(): Promise<ReadonlyArray<T>>;

    findById(

        id: ID

    ): Promise<T | undefined>;

    exists(

        id: ID

    ): Promise<boolean>;

    count(): Promise<number>;

}

/******************************************************************************
 *
 * Repositorio cacheable.
 *
 ******************************************************************************/

export interface CacheableRepository {

    invalidateCache(): Promise<void>;

    warmUp(): Promise<void>;

}

/******************************************************************************
 *
 * Repositorio auditable.
 *
 ******************************************************************************/

export interface AuditableRepository {

    enableAudit(): void;

    disableAudit(): void;

}
