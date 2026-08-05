/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI CACHE
 *
 * Caché inteligente para respuestas IA.
 *
 ******************************************************************************/

import { AIProviderRequest } from "./AIProvider";
import { AIProviderResponse } from "./AIProvider";

/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

export interface AICacheStatistics{

    enabled:boolean;

    entries:number;

    hits:number;

    misses:number;

    hitRate:number;

    ttl:number;

}

/*===========================================================================
=
= ENTRADA
=
===========================================================================*/

interface CacheEntry{

    timestamp:number;

    response:AIProviderResponse;

}

/*===========================================================================
=
= CACHE
=
===========================================================================*/

export class AICache{

    private readonly cache=

        new Map<string,CacheEntry>();

    private enabled=true;

    private ttl=300000;

    private hits=0;

    private misses=0;

/*===========================================================================
=
= CLAVE
=
===========================================================================*/

    private key(

        request:AIProviderRequest

    ):string{

        return JSON.stringify({

            provider:

                request.provider,

            model:

                request.model,

            prompt:

                request.prompt,

            temperature:

                request.temperature,

            maxTokens:

                request.maxTokens

        });

    }

/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

    public get(

        request:AIProviderRequest

    ):AIProviderResponse|undefined{

        if(

            !this.enabled

        ){

            return undefined;

        }

        const key=

            this.key(request);

        const entry=

            this.cache.get(key);

        if(

            !entry

        ){

            this.misses++;

            return undefined;

        }

        if(

            Date.now()-entry.timestamp>

            this.ttl

        ){

            this.cache.delete(

                key

            );

            this.misses++;

            return undefined;

        }

        this.hits++;

        return entry.response;

    }

/*===========================================================================
=
= ALMACENAR
=
===========================================================================*/

    public put(

        request:AIProviderRequest,

        response:AIProviderResponse

    ):void{

        if(

            !this.enabled

        ){

            return;

        }

        this.cache.set(

            this.key(request),

            {

                timestamp:

                    Date.now(),

                response

            }

        );

    }

/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

    public clear()

        :void{

        this.cache.clear();

    }

    public purge()

        :void{

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

                now-value.timestamp>

                this.ttl

            ){

                this.cache.delete(

                    key

                );

            }

        }

    }

/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

    public enable()

        :void{

        this.enabled=true;

    }

    public disable()

        :void{

        this.enabled=false;

    }

    public setTTL(

        milliseconds:number

    ):void{

        this.ttl=

            Math.max(

                1000,

                milliseconds

            );

    }

/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

    public size()

        :number{

        return this.cache.size;

    }

    public statistics()

        :AICacheStatistics{

        const total=

            this.hits+

            this.misses;

        return{

            enabled:

                this.enabled,

            entries:

                this.cache.size,

            hits:

                this.hits,

            misses:

                this.misses,

            hitRate:

                total===0

                ?0

                :

                (

                    this.hits/

                    total

                )*100,

            ttl:

                this.ttl

        };

    }

/*===========================================================================
=
= RESET
=
===========================================================================*/

    public resetStatistics()

        :void{

        this.hits=0;

        this.misses=0;

    }

}
