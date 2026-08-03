/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgeGraph
 * ------------------------------------------------------------
 * Grafo semántico del conocimiento.
 *
 * RESPONSABILIDAD
 *
 * Mantener las relaciones entre conceptos jurídicos.
 *
 * NO interpreta normativa.
 * NO ejecuta reglas.
 * NO toma decisiones.
 *
 * ============================================================
 */

export interface KnowledgeRelation {

    /**
     * Concepto origen.
     */
    from: string;

    /**
     * Tipo de relación.
     */
    relation: string;

    /**
     * Concepto destino.
     */
    to: string;

}

export class KnowledgeGraph {

    /**
     * Relaciones registradas.
     */
    private readonly relations: KnowledgeRelation[] = [];

    /**
     * Registra una relación.
     */
    public add(

        relation: KnowledgeRelation

    ): void {

        this.relations.push(relation);

    }

    /**
     * Devuelve todas las relaciones.
     */
    public getRelations(): ReadonlyArray<KnowledgeRelation> {

        return this.relations;

    }

    /**
     * Relaciones salientes.
     */
    public outgoing(

        concept: string

    ): KnowledgeRelation[] {

        return this.relations.filter(

            relation => relation.from === concept

        );

    }

    /**
     * Relaciones entrantes.
     */
    public incoming(

        concept: string

    ): KnowledgeRelation[] {

        return this.relations.filter(

            relation => relation.to === concept

        );

    }

    /**
     * Comprueba si existe una relación.
     */
    public hasRelation(

        from: string,

        relation: string,

        to: string

    ): boolean {

        return this.relations.some(

            r =>

                r.from === from &&
                r.relation === relation &&
                r.to === to

        );

    }

    /**
     * Número total de relaciones.
     */
    public count(): number {

        return this.relations.length;

    }

    /**
     * Vacía el grafo.
     */
    public clear(): void {

        this.relations.length = 0;

    }

    /**
     * Carga las relaciones básicas del sistema.
     */
    public loadCoreRelations(): void {

        this.add({

            from: "Necesidad",

            relation: "determina",

            to: "Objeto"

        });

        this.add({

            from: "Objeto",

            relation: "determina",

            to: "CPV"

        });

        this.add({

            from: "CPV",

            relation: "condiciona",

            to: "TipoContrato"

        });

        this.add({

            from: "ValorEstimado",

            relation: "determina",

            to: "Procedimiento"

        });

        this.add({

            from: "Procedimiento",

            relation: "determina",

            to: "Publicidad"

        });

        this.add({

            from: "Procedimiento",

            relation: "determina",

            to: "Plazos"

        });

        this.add({

            from: "Procedimiento",

            relation: "determina",

            to: "Solvencia"

        });

        this.add({

            from: "Solvencia",

            relation: "condiciona",

            to: "Adjudicación"

        });

    }

}
