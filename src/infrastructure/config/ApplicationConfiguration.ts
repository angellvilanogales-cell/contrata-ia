/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * APPLICATION CONFIGURATION
 *
 ******************************************************************************/

import { ConfigManager } from "./ConfigManager";
import { Environment } from "./Environment";

export interface ApplicationConfiguration{

    application:{

        name:string;

        version:string;

        language:string;

        locale:string;

        timezone:string;

    };

    infrastructure:{

        repository:string;

        knowledge:string;

        templates:string;

        exports:string;

        temporary:string;

        logs:string;

    };

    ai:{

        provider:string;

        model:string;

        timeout:number;

        temperature:number;

    };

    execution:{

        environment:string;

        debug:boolean;

        telemetry:boolean;

    };

}

export class ApplicationConfigurationBuilder{

    constructor(

        private readonly config:ConfigManager,

        private readonly environment:Environment

    ){

    }

    public build()

        :ApplicationConfiguration{

        return{

            application:{

                name:

                    this.environment.getValue(

                        "applicationName"

                    ),

                version:

                    this.environment.getValue(

                        "version"

                    ),

                language:

                    this.environment.getValue(

                        "language"

                    ),

                locale:

                    this.environment.getValue(

                        "locale"

                    ),

                timezone:

                    this.environment.getValue(

                        "timezone"

                    )

            },

            infrastructure:{

                repository:

                    this.environment.getValue(

                        "repositoryPath"

                    ),

                knowledge:

                    this.environment.getValue(

                        "knowledgePath"

                    ),

                templates:

                    this.environment.getValue(

                        "templatesPath"

                    ),

                exports:

                    this.environment.getValue(

                        "exportPath"

                    ),

                temporary:

                    this.environment.getValue(

                        "temporaryPath"

                    ),

                logs:

                    this.environment.getValue(

                        "logsPath"

                    )

            },

            ai:{

                provider:

                    this.environment.getValue(

                        "aiProvider"

                    ),

                model:

                    this.environment.getValue(

                        "aiModel"

                    ),

                timeout:

                    this.environment.getValue(

                        "aiTimeout"

                    ),

                temperature:

                    this.environment.getValue(

                        "aiTemperature"

                    )

            },

            execution:{

                environment:

                    this.environment

                        .config.environment,

                debug:

                    this.environment.isDevelopment(),

                telemetry:true

            }

        };

    }

}

/*===========================================================================
=
= SINGLETON
=
===========================================================================*/

export class ApplicationConfigurationService{

    private static configuration?:

        ApplicationConfiguration;

    public static initialize(

        config:ConfigManager,

        environment:Environment

    ):ApplicationConfiguration{

        if(

            !this.configuration

        ){

            this.configuration=

                new ApplicationConfigurationBuilder(

                    config,

                    environment

                ).build();

        }

        return this.configuration;

    }

    public static current()

        :ApplicationConfiguration{

        if(

            !this.configuration

        ){

            throw new Error(

                "ApplicationConfiguration not initialized."

            );

        }

        return this.configuration;

    }

}
