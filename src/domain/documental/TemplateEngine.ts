/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * TemplateEngine
 * ------------------------------------------------------------
 * Motor de plantillas documentales.
 *
 * Funciones:
 *
 * • Sustitución de variables.
 * • Plantillas reutilizables.
 * • Marcadores.
 * • Condiciones.
 * • Repeticiones.
 *
 * ============================================================
 */

export interface TemplateVariable{

    name:string;

    value:unknown;

}

export interface TemplateBlock{

    id:string;

    content:string;

}

export class TemplateEngine{

    /**
     * Variables.
     */

    private readonly variables=

        new Map<string,string>();

    /**
     * Bloques.
     */

    private readonly blocks=

        new Map<string,string>();

    /**
     * =====================================================
     * Registrar variable.
     * =====================================================
     */

    public variable(

        name:string,

        value:unknown

    ):TemplateEngine{

        this.variables.set(

            name,

            value===undefined

                ? ""

                : String(value)

        );

        return this;

    }

    /**
     * =====================================================
     * Registrar múltiples variables.
     * =====================================================
     */

    public variablesFrom(

        values:Record<string,unknown>

    ):TemplateEngine{

        for(

            const key of Object.keys(values)

        ){

            this.variable(

                key,

                values[key]

            );

        }

        return this;

    }

    /**
     * =====================================================
     * Registrar bloque.
     * =====================================================
     */

    public block(

        id:string,

        content:string

    ):TemplateEngine{

        this.blocks.set(

            id,

            content

        );

        return this;

    }

    /**
     * =====================================================
     * Obtener bloque.
     * =====================================================
     */

    public getBlock(

        id:string

    ):string{

        return this.blocks.get(id) ?? "";

    }

    /**
     * =====================================================
     * Render de una plantilla.
     * =====================================================
     */

    public render(

        template:string

    ):string{

        let result=template;

        /**
         * Sustitución de variables
         * {{variable}}
         */

        for(

            const [key,value]

            of this.variables

        ){

            const regex=

                new RegExp(

                    `\\{\\{\\s*${key}\\s*\\}\\}`,

                    "g"

                );

            result=result.replace(

                regex,

                value

            );

        }

        /**
         * Sustitución de bloques
         *
         * {{>BLOCK}}
         */

        for(

            const [id,content]

            of this.blocks

        ){

            const regex=

                new RegExp(

                    `\\{\\{>\\s*${id}\\s*\\}\\}`,

                    "g"

                );

            result=result.replace(

                regex,

                content

            );

        }

        /**
         * Limpiar variables no resueltas
         */

        result=result.replace(

            /\{\{[^}]+\}\}/g,

            ""

        );

        return result;

    }

    /**
     * =====================================================
     * Render de listas.
     *
     * {{#items}}
     * ...
     * {{/items}}
     * =====================================================
     */

    public renderList(

        template:string,

        values:Record<string,unknown>[]

    ):string{

        return values.map(item=>{

            let row=template;

            for(

                const key of Object.keys(item)

            ){

                row=row.replace(

                    new RegExp(

                        `\\{\\{${key}\\}\\}`,

                        "g"

                    ),

                    String(item[key])

                );

            }

            return row;

        }).join("");

    }

    /**
     * =====================================================
     * Condicional sencillo.
     * =====================================================
     */

    public renderIf(

        condition:boolean,

        content:string

    ):string{

        return condition

            ? content

            : "";

    }

    /**
     * =====================================================
     * Reiniciar motor.
     * =====================================================
     */

    public clear():TemplateEngine{

        this.variables.clear();

        this.blocks.clear();

        return this;

    }

}
