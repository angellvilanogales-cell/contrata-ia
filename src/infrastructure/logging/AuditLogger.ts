/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AUDIT LOGGER
 *
 * Registro inmutable de todas las acciones relevantes realizadas
 * sobre un expediente administrativo.
 *
 ******************************************************************************/

import * as fs from "fs";
import * as path from "path";

export interface AuditRecord {

    id: string;

    timestamp: string;

    expedienteId: string;

    user: string;

    action: string;

    module: string;

    description: string;

    previousState?: unknown;

    newState?: unknown;

    metadata?: Record<string, unknown>;

}

export class AuditLogger {

    private readonly directory: string;

    private readonly file: string;

    constructor(

        directory = "./logs",

        filename = "audit.log"

    ) {

        this.directory = directory;

        this.file = path.join(

            directory,

            filename

        );

        this.ensureDirectory();

    }

    public register(

        record: AuditRecord

    ): void {

        fs.appendFileSync(

            this.file,

            JSON.stringify(

                record

            ) + "\n",

            {

                encoding: "utf8"

            }

        );

    }

    public buildRecord(

        expedienteId: string,

        user: string,

        action: string,

        module: string,

        description: string,

        previousState?: unknown,

        newState?: unknown,

        metadata?: Record<string, unknown>

    ): AuditRecord {

        return {

            id:

                crypto.randomUUID(),

            timestamp:

                new Date()

                    .toISOString(),

            expedienteId,

            user,

            action,

            module,

            description,

            previousState,

            newState,

            metadata

        };

    }

    public read()

        : AuditRecord[] {

        if (

            !fs.existsSync(

                this.file

            )

        ) {

            return [];

        }

        return fs

            .readFileSync(

                this.file,

                "utf8"

            )

            .split("\n")

            .filter(

                line =>

                    line.trim()

                        .length > 0

            )

            .map(

                line =>

                    JSON.parse(

                        line

                    ) as AuditRecord

            );

    }

    public clear()

        : void {

        fs.writeFileSync(

            this.file,

            "",

            {

                encoding: "utf8"

            }

        );

    }

    private ensureDirectory()

        : void {

        if (

            !fs.existsSync(

                this.directory

            )

        ) {

            fs.mkdirSync(

                this.directory,

                {

                    recursive: true

                }

            );

        }

    }

}
