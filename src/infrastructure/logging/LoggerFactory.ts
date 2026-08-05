/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * LOGGER FACTORY
 *
 ******************************************************************************/

import {

    Logger

} from "./Logger";

import {

    ConsoleLogger

} from "./ConsoleLogger";

import {

    FileLogger

} from "./FileLogger";

import {

    AuditLogger

} from "./AuditLogger";

export enum LoggerType {

    CONSOLE = "CONSOLE",

    FILE = "FILE",

    HYBRID = "HYBRID"

}

export class HybridLogger

    implements Logger {

    constructor(

        private readonly consoleLogger: ConsoleLogger,

        private readonly fileLogger: FileLogger

    ) {}

    public trace(

        category:string,

        source:string,

        message:string,

        metadata?:Record<string,unknown>

    ):void{

        this.consoleLogger.trace(

            category,

            source,

            message,

            metadata

        );

        this.fileLogger.trace(

            category,

            source,

            message,

            metadata

        );

    }

    public debug(

        category:string,

        source:string,

        message:string,

        metadata?:Record<string,unknown>

    ):void{

        this.consoleLogger.debug(

            category,

            source,

            message,

            metadata

        );

        this.fileLogger.debug(

            category,

            source,

            message,

            metadata

        );

    }

    public info(

        category:string,

        source:string,

        message:string,

        metadata?:Record<string,unknown>

    ):void{

        this.consoleLogger.info(

            category,

            source,

            message,

            metadata

        );

        this.fileLogger.info(

            category,

            source,

            message,

            metadata

        );

    }

    public warning(

        category:string,

        source:string,

        message:string,

        metadata?:Record<string,unknown>

    ):void{

        this.consoleLogger.warning(

            category,

            source,

            message,

            metadata

        );

        this.fileLogger.warning(

            category,

            source,

            message,

            metadata

        );

    }

    public error(

        category:string,

        source:string,

        message:string,

        error?:unknown,

        metadata?:Record<string,unknown>

    ):void{

        this.consoleLogger.error(

            category,

            source,

            message,

            error,

            metadata

        );

        this.fileLogger.error(

            category,

            source,

            message,

            error,

            metadata

        );

    }

    public critical(

        category:string,

        source:string,

        message:string,

        error?:unknown,

        metadata?:Record<string,unknown>

    ):void{

        this.consoleLogger.critical(

            category,

            source,

            message,

            error,

            metadata

        );

        this.fileLogger.critical(

            category,

            source,

            message,

            error,

            metadata

        );

    }

    public write(entry:any):void{

        this.consoleLogger.write(entry);

        this.fileLogger.write(entry);

    }

}

export class LoggerFactory {

    private static consoleLogger=

        new ConsoleLogger();

    private static fileLogger=

        new FileLogger();

    private static auditLogger=

        new AuditLogger();

    private static hybridLogger=

        new HybridLogger(

            LoggerFactory.consoleLogger,

            LoggerFactory.fileLogger

        );

    public static create(

        type:LoggerType=

            LoggerType.HYBRID

    ):Logger{

        switch(type){

            case LoggerType.CONSOLE:

                return this.consoleLogger;

            case LoggerType.FILE:

                return this.fileLogger;

            default:

                return this.hybridLogger;

        }

    }

    public static getAuditLogger()

        :AuditLogger{

        return this.auditLogger;

    }

    public static getConsoleLogger()

        :ConsoleLogger{

        return this.consoleLogger;

    }

    public static getFileLogger()

        :FileLogger{

        return this.fileLogger;

    }

}
