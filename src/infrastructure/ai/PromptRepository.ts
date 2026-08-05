/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * PROMPT REPOSITORY
 *
 * Repositorio centralizado de todos los prompts utilizados por el sistema.
 *
 ******************************************************************************/

import { PromptTemplate } from "./PromptRenderer";

export class PromptRepository {

    private readonly templates =

        new Map<string, PromptTemplate>();

    constructor() {

        this.registerDefaults();

    }

    /**********************************************************************
     * REGISTRO
     **********************************************************************/

    public register(

        template: PromptTemplate

    ): void {

        this.templates.set(

            template.id,

            template

        );

    }

    /**********************************************************************
     * OBTENER
     **********************************************************************/

    public get(

        id: string

    ): PromptTemplate {

        const template =

            this.templates.get(id);

        if (!template) {

            throw new Error(

                `Prompt '${id}' no encontrado.`

            );

        }

        return template;

    }

    /**********************************************************************
     * EXISTE
     **********************************************************************/

    public exists(

        id: string

    ): boolean {

        return this.templates.has(id);

    }

    /**********************************************************************
     * LISTADO
     **********************************************************************/

    public getAll()

        : ReadonlyArray<PromptTemplate> {

        return [

            ...this.templates.values()

        ];

    }

    /**********************************************************************
     * ELIMINAR
     **********************************************************************/

    public remove(

        id: string

    ): boolean {

        return this.templates.delete(id);

    }

    /**********************************************************************
     * LIMPIAR
     **********************************************************************/

    public clear(): void {

        this.templates.clear();

    }

    /**********************************************************************
     * PROMPTS POR DEFECTO
     **********************************************************************/

    private registerDefaults(): void {

        this.register({

            id: "LEGAL_ANALYSIS",

            name: "Análisis Jurídico",

            description:

                "Genera una justificación jurídica.",

            systemPrompt:

`Eres un experto en contratación pública española.

Debes justificar todas las decisiones utilizando exclusivamente la normativa disponible.

Nunca inventes artículos.

Si falta información debes indicarlo.`,

            userPrompt:

`Analiza jurídicamente el siguiente expediente:

{{EXPEDIENTE}}

Normativa disponible:

{{NORMATIVA}}

Genera una justificación completa.`

        });

        this.register({

            id: "PCAP",

            name: "PCAP",

            description:

                "Generación del Pliego de Cláusulas Administrativas.",

            systemPrompt:

`Genera un PCAP conforme a la LCSP.

Mantén formato administrativo.

No elimines apartados obligatorios.`,

            userPrompt:

`Información del contrato:

{{CONTRATO}}

Normativa:

{{NORMATIVA}}

Redacta el PCAP completo.`

        });

        this.register({

            id: "PPT",

            name: "PPT",

            description:

                "Generación del Pliego Técnico.",

            systemPrompt:

`Redacta el PPT utilizando lenguaje técnico y administrativo.`,

            userPrompt:

`Objeto:

{{OBJETO}}

Necesidad:

{{NECESIDAD}}

Requisitos:

{{REQUISITOS}}

Genera el PPT.`

        });

        this.register({

            id: "MEMORIA",

            name: "Memoria Justificativa",

            description:

                "Redacción de memoria justificativa.",

            systemPrompt:

`Redacta una memoria justificativa conforme a la LCSP.`,

            userPrompt:

`Información:

{{EXPEDIENTE}}

Objetivos:

{{OBJETIVOS}}

Genera la memoria.`

        });

        this.register({

            id: "CPV",

            name: "Selección CPV",

            description:

                "Identificación de códigos CPV.",

            systemPrompt:

`Selecciona los códigos CPV más adecuados justificando cada uno.`,

            userPrompt:

`Objeto contractual:

{{OBJETO}}

Catálogo CPV:

{{CATALOGO}}

Selecciona el CPV adecuado.`

        });

        this.register({

            id: "CLAUSES",

            name: "Cláusulas",

            description:

                "Generación de cláusulas administrativas.",

            systemPrompt:

`Redacta cláusulas administrativas completas.`,

            userPrompt:

`Contrato:

{{CONTRATO}}

Normativa:

{{NORMATIVA}}

Genera las cláusulas.`

        });

    }

}
