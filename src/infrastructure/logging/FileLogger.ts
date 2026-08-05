/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * FILE LOGGER
 *
 ******************************************************************************/

import * as fs from "fs";
import * as path from "path";

import {

    AbstractLogger,
    LogEntry

} from "./Logger";

export class FileLogger

    extends AbstractLogger {

    private readonly logDirectory: string;

    private readonly logFile: string;

    constructor(

        directory = "./logs",

        filename = "application.log"

    ) {

        super();

        this.logDirectory = directory;

        this.logFile = path.join(

            directory,

            filename

        );

        this.ensureDirectory();

    }

    public write(

        entry: LogEntry

    ): void {

        const line =

            this.serialize(

                entry

            );

        fs.appendFileSync(

            this.logFile,

            line,

            {

                encoding: "utf8"

            }

        );

    }

    private ensureDirectory()

        : void {

        if (

            !fs.existsSync(

                this.logDirectory

            )

        ) {

            fs.mkdirSync(

                this.logDirectory,

                {

                    recursive: true

                }

            );

        }

    }

    private serialize(

        entry: LogEntry

    ): string {

        return JSON.stringify({

            timestamp:

                entry.timestamp,

            level:

                entry.level,

            category:

                entry.category,

            source:

                entry.source,

            message:

                entry.message,

            metadata:

                entry.metadata,

            error:

                this.serializeError(

                    entry.error

                )

        }) + "\n";

    }

    private serializeError(

        error: unknown

    ): unknown {

        if (

            error instanceof Error

        ) {

            return {

                name:

                    error.name,

                message:

                    error.message,

                stack:

                    error.stack

            };

        }

        return error;

    }

    public clear()

        : void {

        fs.writeFileSync(

            this.logFile,

            "",

            {

                encoding: "utf8"

            }

        );

    }

    public exists()

        : boolean {

        return fs.existsSync(

            this.logFile

        );

    }

    public size()

        : number {

        if (

            !this.exists()

        ) {

            return 0;

        }

        return fs.statSync(

            this.logFile

        ).size;

    }

    public read()

        : string {

        if (

            !this.exists()

        ) {

            return "";

        }

        return fs.readFileSync(

            this.logFile,

            "utf8"

        );

    }

}
