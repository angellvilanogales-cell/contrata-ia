/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CONFIGURATION LOADER
 *
 ******************************************************************************/

import {

    existsSync,
    readFileSync,
    writeFileSync

} from "fs";

import {

    ApplicationConfiguration,
    AppConfiguration

} from "./AppConfiguration";

export class ConfigurationLoader {

    constructor(

        private readonly configurationFile: string

    ) {}

    public load()

        : ApplicationConfiguration {

        if (

            !existsSync(

                this.configurationFile

            )

        ) {

            return {

                ...AppConfiguration

            };

        }

        try {

            const content =

                readFileSync(

                    this.configurationFile,

                    "utf8"

                );

            const configuration =

                JSON.parse(

                    content

                ) as ApplicationConfiguration;

            return configuration;

        }

        catch {

            return {

                ...AppConfiguration

            };

        }

    }

    public save(

        configuration: ApplicationConfiguration

    ): void {

        writeFileSync(

            this.configurationFile,

            JSON.stringify(

                configuration,

                null,

                4

            ),

            "utf8"

        );

    }

    public reset()

        : void {

        this.save(

            {

                ...AppConfiguration

            }

        );

    }

    public exists()

        : boolean {

        return existsSync(

            this.configurationFile

        );

    }

}
