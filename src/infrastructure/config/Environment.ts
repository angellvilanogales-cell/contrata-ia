/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * ENVIRONMENT
 *
 ******************************************************************************/

export enum EnvironmentType {

    DEVELOPMENT = "development",

    TEST = "test",

    PRODUCTION = "production"

}

export interface EnvironmentVariables {

    environment: EnvironmentType;

    applicationName: string;

    version: string;

    language: string;

    locale: string;

    timezone: string;

    repositoryPath: string;

    knowledgePath: string;

    templatesPath: string;

    exportPath: string;

    temporaryPath: string;

    logsPath: string;

    aiProvider: string;

    aiModel: string;

    aiTemperature: number;

    aiTimeout: number;

}

export class Environment {

    private static readonly variables: EnvironmentVariables = {

        environment:

            EnvironmentType.DEVELOPMENT,

        applicationName:

            "Asistente de Contratación Pública",

        version:

            "1.0.0",

        language:

            "es",

        locale:

            "es-ES",

        timezone:

            "Europe/Madrid",

        repositoryPath:

            "./repository",

        knowledgePath:

            "./knowledge",

        templatesPath:

            "./templates",

        exportPath:

            "./exports",

        temporaryPath:

            "./temp",

        logsPath:

            "./logs",

        aiProvider:

            "openai",

        aiModel:

            "gpt-5.5",

        aiTemperature:

            0.1,

        aiTimeout:

            120000

    };

    public static get config(): EnvironmentVariables {

        return this.variables;

    }

    public static isDevelopment(): boolean {

        return this.variables.environment ===

            EnvironmentType.DEVELOPMENT;

    }

    public static isTest(): boolean {

        return this.variables.environment ===

            EnvironmentType.TEST;

    }

    public static isProduction(): boolean {

        return this.variables.environment ===

            EnvironmentType.PRODUCTION;

    }

    public static getValue<K extends keyof EnvironmentVariables>(

        key: K

    ): EnvironmentVariables[K] {

        return this.variables[key];

    }

}
