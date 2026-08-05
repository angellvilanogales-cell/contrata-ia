/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EXECUTION LOGGER
 *
 * Registro de ejecución técnica del sistema.
 *
 ******************************************************************************/

import {

    Logger

} from "./Logger";

export interface ExecutionContext{

    module:string;

    operation:string;

    expedienteId?:string;

    correlationId?:string;

    metadata?:Record<string,unknown>;

}

export class ExecutionLogger{

    constructor(

        private readonly logger:Logger

    ){

    }

    /**************************************************************************
     *
     * Inicio
     *
     **************************************************************************/

    public begin(

        context:ExecutionContext

    ):number{

        const started=

            Date.now();

        this.logger.info(

            "Execution",

            context.module,

            `BEGIN ${context.operation}`,

            {

                started,

                expediente:

                    context.expedienteId,

                correlation:

                    context.correlationId,

                ...context.metadata

            }

        );

        return started;

    }

    /**************************************************************************
     *
     * Fin correcto
     *
     **************************************************************************/

    public end(

        context:ExecutionContext,

        started:number

    ):void{

        const duration=

            Date.now()-started;

        this.logger.info(

            "Execution",

            context.module,

            `END ${context.operation}`,

            {

                duration,

                expediente:

                    context.expedienteId,

                correlation:

                    context.correlationId,

                ...context.metadata

            }

        );

    }

    /**************************************************************************
     *
     * Error
     *
     **************************************************************************/

    public fail(

        context:ExecutionContext,

        started:number,

        error:unknown

    ):void{

        const duration=

            Date.now()-started;

        this.logger.error(

            "Execution",

            context.module,

            `FAIL ${context.operation}`,

            error,

            {

                duration,

                expediente:

                    context.expedienteId,

                correlation:

                    context.correlationId,

                ...context.metadata

            }

        );

    }

    /**************************************************************************
     *
     * Paso intermedio
     *
     **************************************************************************/

    public step(

        context:ExecutionContext,

        description:string,

        metadata?:Record<string,unknown>

    ):void{

        this.logger.debug(

            "Execution",

            context.module,

            description,

            {

                expediente:

                    context.expedienteId,

                correlation:

                    context.correlationId,

                ...context.metadata,

                ...metadata

            }

        );

    }

    /**************************************************************************
     *
     * Medición
     *
     **************************************************************************/

    public metric(

        context:ExecutionContext,

        metric:string,

        value:number

    ):void{

        this.logger.info(

            "Metric",

            context.module,

            metric,

            {

                value,

                expediente:

                    context.expedienteId,

                correlation:

                    context.correlationId

            }

        );

    }

}
