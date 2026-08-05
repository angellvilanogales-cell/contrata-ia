/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * LOGGING BOOTSTRAP
 *
 * Punto único de inicialización del sistema de logging.
 *
 ******************************************************************************/

import {

    Logger,
    LogLevel

} from "./Logger";

import {

    LoggerFactory,
    LoggerType

} from "./LoggerFactory";

import {

    AuditLogger

} from "./AuditLogger";

export interface LoggingConfiguration {

    logger: LoggerType;

    minimumLevel: LogLevel;

    enableAudit: boolean;

}

export class LoggingBootstrap {

    private static initialized = false;

    private static logger: Logger;

    private static auditLogger?: AuditLogger;

    private static configuration: LoggingConfiguration;

    public static initialize(

        configuration?: Partial<LoggingConfiguration>

    ): void {

        if (

            this.initialized

        ) {

            return;

        }

        this.configuration = {

            logger:

                LoggerType.HYBRID,

            minimumLevel:

                LogLevel.INFO,

            enableAudit:

                true,

            ...configuration

        };

        this.logger =

            LoggerFactory.create(

                this.configuration.logger

            );

        if (

            this.configuration.enableAudit

        ) {

            this.auditLogger =

                LoggerFactory.getAuditLogger();

        }

        this.initialized = true;

        this.logger.info(

            "BOOTSTRAP",

            "LoggingBootstrap",

            "Logging initialized.",

            {

                logger:

                    this.configuration.logger,

                audit:

                    this.configuration.enableAudit,

                minimumLevel:

                    this.configuration.minimumLevel

            }

        );

    }

    public static getLogger()

        : Logger {

        if (

            !this.initialized

        ) {

            this.initialize();

        }

        return this.logger;

    }

    public static getAuditLogger()

        : AuditLogger {

        if (

            !this.auditLogger

        ) {

            throw new Error(

                "AuditLogger not initialized."

            );

        }

        return this.auditLogger;

    }

    public static configurationInfo()

        : LoggingConfiguration {

        return this.configuration;

    }

    public static isInitialized()

        : boolean {

        return this.initialized;

    }

    public static shutdown()

        : void {

        if (

            !this.initialized

        ) {

            return;

        }

        this.logger.info(

            "BOOTSTRAP",

            "LoggingBootstrap",

            "Logging shutdown."

        );

        this.initialized = false;

    }

}
