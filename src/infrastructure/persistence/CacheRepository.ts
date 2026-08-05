/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CACHE REPOSITORY
 *
 ******************************************************************************/

export interface CacheEntry<T>{

    value:T;

    created:number;

    expires?:number;

}

export class CacheRepository<T>{

    private readonly cache=

        new Map<string,CacheEntry<T>>();

    constructor(

        private readonly defaultTTL:number=

            0

    ){

    }

    /**************************************************************************
     *
     * Guardar
     *
     **************************************************************************/

    public set(

        key:string,

        value:T,

        ttl?:number

    ):void{

        const lifetime=

            ttl ??

            this.defaultTTL;

        this.cache.set(

            key,

            {

                value,

                created:

                    Date.now(),

                expires:

                    lifetime>0

                        ? Date.now()+lifetime

                        : undefined

            }

        );

    }

    /**************************************************************************
     *
     * Obtener
     *
     **************************************************************************/

    public get(

        key:string

    ):T|undefined{

        const entry=

            this.cache.get(

                key

            );

        if(

            !entry

        ){

            return undefined;

        }

        if(

            entry.expires &&

            entry.expires<Date.now()

        ){

            this.cache.delete(

                key

            );

            return undefined;

        }

        return entry.value;

    }

    /**************************************************************************
     *
     * Existe
     *
     **************************************************************************/

    public has(

        key:string

    ):boolean{

        return this.get(

            key

        )!==undefined;

    }

    /**************************************************************************
     *
     * Eliminar
     *
     **************************************************************************/

    public delete(

        key:string

    ):boolean{

        return this.cache.delete(

            key

        );

    }

    /**************************************************************************
     *
     * Limpiar
     *
     **************************************************************************/

    public clear():void{

        this.cache.clear();

    }

    /**************************************************************************
     *
     * Limpieza automática
     *
     **************************************************************************/

    public cleanup():void{

        const now=

            Date.now();

        for(

            const [

                key,

                value

            ]

            of this.cache

        ){

            if(

                value.expires &&

                value.expires<now

            ){

                this.cache.delete(

                    key

                );

            }

        }

    }

    /**************************************************************************
     *
     * Estadísticas
     *
     **************************************************************************/

    public size():number{

        return this.cache.size;

    }

    public keys():string[]{

        return [

            ...this.cache.keys()

        ];

    }

    public values():T[]{

        return [

            ...this.cache.values()

        ].map(

            entry=>entry.value

        );

    }

}
