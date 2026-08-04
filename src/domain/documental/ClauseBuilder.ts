/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ClauseBuilder
 * ------------------------------------------------------------
 * Constructor reutilizable de cláusulas administrativas.
 *
 * Todas las cláusulas del PCAP y PPT serán generadas
 * utilizando este builder.
 *
 * ============================================================
 */

export interface Clause{

    id:string;

    title:string;

    body:string;

    mandatory:boolean;

    editable:boolean;

}

export class ClauseBuilder{

    private readonly clauses:Clause[]=[];

    /**
     * =====================================================
     * Añadir cláusula.
     * =====================================================
     */

    public clause(

        id:string,

        title:string,

        body:string,

        mandatory:boolean=true,

        editable:boolean=true

    ):ClauseBuilder{

        this.clauses.push({

            id,

            title,

            body,

            mandatory,

            editable

        });

        return this;

    }

    /**
     * =====================================================
     * Cláusula jurídica.
     * =====================================================
     */

    public legal(

        id:string,

        title:string,

        article:string,

        rule:string,

        explanation:string

    ):ClauseBuilder{

        return this.clause(

            id,

            title,

            `${explanation}

Fundamento jurídico: ${article} de ${rule}.`

        );

    }

    /**
     * =====================================================
     * Cláusula automática.
     * =====================================================
     */

    public automatic(

        id:string,

        title:string,

        text:string

    ):ClauseBuilder{

        return this.clause(

            id,

            title,

            text,

            true,

            false

        );

    }

    /**
     * =====================================================
     * Cláusula opcional.
     * =====================================================
     */

    public optional(

        id:string,

        title:string,

        text:string

    ):ClauseBuilder{

        return this.clause(

            id,

            title,

            text,

            false,

            true

        );

    }

    /**
     * =====================================================
     * Obtener cláusula.
     * =====================================================
     */

    public get(

        id:string

    ):Clause|undefined{

        return this.clauses.find(

            c=>c.id===id

        );

    }

    /**
     * =====================================================
     * Sustituir el contenido de una cláusula.
     * =====================================================
     */

    public replace(

        id: string,

        body: string

    ): ClauseBuilder {

        const clause = this.get(id);

        if (clause) {

            clause.body = body;

        }

        return this;

    }

    /**
     * =====================================================
     * Eliminar cláusula.
     * =====================================================
     */

    public remove(

        id: string

    ): ClauseBuilder {

        const index = this.clauses.findIndex(

            c => c.id === id

        );

        if (index >= 0) {

            this.clauses.splice(index, 1);

        }

        return this;

    }

    /**
     * =====================================================
     * Sustitución sencilla de variables.
     * {{variable}}
     * =====================================================
     */

    public interpolate(

        variables: Record<string, unknown>

    ): ClauseBuilder {

        for (const clause of this.clauses) {

            let body = clause.body;

            for (const key of Object.keys(variables)) {

                const regex = new RegExp(

                    `\\{\\{\\s*${key}\\s*\\}\\}`,

                    "g"

                );

                body = body.replace(

                    regex,

                    String(variables[key] ?? "")

                );

            }

            clause.body = body;
        }

        return this;

    }

    /**
     * =====================================================
     * Obtener únicamente cláusulas obligatorias.
     * =====================================================
     */

    public mandatory(): Clause[] {

        return this.clauses.filter(

            c => c.mandatory

        );

    }

    /**
     * =====================================================
     * Obtener únicamente cláusulas opcionales.
     * =====================================================
     */

    public optionalClauses(): Clause[] {

        return this.clauses.filter(

            c => !c.mandatory

        );

    }

    /**
     * =====================================================
     * Exportación.
     * =====================================================
     */

    public build(): Clause[] {

        return [...this.clauses];

    }

    /**
     * =====================================================
     * Clonación.
     * =====================================================
     */

    public clone(): ClauseBuilder {

        const builder = new ClauseBuilder();

        for (const clause of this.clauses) {

            builder.clause(

                clause.id,

                clause.title,

                clause.body,

                clause.mandatory,

                clause.editable

            );

        }

        return builder;

    }

    /**
     * =====================================================
     * Reiniciar.
     * =====================================================
     */

    public clear(): ClauseBuilder {

        this.clauses.length = 0;

        return this;

    }

}
