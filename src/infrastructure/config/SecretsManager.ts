/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * SECRETS MANAGER
 *
 * Gestión centralizada de credenciales y secretos.
 *
 ******************************************************************************/

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export enum SecretKey {

    OPENAI_API_KEY = "OPENAI_API_KEY",

    ANTHROPIC_API_KEY = "ANTHROPIC_API_KEY",

    GEMINI_API_KEY = "GEMINI_API_KEY",

    OLLAMA_URL = "OLLAMA_URL",

    GITHUB_TOKEN = "GITHUB_TOKEN"

}

export interface SecretSource {

    environment: boolean;

    file: boolean;

}

export class SecretsManager {

    private readonly cache =

        new Map<string,string>();

    constructor(

        private readonly secretsFile:string="./config/secrets.json"

    ){

    }

/*===========================================================================
=
= OBTENER SECRETO
=
===========================================================================*/

    public get(

        key:SecretKey|string

    ):string{

        const cache=

            this.cache.get(

                key

            );

        if(

            cache

        ){

            return cache;

        }

        const env=

            process.env[key];

        if(

            env

        ){

            this.cache.set(

                key,

                env

            );

            return env;

        }

        const file=

            this.loadFromFile(

                key

            );

        if(

            file

        ){

            this.cache.set(

                key,

                file

            );

            return file;

        }

        return "";

    }

/*===========================================================================
=
= EXISTE
=
===========================================================================*/

    public has(

        key:SecretKey|string

    ):boolean{

        return(

            this.get(

                key

            ).length>0

        );

    }

/*===========================================================================
=
= OBLIGATORIO
=
===========================================================================*/

    public require(

        key:SecretKey|string

    ):string{

        const value=

            this.get(

                key

            );

        if(

            !value

        ){

            throw new Error(

                `Secret '${key}' not configured.`

            );

        }

        return value;

    }

/*===========================================================================
=
= ARCHIVO
=
===========================================================================*/

    private loadFromFile(

        key:string

    ):string{

        const path=

            resolve(

                this.secretsFile

            );

        if(

            !existsSync(

                path

            )

        ){

            return "";

        }

        try{

            const json=

                JSON.parse(

                    readFileSync(

                        path,

                        "utf8"

                    )

                );

            return json[key]??"";

        }

        catch{

            return "";

        }

    }

/*===========================================================================
=
= LIMPIEZA CACHE
=
===========================================================================*/

    public clear()

        :void{

        this.cache.clear();

    }

/*===========================================================================
=
= FUENTES
=
===========================================================================*/

    public source(

        key:SecretKey|string

    ):SecretSource{

        return{

            environment:

                process.env[key]!==undefined,

            file:

                this.loadFromFile(

                    key

                )!==""


        };

    }

/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

    public information(){

        return{

            configured:

                Object.values(

                    SecretKey

                ).filter(

                    key=>

                    this.has(

                        key

                    )

                ),

            cached:

                this.cache.size

        };

    }

}
