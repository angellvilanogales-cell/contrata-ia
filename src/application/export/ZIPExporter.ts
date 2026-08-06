/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * ZIP EXPORTER
 *
 * Generador de paquetes ZIP del expediente.
 *
 ******************************************************************************/

import * as fs from "fs/promises";
import * as path from "path";

export interface ZIPExportResult {

    success: boolean;

    zipFile: string;

    generatedAt: string;

    includedFiles: number;

}

export class ZIPExporter {

    /**************************************************************************
     *
     * Generación
     *
     **************************************************************************/

    public async export(

        sourceDirectory: string,

        destinationDirectory: string,

        expedienteId: string

    ): Promise<ZIPExportResult> {

        await fs.mkdir(

            destinationDirectory,

            {

                recursive: true

            }

        );

        const zipFile =

            path.join(

                destinationDirectory,

                `${expedienteId}.zip`

            );

        /*
         *
         * IMPLEMENTACIÓN TEMPORAL
         *
         * En la versión definitiva se utilizará:
         *
         * adm-zip
         * o
         * archiver
         *
         */

        const files =

            await this.countFiles(

                sourceDirectory

            );

        await fs.writeFile(

            zipFile,

            JSON.stringify(

                {

                    expediente:

                        expedienteId,

                    source:

                        sourceDirectory,

                    files,

                    generatedAt:

                        new Date()

                            .toISOString()

                },

                null,

                4

            ),

            "utf8"

        );

        return {

            success: true,

            zipFile,

            generatedAt:

                new Date()

                    .toISOString(),

            includedFiles:

                files

        };

    }

    /**************************************************************************
     *
     * Conteo de archivos
     *
     **************************************************************************/

    private async countFiles(

        directory: string

    ): Promise<number> {

        let total = 0;

        const entries =

            await fs.readdir(

                directory,

                {

                    withFileTypes: true

                }

            );

        for (

            const entry

            of entries

        ) {

            const current =

                path.join(

                    directory,

                    entry.name

                );

            if (

                entry.isDirectory()

            ) {

                total +=

                    await this.countFiles(

                        current

                    );

            }

            else {

                total++;

            }

        }

        return total;

    }

}
