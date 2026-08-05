/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * COST ESTIMATOR
 *
 * Estimación de costes de utilización de modelos LLM.
 *
 ******************************************************************************/

import { TokenCounter } from "./TokenCounter";

/*===========================================================================
=
= PROVEEDORES
=
===========================================================================*/

export enum AIProviderType{

    OPENAI="OPENAI",

    ANTHROPIC="ANTHROPIC",

    GEMINI="GEMINI",

    OLLAMA="OLLAMA",

    UNKNOWN="UNKNOWN"

}

/*===========================================================================
=
= MODELO
=
===========================================================================*/

export interface ModelPricing{

    provider:AIProviderType;

    model:string;

    inputPricePerMillion:number;

    outputPricePerMillion:number;

}

/*===========================================================================
=
= RESULTADO
=
===========================================================================*/

export interface CostEstimate{

    provider:AIProviderType;

    model:string;

    promptTokens:number;

    completionTokens:number;

    totalTokens:number;

    inputCost:number;

    outputCost:number;

    totalCost:number;

}

/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

export interface CostStatistics{

    totalRequests:number;

    totalCost:number;

    totalPromptTokens:number;

    totalCompletionTokens:number;

}

/*===========================================================================
=
= COST ESTIMATOR
=
===========================================================================*/

export class CostEstimator{

    private readonly pricing=

        new Map<string,ModelPricing>();

    private readonly statistics:CostStatistics={

        totalRequests:0,

        totalCost:0,

        totalPromptTokens:0,

        totalCompletionTokens:0

    };

    constructor(

        private readonly tokenCounter:TokenCounter

    ){

        this.loadDefaultPricing();

    }

/*===========================================================================
=
= PRECIOS POR DEFECTO
=
===========================================================================*/

    private loadDefaultPricing()

        :void{

        this.register({

            provider:

                AIProviderType.OPENAI,

            model:

                "gpt-5",

            inputPricePerMillion:

                1.25,

            outputPricePerMillion:

                10.00

        });

        this.register({

            provider:

                AIProviderType.OPENAI,

            model:

                "gpt-5-mini",

            inputPricePerMillion:

                0.25,

            outputPricePerMillion:

                2.00

        });

        this.register({

            provider:

                AIProviderType.ANTHROPIC,

            model:

                "claude",

            inputPricePerMillion:

                3.00,

            outputPricePerMillion:

                15.00

        });

        this.register({

            provider:

                AIProviderType.GEMINI,

            model:

                "gemini",

            inputPricePerMillion:

                0.35,

            outputPricePerMillion:

                1.05

        });

        this.register({

            provider:

                AIProviderType.OLLAMA,

            model:

                "local",

            inputPricePerMillion:

                0,

            outputPricePerMillion:

                0

        });

    }

/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

    public register(

        pricing:ModelPricing

    ):void{

        this.pricing.set(

            this.key(

                pricing.provider,

                pricing.model

            ),

            pricing

        );

    }

/*===========================================================================
=
= ESTIMACIÓN
=
===========================================================================*/

    public estimate(

        provider:AIProviderType,

        model:string,

        promptTokens:number,

        completionTokens:number

    ):CostEstimate{

        const pricing=

            this.findPricing(

                provider,

                model

            );

        const inputCost=

            (promptTokens/

            1_000_000)

            *

            pricing.inputPricePerMillion;

        const outputCost=

            (completionTokens/

            1_000_000)

            *

            pricing.outputPricePerMillion;

        const estimate={

            provider,

            model,

            promptTokens,

            completionTokens,

            totalTokens:

                promptTokens+

                completionTokens,

            inputCost,

            outputCost,

            totalCost:

                inputCost+

                outputCost

        };

        this.statistics.totalRequests++;

        this.statistics.totalCost+=

            estimate.totalCost;

        this.statistics.totalPromptTokens+=

            promptTokens;

        this.statistics.totalCompletionTokens+=

            completionTokens;

        return estimate;

    }

/*===========================================================================
=
= CONSULTA
=
===========================================================================*/

    private findPricing(

        provider:AIProviderType,

        model:string

    ):ModelPricing{

        const pricing=

            this.pricing.get(

                this.key(

                    provider,

                    model

                )

            );

        if(

            pricing

        ){

            return pricing;

        }

        return{

            provider,

            model,

            inputPricePerMillion:0,

            outputPricePerMillion:0

        };

    }

/*===========================================================================
=
= CLAVE
=
===========================================================================*/

    private key(

        provider:AIProviderType,

        model:string

    ):string{

        return`${provider}:${model}`;

    }

/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

    public statisticsReport()

        :CostStatistics{

        return{

            ...this.statistics

        };

    }

    public averageCost()

        :number{

        if(

            this.statistics.totalRequests===0

        ){

            return 0;

        }

        return(

            this.statistics.totalCost/

            this.statistics.totalRequests

        );

    }

    public reset()

        :void{

        this.statistics.totalRequests=0;

        this.statistics.totalCost=0;

        this.statistics.totalPromptTokens=0;

        this.statistics.totalCompletionTokens=0;

    }

    public availableModels()

        :ReadonlyArray<ModelPricing>{

        return Object.freeze(

            [

                ...this.pricing.values()

            ]

        );

    }

}
