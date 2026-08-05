/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CONFIGURATION BOOTSTRAP
 *
 ******************************************************************************/

import {

    ConfigurationLoader

} from "./ConfigurationLoader";

import {

    ConfigurationValidator

} from "./ConfigurationValidator";

import configurationManager from "./ConfigurationManager";

import {

    ApplicationConfiguration

} from "./AppConfiguration";

export class ConfigurationBootstrap {

    private readonly loader: ConfigurationLoader;

    private readonly validator:

        ConfigurationValidator;

    constructor(

        configurationFile: string

    ) {

        this.loader =

            new ConfigurationLoader(

                configurationFile

            );

        this.validator =

            new ConfigurationValidator();

    }

    public initialize()

        : ApplicationConfiguration {

        const configuration =

            this.loader.load();

        const validation =

            this.validator.validate(

                configuration

            );

        if (

            !validation.valid

        ) {

            throw new Error(

                [

                    "Configuration errors:",

                    ...validation.errors

                ].join("\n")

            );

        }

        if (

            validation.warnings.length > 0

        ) {

            console.warn(

                "[ACP] Configuration warnings"

            );

            for (

                const warning

                of validation.warnings

            ) {

                console.warn(

                    ` - ${warning}`

                );

            }

        }

        configurationManager.importConfiguration(

            configuration

        );

        return configuration;

    }

    public save()

        : void {

        this.loader.save(

            configurationManager.exportConfiguration()

        );

    }

    public restoreDefaults()

        : void {

        this.loader.reset();

        configurationManager.reset();

    }

}

export default ConfigurationBootstrap;
