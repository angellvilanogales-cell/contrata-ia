/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT MANIFEST GENERATOR
 *
 * Generador del MANIFEST de exportación.
 *
 ******************************************************************************/

import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

export interface ManifestFile {

    name: string;

    relativePath: string;

    size: number;

    checksum: string;

    modified: string;

}

export interface ExportManifest {

    expedienteId: string;

    generatedAt: string;

    generator: string;

    totalFiles: number;

    totalSize: number;

    files: ManifestFile[];

}

export class ExportManifestGenerator {

    /**************************************************************************
     *
     * Generación
     *
     **************************************************************************/

    public async generate(

        expedienteId: string,

        directory: string

    ): Promise<ExportManifest> {

        const files =

            await this.scanDirectory(

                directory,

                directory

            );

        const totalSize =

            files.reduce(

                (

                    total,

                    file

                ) =>

                    total +

                    file.size,

                0

            );

        return {

            expedienteId,

            generatedAt:

                new Date()

                    .toISOString(),

            generator:

                "Contrata-IA",

            totalFiles:

                files.length,

            totalSize,

            files

        };

    }

    /**************************************************************************
     *
     * Escaneo recursivo
     *
     **************************************************************************/

    private async scanDirectory(

        root: string,

        current: string

    ): Promise<ManifestFile[]> {

        const result: ManifestFile[] = [];

        const entries =

            await fs.readdir(

                current,

                {

                    withFileTypes: true

                }

            );

        for (

            const entry

            of entries

        ) {

            const absolute =

                path.join(

                    current,

                    entry.name

                );

            if (

                entry.isDirectory()

            ) {

                result.push(

                    ...(await this.scanDirectory(

                        root,

                        absolute

                    ))

                );

            }

            else {

                const stat =

                    await fs.stat(

                        absolute

                    );

                const buffer =

                    await fs.readFile(

                        absolute

                    );

                const checksum =

                    crypto

                        .createHash(

                            "sha256"

                        )

                        .update(

                            buffer

                        )

                        .digest(

                            "hex"

                        );

                result.push({

                    name:

                        entry.name,

                    relativePath:

                        path.relative(

                            root,

                            absolute

                        ),

                    size:

                        stat.size,

                    checksum,

                    modified:

                        stat.mtime.toISOString()

                });

            }

        }

        return result;

    }

}
