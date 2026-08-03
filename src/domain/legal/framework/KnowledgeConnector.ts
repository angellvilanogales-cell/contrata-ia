/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgeConnector
 * ------------------------------------------------------------
 * Adaptador entre el Framework Jurídico y el
 * Motor de Conocimiento.
 *
 * Ningún Resolver accederá directamente al
 * Knowledge Engine.
 *
 * ============================================================
 */

import {

    KnowledgeQueryEngine,
    QueryResult

} from "../../knowledge/KnowledgeQueryEngine";

import {

    KnowledgeGraph,
    KnowledgeRelation

} from "../../knowledge/KnowledgeGraph";

import {

    KnowledgePack

} from "../../knowledge/KnowledgePackLoader";

export class KnowledgeConnector {

    constructor(

        private readonly query: KnowledgeQueryEngine,

        private readonly graph: KnowledgeGraph

    ) {}

    /*==========================================================
     *
     * CONSULTAS
     *
     *==========================================================*/

    public concept(

        concept: string

    ): QueryResult[] {

        return this.query.byConcept(

            concept

        );

    }

    public article(

        article: string

    ): QueryResult[] {

        return this.query.byArticle(

            article

        );

    }

    public cpv(

        cpv: string

    ): QueryResult[] {

        return this.query.byCPV(

            cpv

        );

    }

    public keywords(

        text: string

    ): QueryResult[] {

        return this.query.byKeywords(

            text

        );

    }

    public semantic(

        text: string

    ): QueryResult[] {

        return this.query.semanticSearch(

            text

        );

    }

    public hybrid(

        text: string

    ): QueryResult[] {

        return this.query.hybridSearch(

            text

        );

    }

    public best(

        text: string

    ): QueryResult | undefined {

        return this.query.best(

            text

        );

    }

    /*==========================================================
     *
     * GRAFO
     *
     *==========================================================*/

    public outgoing(

        concept: string

    ): KnowledgeRelation[] {

        return this.graph.outgoing(

            concept

        );

    }

    public incoming(

        concept: string

    ): KnowledgeRelation[] {

        return this.graph.incoming(

            concept

        );

    }

    public hasRelation(

        from: string,

        relation: string,

        to: string

    ): boolean {

        return this.graph.hasRelation(

            from,

            relation,

            to

        );

    }

    public graphSize()

    : number {

        return this.graph.count();

    }

    /*==========================================================
     *
     * KNOWLEDGE PACKS
     *
     *==========================================================*/

    public pack(

        id: string

    ): KnowledgePack | undefined {

        return this.query.byId(

            id

        );

    }

    public export()

    : KnowledgePack[] {

        return this.query.exportKnowledge();

    }

    /*==========================================================
     *
     * DIAGNÓSTICO
     *
     *==========================================================*/

    public diagnostics() {

        return {

            knowledge:

                this.query.statistics(),

            graph: {

                relations:

                    this.graph.count()

            }

        };

    }

}
