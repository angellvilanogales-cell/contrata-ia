/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CONFIGURATION VALIDATOR
 *
 ******************************************************************************/

import {

    ApplicationConfiguration

} from "./AppConfiguration";

export interface ConfigurationValidationResult {

    valid: boolean;

    errors: string[];

    warnings: string[];

}

export class ConfigurationValidator {

    public validate(

        configuration: ApplicationConfiguration

    ): ConfigurationValidationResult {

        const errors: string[] = [];

        const warnings: string[] = [];

        this.validateGeneral(

            configuration,

            errors

        );

        this.validateAI(

            configuration,

            errors,

            warnings

        );

        this.validateStorage(

            configuration,

            errors

        );

        this.validateLogging(

            configuration,

            warnings

        );

        this.validateExport(

            configuration,

            warnings

        );

        return {

            valid:

                errors.length === 0,

            errors,

            warnings

        };

    }

    private validateGeneral(

        configuration: ApplicationConfiguration,

        errors: string[]

    ): void {

        if (!configuration.applicationName.trim()) {

            errors.push(

                "Application name is empty."

            );

        }

        if (!configuration.version.trim()) {

            errors.push(

                "Application version is empty."

            );

        }

        if (!configuration.language.trim()) {

            errors.push(

                "Language not configured."

            );

        }

    }

    private validateAI(

        configuration: ApplicationConfiguration,

        errors: string[],

        warnings: string[]

    ): void {

        if (!configuration.ai.provider) {

            errors.push(

                "AI provider not configured."

            );

        }

        if (!configuration.ai.model) {

            errors.push(

                "AI model not configured."

            );

        }

        if (

            configuration.ai.temperature < 0 ||

            configuration.ai.temperature > 2

        ) {

            warnings.push(

                "AI temperature outside recommended range."

            );

        }

    }

    private validateStorage(

        configuration: ApplicationConfiguration,

        errors: string[]

    ): void {

        if (!configuration.storage.repositoryFolder) {

            errors.push(

                "Repository folder not configured."

            );

        }

        if (!configuration.storage.knowledgeFolder) {

            errors.push(

                "Knowledge folder not configured."

            );

        }

    }

    private validateLogging(

        configuration: ApplicationConfiguration,

        warnings: string[]

    ): void {

        if (!configuration.logging.enabled) {

            warnings.push(

                "Logging disabled."

            );

        }

    }

    private validateExport(

        configuration: ApplicationConfiguration,

        warnings: string[]

    ): void {

        const exportEnabled =

            configuration.export.pdfEnabled ||

            configuration.export.docxEnabled ||

            configuration.export.markdownEnabled ||

            configuration.export.htmlEnabled ||

            configuration.export.jsonEnabled;

        if (!exportEnabled) {

            warnings.push(

                "No export formats enabled."

            );

        }

    }

}
