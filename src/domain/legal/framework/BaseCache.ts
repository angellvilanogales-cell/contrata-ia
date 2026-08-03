/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * BaseCache
 * ------------------------------------------------------------
 * Caché común del Framework Jurídico.
 *
 * Será utilizada por:
 *
 * • RuleExecutor
 * • KnowledgeConnector
 * • ResolverPipeline
 * • Query Engines
 * • Statistics
 * • Diagnóstico
 *
 * ============================================================
 */

export interface CacheEntry<T> {

    key: string;

    value: T;

    created: number;

    expires: number;

}

export class BaseCache<T> {

    /**
     * Almacenamiento interno.
     */
    private readonly cache =
        new Map<string, CacheEntry<T>>();

    /**
     * Tiempo de vida por defecto.
     */
    constructor(

        private readonly ttl =

            5 * 60 * 1000

    ) {}

    /*==========================================================
     *
     * GUARDAR
     *
     *==========================================================*/

    public set(

        key: string,

        value: T,

        ttl?: number

    ): void {

        const now = Date.now();

        this.cache.set(

            key,

            {

                key,

                value,

                created: now,

                expires:

                    now +

                    (ttl ?? this.ttl)

            }

        );

    }

    /*==========================================================
     *
     * LEER
     *
     *==========================================================*/

    public get(

        key: string

    ): T | undefined {

        const entry =

            this.cache.get(

                key

            );

        if (!entry) {

            return undefined;

        }

        if (

            Date.now() >

            entry.expires

        ) {

            this.cache.delete(

                key

            );

            return undefined;

        }

        return entry.value;

    }

    /*==========================================================
     *
     * EXISTE
     *
     *==========================================================*/

    public has(

        key: string

    ): boolean {

        return this.get(key)

            !== undefined;

    }

    /*==========================================================
     *
     * ELIMINAR
     *
     *==========================================================*/

    public remove(

        key: string

    ): boolean {

        return this.cache.delete(

            key

        );

    }

    /*==========================================================
     *
     * LIMPIAR
     *
     *==========================================================*/

    public clear(): void {

        this.cache.clear();

    }

    /*==========================================================
     *
     * LIMPIEZA DE EXPIRADOS
     *
     *==========================================================*/

    public cleanup(): void {

        const now = Date.now();

        for (

            const [

                key,

                entry

            ]

            of this.cache

        ) {

            if (

                entry.expires < now

            ) {

                this.cache.delete(

                    key

                );

            }

        }

    }

    /*==========================================================
     *
     * TAMAÑO
     *
     *==========================================================*/

    public size(): number {

        this.cleanup();

        return this.cache.size;

    }

    /*==========================================================
     *
     * CLAVES
     *
     *==========================================================*/

    public keys(): string[] {

        this.cleanup();

        return Array.from(

            this.cache.keys()

        );

    }

    /*==========================================================
     *
     * EXPORTAR
     *
     *==========================================================*/

    public export(): CacheEntry<T>[] {

        this.cleanup();

        return Array.from(

            this.cache.values()

        );

    }

    /*==========================================================
     *
     * DIAGNÓSTICO
     *
     *==========================================================*/

    public diagnostics() {

        this.cleanup();

        return {

            entries:

                this.cache.size,

            ttl:

                this.ttl,

            keys:

                this.keys()

        };

    }

}
