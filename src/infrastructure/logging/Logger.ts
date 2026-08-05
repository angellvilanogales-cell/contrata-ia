/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * LOGGER
 *
 * Contrato base para cualquier sistema de registro.
 *
 ******************************************************************************/

export enum LogLevel {

    TRACE = "TRACE",

    DEBUG = "DEBUG",

    INFO = "INFO",

    WARNING = "WARNING",

    ERROR = "ERROR",

    CRITICAL = "CRITICAL"

}

export interface LogEntry {

    timestamp: string;

    level: LogLevel;

    category: string;

    source: string;

    message: string;

    metadata?: Record<string, unknown>;

    error?: unknown;

}

export interface Logger {

    trace(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void;

    debug(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void;

    info(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void;

    warning(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void;

    error(

        category: string,

        source: string,

        message: string,

        error?: unknown,

        metadata?: Record<string, unknown>

    ): void;

    critical(

        category: string,

        source: string,

        message: string,

        error?: unknown,

        metadata?: Record<string, unknown>

    ): void;

    write(

        entry: LogEntry

    ): void;

}

export abstract class AbstractLogger

    implements Logger {

    public trace(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void {

        this.write(

            this.createEntry(

                LogLevel.TRACE,

                category,

                source,

                message,

                undefined,

                metadata

            )

        );

    }

    public debug(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void {

        this.write(

            this.createEntry(

                LogLevel.DEBUG,

                category,

                source,

                message,

                undefined,

                metadata

            )

        );

    }

    public info(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void {

        this.write(

            this.createEntry(

                LogLevel.INFO,

                category,

                source,

                message,

                undefined,

                metadata

            )

        );

    }

    public warning(

        category: string,

        source: string,

        message: string,

        metadata?: Record<string, unknown>

    ): void {

        this.write(

            this.createEntry(

                LogLevel.WARNING,

                category,

                source,

                message,

                undefined,

                metadata

            )

        );

    }

    public error(

        category: string,

        source: string,

        message: string,

        error?: unknown,

        metadata?: Record<string, unknown>

    ): void {

        this.write(

            this.createEntry(

                LogLevel.ERROR,

                category,

                source,

                message,

                error,

                metadata

            )

        );

    }

    public critical(

        category: string,

        source: string,

        message: string,

        error?: unknown,

        metadata?: Record<string, unknown>

    ): void {

        this.write(

            this.createEntry(

                LogLevel.CRITICAL,

                category,

                source,

                message,

                error,

                metadata

            )

        );

    }

    protected createEntry(

        level: LogLevel,

        category: string,

        source: string,

        message: string,

        error?: unknown,

        metadata?: Record<string, unknown>

    ): LogEntry {

        return {

            timestamp:

                new Date().toISOString(),

            level,

            category,

            source,

            message,

            metadata,

            error

        };

    }

    public abstract write(

        entry: LogEntry

    ): void;

}
