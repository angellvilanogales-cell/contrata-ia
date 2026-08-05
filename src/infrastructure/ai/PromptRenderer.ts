/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PROMPT RENDERER
 *
 * Convierte el contexto del expediente en prompts completos para
 * cualquier proveedor LLM.
 *
 ******************************************************************************/

import { AIMessage, AIRole } from "./AIProvider";

export interface PromptVariable {

    name: string;

    value: unknown;

}

export interface PromptTemplate {

    id: string;

    name: string;

    description: string;

    systemPrompt: string;

    userPrompt: string;

}

export interface PromptRenderRequest {

    template: PromptTemplate;

    variables: PromptVariable[];

    additionalContext?: string;

}

export interface PromptRenderResult {

    system: string;

    user: string;

    messages: AIMessage[];

}

export class PromptRenderer {

    /**********************************************************************
     * RENDER
     **********************************************************************/

    public render(

        request: PromptRenderRequest

    ): PromptRenderResult {

        const system = this.replaceVariables(

            request.template.systemPrompt,

            request.variables

        );

        let user = this.replaceVariables(

            request.template.userPrompt,

            request.variables

        );

        if (

            request.additionalContext

        ) {

            user +=

                "\n\n"

                +

                request.additionalContext;

        }

        return {

            system,

            user,

            messages: [

                {

                    role: AIRole.SYSTEM,

                    content: system

                },

                {

                    role: AIRole.USER,

                    content: user

                }

            ]

        };

    }

    /**********************************************************************
     * RENDER STRING
     **********************************************************************/

    public renderString(

        template: string,

        variables: PromptVariable[]

    ): string {

        return this.replaceVariables(

            template,

            variables

        );

    }

    /**********************************************************************
     * VARIABLES
     **********************************************************************/

    private replaceVariables(

        template: string,

        variables: PromptVariable[]

    ): string {

        let result = template;

        for (

            const variable

            of variables

        ) {

            const value =

                this.stringify(

                    variable.value

                );

            result = result.replaceAll(

                `{{${variable.name}}}`,

                value

            );

        }

        return result;

    }

    /**********************************************************************
     * STRINGIFY
     **********************************************************************/

    private stringify(

        value: unknown

    ): string {

        if (

            value === null ||

            value === undefined

        ) {

            return "";

        }

        if (

            typeof value === "string"

        ) {

            return value;

        }

        if (

            typeof value === "number" ||

            typeof value === "boolean"

        ) {

            return value.toString();

        }

        return JSON.stringify(

            value,

            null,

            2

        );

    }

    /**********************************************************************
     * VALIDATE
     **********************************************************************/

    public validate(

        template: PromptTemplate

    ): boolean {

        return (

            template.systemPrompt.length > 0 &&

            template.userPrompt.length > 0

        );

    }

    /**********************************************************************
     * EXTRACT VARIABLES
     **********************************************************************/

    public extractVariables(

        text: string

    ): string[] {

        const regex = /\{\{(.*?)\}\}/g;

        const variables: string[] = [];

        let match: RegExpExecArray | null;

        while (

            (match = regex.exec(text)) !== null

        ) {

            variables.push(

                match[1]

            );

        }

        return [

            ...new Set(

                variables

            )

        ];

    }

    /**********************************************************************
     * MERGE VARIABLES
     **********************************************************************/

    public mergeVariables(

        ...collections: PromptVariable[][]

    ): PromptVariable[] {

        const map =

            new Map<string, PromptVariable>();

        for (

            const collection

            of collections

        ) {

            for (

                const variable

                of collection

            ) {

                map.set(

                    variable.name,

                    variable

                );

            }

        }

        return [

            ...map.values()

        ];

    }

}
