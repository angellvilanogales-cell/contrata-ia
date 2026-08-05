/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * CONSOLE LOGGER
 *
 ******************************************************************************/

import {

    AbstractLogger,
    LogEntry,
    LogLevel

} from "./Logger";

export class ConsoleLogger

    extends AbstractLogger {

    private readonly colors = {

        TRACE: "\x1b[90m",

        DEBUG: "\x1b[36m",

        INFO: "\x1b[32m",

        WARNING: "\x1b[33m",

        ERROR: "\x1b[31m",

        CRITICAL: "\x1b[35m",

        RESET: "\x1b[0m"

    };

    public write(

        entry: LogEntry

    ): void {

        const color =

            this.getColor(

                entry.level

            );

        const text =

            this.format(

                entry

            );

        console.log(

            color +

            text +

            this.colors.RESET

        );

        if (

            entry.error

        ) {

            console.error(

                entry.error

            );

        }

    }

    private format(

        entry: LogEntry

    ): string {

        const metadata =

            entry.metadata

                ? " " +

                  JSON.stringify(

                      entry.metadata

                  )

                : "";

        return [

            "[ACP]",

            entry.timestamp,

            `[${entry.level}]`,

            `[${entry.category}]`,

            `[${entry.source}]`,

            entry.message +

            metadata

        ].join(" ");

    }

    private getColor(

        level: LogLevel

    ): string {

        switch (

            level

        ) {

            case LogLevel.TRACE:

                return this.colors.TRACE;

            case LogLevel.DEBUG:

                return this.colors.DEBUG;

            case LogLevel.INFO:

                return this.colors.INFO;

            case LogLevel.WARNING:

                return this.colors.WARNING;

            case LogLevel.ERROR:

                return this.colors.ERROR;

            case LogLevel.CRITICAL:

                return this.colors.CRITICAL;

            default:

                return this.colors.RESET;

        }

    }

}
