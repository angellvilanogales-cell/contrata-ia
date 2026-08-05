/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * TOKEN COUNTER
 *
 * Estimación y contabilización de tokens utilizados por modelos LLM.
 *
 ******************************************************************************/

import {
    AIProviderRequest,
    AIProviderResponse
} from "./AIProvider";

/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

export interface TokenStatistics{

    promptTokens:number;

    completionTokens:number;

    totalTokens:number;

    requests:number;

}

/*===========================================================================
=
= TOKEN COUNTER
=
===========================================================================*/

export class TokenCounter{

    private statistics:TokenStatistics={

        promptTokens:0,

        completionTokens:0,

        totalTokens:0,

        requests:0

    };

/*===========================================================================
=
= ESTIMACIÓN DEL PROMPT
=
===========================================================================*/

    public estimatePromptTokens(

        request:AIProviderRequest

    ):number{

        return this.estimateText(

            request.prompt

        );

    }

/*===========================================================================
=
= ESTIMACIÓN RESPUESTA
=
===========================================================================*/

    public estimateCompletionTokens(

        response:AIProviderResponse

    ):number{

        return this.estimateText(

            response.content

        );

    }

/*===========================================================================
=
= ESTIMACIÓN DE TEXTO
=
===========================================================================*/

    public estimateText(

        text:string

    ):number{

        if(

            !text

        ){

            return 0;

        }

        const words=

            text.trim()

                .split(/\s+/)

                .length;

        return Math.ceil(

            words*1.35

        );

    }

/*===========================================================================
=
= REGISTRO
=
===========================================================================*/

    public register(

        request:AIProviderRequest,

        response:AIProviderResponse

    ):void{

        const prompt=

            this.estimatePromptTokens(

                request

            );

        const completion=

            this.estimateCompletionTokens(

                response

            );

        this.statistics.promptTokens+=

            prompt;

        this.statistics.completionTokens+=

            completion;

        this.statistics.totalTokens+=

            prompt+

            completion;

        this.statistics.requests++;

    }

/*===========================================================================
=
= TOTAL
=
===========================================================================*/

    public total()

        :number{

        return this.statistics.totalTokens;

    }

    public prompt()

        :number{

        return this.statistics.promptTokens;

    }

    public completion()

        :number{

        return this.statistics.completionTokens;

    }

/*===========================================================================
=
= MEDIA
=
===========================================================================*/

    public averageTokens()

        :number{

        if(

            this.statistics.requests===0

        ){

            return 0;

        }

        return(

            this.statistics.totalTokens/

            this.statistics.requests

        );

    }

/*===========================================================================
=
= RESET
=
===========================================================================*/

    public reset()

        :void{

        this.statistics={

            promptTokens:0,

            completionTokens:0,

            totalTokens:0,

            requests:0

        };

    }

/*===========================================================================
=
= EXPORTACIÓN
=
===========================================================================*/

    public statisticsReport()

        :TokenStatistics{

        return{

            ...this.statistics

        };

    }

/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

    public information(){

        return{

            requests:

                this.statistics.requests,

            promptTokens:

                this.statistics.promptTokens,

            completionTokens:

                this.statistics.completionTokens,

            totalTokens:

                this.statistics.totalTokens,

            average:

                this.averageTokens()

        };

    }

}
