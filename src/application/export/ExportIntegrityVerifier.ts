/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXPORT INTEGRITY VERIFIER
 *
 * Verificador de integridad del expediente exportado.
 *
 ******************************************************************************/

import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

import {

    ExportManifest,
    ManifestFile

} from "./ExportManifestGenerator";

export interface IntegrityVerificationResult {

    valid: boolean;

    checkedFiles: number;

    invalidFiles: ManifestFile[];

    missingFiles: string[];

    generatedAt: string;

}

export class ExportIntegrityVerifier {

    /**************************************************************************
     *
     * Verificación
     *
     **************************************************************************/

    public async verify(

        manifest: ExportManifest,

        directory: string

    ): Promise<IntegrityVerificationResult> {

        const invalidFiles: ManifestFile[] = [];

        const missingFiles: string[] = [];

        for (

            const file

            of manifest.files

        ) {

            const absolutePath =

                path.join(

                    directory,

                    file.relativePath

                );

            try {

                const buffer =

                    await fs.readFile(

                        absolutePath

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

                if (

                    checksum !==

                    file.checksum

                ) {

                    invalidFiles.push(

                        file

                    );

                }

            }

            catch {

                missingFiles.push(

                    file.relativePath

                );

            }

        }

        return {

            valid:

                invalidFiles.length === 0 &&

                missingFiles.length === 0,

            checkedFiles:

                manifest.files.length,

            invalidFiles,

            missingFiles,

            generatedAt:

                new Date()

                    .toISOString()

        };

    }

}
