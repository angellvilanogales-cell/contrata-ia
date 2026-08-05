/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * APP CONFIGURATION
 *
 ******************************************************************************/

export interface AIConfiguration {

    provider: string;

    model: string;

    temperature: number;

    maxTokens: number;

    timeout: number;

}

export interface StorageConfiguration {

    repositoryFolder: string;

    expedientesFolder: string;

    knowledgeFolder: string;

    templatesFolder: string;

    exportFolder: string;

    temporaryFolder: string;

}

export interface LoggingConfiguration {

    enabled: boolean;

    level: "debug" | "info" | "warn" | "error";

    file: string;

    maxFiles: number;

    maxSizeMB: number;

}

export interface ExportConfiguration {

    pdfEnabled: boolean;

    docxEnabled: boolean;

    markdownEnabled: boolean;

    htmlEnabled: boolean;

    jsonEnabled: boolean;

}

export interface SecurityConfiguration {

    enableAudit: boolean;

    enableEncryption: boolean;

    enableHashValidation: boolean;

}

export interface ApplicationConfiguration {

    applicationName: string;

    version: string;

    language: string;

    locale: string;

    timezone: string;

    environment: "development" | "test" | "production";

    ai: AIConfiguration;

    storage: StorageConfiguration;

    logging: LoggingConfiguration;

    export: ExportConfiguration;

    security: SecurityConfiguration;

}

export const AppConfiguration: ApplicationConfiguration = {

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

    environment:

        "development",

    ai: {

        provider:

            "openai",

        model:

            "gpt-5.5",

        temperature:

            0.1,

        maxTokens:

            8000,

        timeout:

            120000

    },

    storage: {

        repositoryFolder:

            "./repository",

        expedientesFolder:

            "./repository/expedientes",

        knowledgeFolder:

            "./knowledge",

        templatesFolder:

            "./templates",

        exportFolder:

            "./exports",

        temporaryFolder:

            "./temp"

    },

    logging: {

        enabled:

            true,

        level:

            "info",

        file:

            "./logs/application.log",

        maxFiles:

            30,

        maxSizeMB:

            50

    },

    export: {

        pdfEnabled:

            true,

        docxEnabled:

            true,

        markdownEnabled:

            true,

        htmlEnabled:

            true,

        jsonEnabled:

            true

    },

    security: {

        enableAudit:

            true,

        enableEncryption:

            false,

        enableHashValidation:

            true

    }

};

export default AppConfiguration;
