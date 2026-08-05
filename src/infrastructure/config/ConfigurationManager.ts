/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CONFIGURATION MANAGER
 *
 ******************************************************************************/

import {

    AppConfiguration,
    ApplicationConfiguration

} from "./AppConfiguration";

import {

    Environment,
    EnvironmentVariables

} from "./Environment";

export class ConfigurationManager {

    private static instance?: ConfigurationManager;

    private configuration: ApplicationConfiguration;

    private constructor() {

        this.configuration = {

            ...AppConfiguration

        };

    }

    public static getInstance(): ConfigurationManager {

        if (!this.instance) {

            this.instance = new ConfigurationManager();

        }

        return this.instance;

    }

    public get application(): ApplicationConfiguration {

        return this.configuration;

    }

    public get environment(): EnvironmentVariables {

        return Environment.config;

    }

    public getValue<T>(

        selector: (config: ApplicationConfiguration) => T

    ): T {

        return selector(this.configuration);

    }

    public update(

        partial: Partial<ApplicationConfiguration>

    ): void {

        this.configuration = {

            ...this.configuration,

            ...partial

        };

    }

    public reset(): void {

        this.configuration = {

            ...AppConfiguration

        };

    }

    public exportConfiguration()

        : ApplicationConfiguration {

        return JSON.parse(

            JSON.stringify(

                this.configuration

            )

        );

    }

    public importConfiguration(

        configuration: ApplicationConfiguration

    ): void {

        this.configuration = JSON.parse(

            JSON.stringify(

                configuration

            )

        );

    }

    public isProduction(): boolean {

        return Environment.isProduction();

    }

    public isDevelopment(): boolean {

        return Environment.isDevelopment();

    }

    public isTest(): boolean {

        return Environment.isTest();

    }

}

export const configurationManager =

    ConfigurationManager.getInstance();

export default configurationManager;
