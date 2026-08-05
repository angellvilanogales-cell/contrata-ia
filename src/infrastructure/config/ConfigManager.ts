/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CONFIG MANAGER
 *
 * Gestor centralizado de configuración de la aplicación.
 *
 ******************************************************************************/

export interface IConfigurationProvider{

    load():Promise<void>;

    has(key:string):boolean;

    get<T>(key:string):T;

    set<T>(key:string,value:T):void;

    remove(key:string):void;

    clear():void;

    keys():string[];

}

export enum ConfigurationScope{

    APPLICATION="APPLICATION",

    AI="AI",

    DATABASE="DATABASE",

    SECURITY="SECURITY",

    STORAGE="STORAGE",

    LOGGING="LOGGING"

}

export interface ConfigurationEntry<T=unknown>{

    key:string;

    scope:ConfigurationScope;

    value:T;

    description?:string;

    readOnly?:boolean;

}

/*===========================================================================
=
= CONFIG MANAGER
=
===========================================================================*/

export class ConfigManager implements IConfigurationProvider{

    private readonly configuration=

        new Map<string,ConfigurationEntry>();

    private loaded=false;

/*===========================================================================
=
= CARGA
=
===========================================================================*/

    public async load()

        :Promise<void>{

        if(

            this.loaded

        ){

            return;

        }

        this.loadDefaults();

        this.loaded=true;

    }

/*===========================================================================
=
= CONFIGURACIÓN POR DEFECTO
=
===========================================================================*/

    private loadDefaults()

        :void{

        this.register({

            key:"application.name",

            scope:ConfigurationScope.APPLICATION,

            value:"Contrata-IA",

            readOnly:true

        });

        this.register({

            key:"application.version",

            scope:ConfigurationScope.APPLICATION,

            value:"1.0.0",

            readOnly:true

        });

        this.register({

            key:"ai.defaultProvider",

            scope:ConfigurationScope.AI,

            value:"OPENAI"

        });

        this.register({

            key:"ai.timeout",

            scope:ConfigurationScope.AI,

            value:120000

        });

        this.register({

            key:"logging.level",

            scope:ConfigurationScope.LOGGING,

            value:"INFO"

        });

    }

/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

    public register(

        entry:ConfigurationEntry

    ):void{

        this.configuration.set(

            entry.key,

            entry

        );

    }

/*===========================================================================
=
= EXISTE
=
===========================================================================*/

    public has(

        key:string

    ):boolean{

        return this.configuration.has(

            key

        );

    }

/*===========================================================================
=
= OBTENER
=
===========================================================================*/

    public get<T>(

        key:string

    ):T{

        const entry=

            this.configuration.get(

                key

            );

        if(

            !entry

        ){

            throw new Error(

                `Configuration '${key}' not found.`

            );

        }

        return entry.value as T;

    }

/*===========================================================================
=
= MODIFICAR
=
===========================================================================*/

    public set<T>(

        key:string,

        value:T

    ):void{

        const entry=

            this.configuration.get(

                key

            );

        if(

            !entry

        ){

            this.configuration.set(

                key,

                {

                    key,

                    value,

                    scope:

                        ConfigurationScope.APPLICATION

                }

            );

            return;

        }

        if(

            entry.readOnly

        ){

            throw new Error(

                `Configuration '${key}' is read only.`

            );

        }

        entry.value=value;

    }

/*===========================================================================
=
= ELIMINAR
=
===========================================================================*/

    public remove(

        key:string

    ):void{

        const entry=

            this.configuration.get(

                key

            );

        if(

            entry?.readOnly

        ){

            return;

        }

        this.configuration.delete(

            key

        );

    }

/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

    public clear()

        :void{

        for(

            const [

                key,

                value

            ]

            of this.configuration

        ){

            if(

                !value.readOnly

            ){

                this.configuration.delete(

                    key

                );

            }

        }

    }

/*===========================================================================
=
= CLAVES
=
===========================================================================*/

    public keys()

        :string[]{

        return[

            ...this.configuration.keys()

        ];

    }

/*===========================================================================
=
= EXPORTAR
=
===========================================================================*/

    public export(){

        return Object.fromEntries(

            [...this.configuration.entries()]

            .map(

                ([key,value])=>

                [

                    key,

                    value.value

                ]

            )

        );

    }

}
