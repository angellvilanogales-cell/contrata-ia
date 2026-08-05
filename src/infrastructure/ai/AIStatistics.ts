/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI STATISTICS
 *
 * Estadísticas globales de utilización de la infraestructura IA.
 *
 ******************************************************************************/

import { AIProviderType } from "./CostEstimator";

/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

export interface AIExecutionRecord{

    provider:AIProviderType;

    model:string;

    success:boolean;

    duration:number;

    promptTokens:number;

    completionTokens:number;

    cost:number;

    timestamp:string;

}

/*===========================================================================
=
= RESUMEN
=
===========================================================================*/

export interface AIStatisticsSummary{

    executions:number;

    successful:number;

    failed:number;

    averageDuration:number;

    totalPromptTokens:number;

    totalCompletionTokens:number;

    totalTokens:number;

    totalCost:number;

}

/*===========================================================================
=
= AI STATISTICS
=
===========================================================================*/

export class AIStatistics{

    private readonly history:

        AIExecutionRecord[]=[];

/*===========================================================================
=
= REGISTRAR
=
===========================================================================*/

    public register(

        record:AIExecutionRecord

    ):void{

        this.history.push(

            record

        );

    }

/*===========================================================================
=
= HISTORIAL
=
===========================================================================*/

    public historyReport()

        :ReadonlyArray<AIExecutionRecord>{

        return Object.freeze(

            [

                ...this.history

            ]

        );

    }

/*===========================================================================
=
= RESUMEN
=
===========================================================================*/

    public summary()

        :AIStatisticsSummary{

        const executions=

            this.history.length;

        const successful=

            this.history.filter(

                r=>r.success

            ).length;

        const failed=

            executions-successful;

        const totalDuration=

            this.history.reduce(

                (

                    total,

                    record

                )=>

                    total+

                    record.duration,

                0

            );

        const promptTokens=

            this.history.reduce(

                (

                    total,

                    record

                )=>

                    total+

                    record.promptTokens,

                0

            );

        const completionTokens=

            this.history.reduce(

                (

                    total,

                    record

                )=>

                    total+

                    record.completionTokens,

                0

            );

        const totalCost=

            this.history.reduce(

                (

                    total,

                    record

                )=>

                    total+

                    record.cost,

                0

            );

        return{

            executions,

            successful,

            failed,

            averageDuration:

                executions===0

                ?0

                :

                totalDuration/

                executions,

            totalPromptTokens:

                promptTokens,

            totalCompletionTokens:

                completionTokens,

            totalTokens:

                promptTokens+

                completionTokens,

            totalCost

        };

    }

/*===========================================================================
=
= ESTADÍSTICAS POR PROVEEDOR
=
===========================================================================*/

    public byProvider(){

        const result=

            new Map<AIProviderType,number>();

        for(

            const record

            of this.history

        ){

            result.set(

                record.provider,

                (

                    result.get(

                        record.provider

                    )??0

                )+1

            );

        }

        return result;

    }

/*===========================================================================
=
= ESTADÍSTICAS POR MODELO
=
===========================================================================*/

    public byModel(){

        const result=

            new Map<string,number>();

        for(

            const record

            of this.history

        ){

            result.set(

                record.model,

                (

                    result.get(

                        record.model

                    )??0

                )+1

            );

        }

        return result;

    }

/*===========================================================================
=
= COSTE ACUMULADO
=
===========================================================================*/

    public accumulatedCost()

        :number{

        return this.summary()

            .totalCost;

    }

/*===========================================================================
=
= TOKENS ACUMULADOS
=
===========================================================================*/

    public accumulatedTokens()

        :number{

        return this.summary()

            .totalTokens;

    }

/*===========================================================================
=
= LIMPIEZA
=
===========================================================================*/

    public clear()

        :void{

        this.history.length=0;

    }

}
