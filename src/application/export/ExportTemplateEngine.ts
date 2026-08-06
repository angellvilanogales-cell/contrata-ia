/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT TEMPLATE ENGINE
 *
 * Motor de plantillas para todos los exportadores.
 *
 ******************************************************************************/

import * as fs from "fs/promises";
import * as path from "path";

export interface ExportTemplate {

    name: string;

    description: string;

    content: string;

}

export class ExportTemplateEngine {

    constructor(

        private readonly templatesDirectory =

            "./templates"

    ) {}

    /**************************************************************************
     *
     * Cargar plantilla
     *
     **************************************************************************/

    public async load(

        name: string

    ): Promise<ExportTemplate> {

        const file =

            path.join(

                this.templatesDirectory,

                `${name}.template`

            );

        const content =

            await fs.readFile(

                file,

                "utf8"

            );

        return {

            name,

            description:

                `Template ${name}`,

            content

        };

    }

    /**************************************************************************
     *
     * Aplicar plantilla
     *
     **************************************************************************/

    public apply(

        template: ExportTemplate,

        variables:

            Record<string, unknown>

    ): string {

        let result =

            template.content;

        for (

            const [

                key,

                value

            ]

            of Object.entries(

                variables

            )

        ) {

            const token =

                `{{${key}}}`;

            result =

                result.replaceAll(

                    token,

                    String(value)

                );

        }

        return result;

    }

    /**************************************************************************
     *
     * Aplicación directa
     *
     **************************************************************************/

    public async render(

        templateName: string,

        variables:

            Record<string, unknown>

    ): Promise<string> {

        const template =

            await this.load(

                templateName

            );

        return this.apply(

            template,

            variables

        );

    }

    /**************************************************************************
     *
     * Comprobar existencia
     *
     **************************************************************************/

    public async exists(

        templateName: string

    ): Promise<boolean> {

        try {

            await fs.access(

                path.join(

                    this.templatesDirectory,

                    `${templateName}.template`

                )

            );

            return true;

        }

        catch {

            return false;

        }

    }

}
