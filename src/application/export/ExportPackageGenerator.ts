/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT PACKAGE GENERATOR
 *
 * Generador de paquetes completos del expediente.
 *
 ******************************************************************************/

import * as fs from "fs/promises";
import * as path from "path";

export interface ExportedDocument {

    name: string;

    filePath: string;

    format: string;

}

export interface ExportPackage {

    expedienteId: string;

    packageDirectory: string;

    documents: ExportedDocument[];

    generatedAt: string;

}

export class ExportPackageGenerator {

    /**************************************************************************
     *
     * Crear paquete
     *
     **************************************************************************/

    public async create(

        expedienteId: string,

        destinationFolder: string,

        documents: ExportedDocument[]

    ): Promise<ExportPackage> {

        const packageDirectory =

            path.join(

                destinationFolder,

                expedienteId

            );

        await fs.mkdir(

            packageDirectory,

            {

                recursive: true

            }

        );

        for (

            const document

            of documents

        ) {

            const destination =

                path.join(

                    packageDirectory,

                    path.basename(

                        document.filePath

                    )

                );

            await fs.copyFile(

                document.filePath,

                destination

            );

        }

        return {

            expedienteId,

            packageDirectory,

            documents,

            generatedAt:

                new Date()

                    .toISOString()

        };

    }

    /**************************************************************************
     *
     * Crear estructura estándar
     *
     **************************************************************************/

    public async createStandardStructure(

        rootFolder: string

    ): Promise<void> {

        const folders = [

            "01_MEMORIA",

            "02_PCAP",

            "03_PPT",

            "04_INFORMES",

            "05_ANEXOS",

            "06_EXPORTACIONES",

            "07_AUDITORIA"

        ];

        for (

            const folder

            of folders

        ) {

            await fs.mkdir(

                path.join(

                    rootFolder,

                    folder

                ),

                {

                    recursive: true

                }

            );

        }

    }

}
