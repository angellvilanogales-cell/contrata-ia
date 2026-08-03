/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgeQueryEngine
 * ------------------------------------------------------------
 *
 * Motor de consulta sobre los Knowledge Packs.
 *
 * RESPONSABILIDADES
 *
 * • Consultar conocimiento.
 * • Localizar artículos.
 * • Buscar conceptos.
 * • Buscar CPV.
 * • Buscar reglas.
 * • Servir resultados a los Resolvers.
 *
 * IMPORTANTE
 *
 * Este componente NO decide.
 *
 * Solo recupera conocimiento.
 *
 * ============================================================
 */

import {

    KnowledgePack,

    KnowledgePackLoader

} from "./KnowledgePackLoader";

/**
 * Resultado de búsqueda.
 */
export interface QueryResult {

    /**
     * Knowledge Pack encontrado.
     */
    pack: KnowledgePack;

    /**
     * Valor de coincidencia.
     */
    score: number;

    /**
     * Motivo.
     */
    reason: string;

}

/**
 * Motor principal.
 */
export class KnowledgeQueryEngine {

    constructor(

        private readonly loader:

            KnowledgePackLoader

    ) {}

    /**
     * =====================================================
     * OBTENER PACK
     * =====================================================
     */

    public byId(

        id: string

    ): KnowledgePack | undefined {

        return this.loader.get(id);

    }

    /**
     * =====================================================
     * POR CONCEPTO
     * =====================================================
     */

    public byConcept(

        concept: string

    ): QueryResult[] {

        return this.loader

            .byConcept(concept)

            .map(pack => ({

                pack,

                score: 100,

                reason: "Exact concept match"

            }));

    }

    /**
     * =====================================================
     * POR ARTÍCULO
     * =====================================================
     */

    public byArticle(

        article: string

    ): QueryResult[] {

        return this.loader

            .byArticle(article)

            .map(pack => ({

                pack,

                score: 100,

                reason: "Article match"

            }));

    }

    /**
     * =====================================================
     * POR CPV
     * =====================================================
     */

    public byCPV(

        cpv: string

    ): QueryResult[] {

        return this.loader

            .byCPV(cpv)

            .map(pack => ({

                pack,

                score: 100,

                reason: "CPV match"

            }));

    }

    /**
     * =====================================================
     * POR PALABRAS CLAVE
     * =====================================================
     */

    public byKeywords(

        text: string

    ): QueryResult[] {

        const query =

            text.toLowerCase();

        const results: QueryResult[] = [];

        for (

            const pack of

            this.loader.all()

        ) {

            let score = 0;

            if (

                pack.name

                    .toLowerCase()

                    .includes(query)

            ) {

                score += 40;

            }

            for (

                const concept of

                pack.concepts

            ) {

                if (

                    concept

                        .toLowerCase()

                        .includes(query)

                ) {

                    score += 30;

                }

            }

            if (score > 0) {

                results.push({

                    pack,

                    score,

                    reason:

                        "Keyword match"

                });

            }

        }

        return this.order(

            results

        );

    }

    /**
     * =====================================================
     * POR REGLA
     * =====================================================
     */

    public byRule(

        ruleId: string

    ): QueryResult[] {

        return this.loader

            .all()

            .filter(pack =>

                pack.rules.includes(

                    ruleId

                )

            )

            .map(pack => ({

                pack,

                score: 100,

                reason: "Rule match"

            }));

    }

    /**
     * =====================================================
     * POR PROCEDIMIENTO
     * =====================================================
     */

    public byProcedure(

        procedure: string

    ): QueryResult[] {

        const results: QueryResult[] = [];

        for (const pack of this.loader.all()) {

            const found =

                pack.concepts.some(

                    concept =>

                        concept
                            .toLowerCase()
                            .includes(

                                procedure.toLowerCase()

                            )

                );

            if (found) {

                results.push({

                    pack,

                    score: 90,

                    reason:

                        "Procedure match"

                });

            }

        }

        return this.order(results);

    }

    /**
     * =====================================================
     * POR TIPO DE CONTRATO
     * =====================================================
     */

    public byContractType(

        contractType: string

    ): QueryResult[] {

        const results: QueryResult[] = [];

        for (const pack of this.loader.all()) {

            const found =

                pack.concepts.some(

                    concept =>

                        concept
                            .toLowerCase()
                            .includes(

                                contractType.toLowerCase()

                            )

                );

            if (found) {

                results.push({

                    pack,

                    score: 85,

                    reason:

                        "Contract type match"

                });

            }

        }

        return this.order(results);

    }

    /**
     * =====================================================
     * VARIOS CONCEPTOS
     * =====================================================
     */

    public byConcepts(

        concepts: string[]

    ): QueryResult[] {

        const ranking =

            new Map<

                string,

                QueryResult

            >();

        for (const concept of concepts) {

            const partial =

                this.byConcept(

                    concept

                );

            for (const result of partial) {

                const existing =

                    ranking.get(

                        result.pack.id

                    );

                if (!existing) {

                    ranking.set(

                        result.pack.id,

                        {

                            ...result

                        }

                    );

                    continue;

                }

                existing.score +=

                    result.score;

            }

        }

        return this.order(

            Array.from(

                ranking.values()

            )

        );

    }

    /**
     * =====================================================
     * BÚSQUEDA COMBINADA
     * =====================================================
     */

    public combined(

        options: {

            concept?: string;

            article?: string;

            cpv?: string;

            keywords?: string;

        }

    ): QueryResult[] {

        let results: QueryResult[] = [];

        if (options.concept) {

            results.push(

                ...this.byConcept(

                    options.concept

                )

            );

        }

        if (options.article) {

            results.push(

                ...this.byArticle(

                    options.article

                )

            );

        }

        if (options.cpv) {

            results.push(

                ...this.byCPV(

                    options.cpv

                )

            );

        }

        if (options.keywords) {

            results.push(

                ...this.byKeywords(

                    options.keywords

                )

            );

        }

        return this.deduplicate(

            this.order(

                results

            )

        );

    }


      /**
     * =====================================================
     * ORDENACIÓN
     * =====================================================
     */

    private order(

        results: QueryResult[]

    ): QueryResult[] {

        return [...results].sort(

            (a, b) => {

                if (a.score === b.score) {

                    return a.pack.id.localeCompare(

                        b.pack.id

                    );

                }

                return b.score - a.score;

            }

        );

    }

    /**
     * =====================================================
     * ELIMINAR DUPLICADOS
     * =====================================================
     */

    private deduplicate(

        results: QueryResult[]

    ): QueryResult[] {

        const unique =

            new Map<

                string,

                QueryResult

            >();

        for (const result of results) {

            const existing =

                unique.get(

                    result.pack.id

                );

            if (!existing) {

                unique.set(

                    result.pack.id,

                    result

                );

                continue;

            }

            if (

                result.score >

                existing.score

            ) {

                unique.set(

                    result.pack.id,

                    result

                );

            }

        }

        return Array.from(

            unique.values()

        );

    }

    /**
     * =====================================================
     * PUNTUACIÓN
     * =====================================================
     */

    private score(

        pack: KnowledgePack,

        tokens: string[]

    ): number {

        let score = 0;

        for (const token of tokens) {

            const lower =

                token.toLowerCase();

            if (

                pack.name

                    .toLowerCase()

                    .includes(lower)

            ) {

                score += 20;

            }

            for (

                const concept of

                pack.concepts

            ) {

                if (

                    concept

                        .toLowerCase()

                        .includes(lower)

                ) {

                    score += 10;

                }

            }

            for (

                const article of

                pack.articles

            ) {

                if (

                    article

                        .toLowerCase()

                        .includes(lower)

                ) {

                    score += 6;

                }

            }

            for (

                const cpv of

                pack.cpvCodes

            ) {

                if (

                    cpv

                        .toLowerCase()

                        .includes(lower)

                ) {

                    score += 8;

                }

            }

            for (

                const rule of

                pack.rules

            ) {

                if (

                    rule

                        .toLowerCase()

                        .includes(lower)

                ) {

                    score += 5;

                }

            }

        }

        return score;

    }

    /**
     * =====================================================
     * TOKENIZACIÓN
     * =====================================================
     */

    private tokenize(

        text: string

    ): string[] {

        return text

            .toLowerCase()

            .replace(/[.,;:()]/g, " ")

            .split(/\s+/)

            .filter(

                token =>

                    token.length > 2

            );

    }

    /**
     * =====================================================
     * BÚSQUEDA PONDERADA
     * =====================================================
     */

    public rankedSearch(

        text: string

    ): QueryResult[] {

        const tokens =

            this.tokenize(

                text

            );

        const results: QueryResult[] = [];

        for (

            const pack of

            this.loader.all()

        ) {

            const value =

                this.score(

                    pack,

                    tokens

                );

            if (value === 0) {

                continue;

            }

            results.push({

                pack,

                score: value,

                reason:

                    "Weighted search"

            });

        }

        return this.order(

            results

        );

    }

      /**
     * =====================================================
     * BÚSQUEDA SEMÁNTICA
     * =====================================================
     *
     * Esta primera versión utiliza similitud basada en
     * conceptos y palabras clave.
     *
     * Posteriormente podrá sustituirse por embeddings
     * sin modificar los Resolvers.
     */

    public semanticSearch(

        text: string

    ): QueryResult[] {

        const tokens = this.tokenize(text);

        const results: QueryResult[] = [];

        for (const pack of this.loader.all()) {

            let score = 0;

            score += this.semanticConceptScore(

                pack,

                tokens

            );

            score += this.semanticArticleScore(

                pack,

                tokens

            );

            score += this.semanticCPVScore(

                pack,

                tokens

            );

            if (score === 0) {

                continue;

            }

            results.push({

                pack,

                score,

                reason:

                    "Semantic search"

            });

        }

        return this.order(results);

    }

    /**
     * =====================================================
     * CONCEPTOS
     * =====================================================
     */

    private semanticConceptScore(

        pack: KnowledgePack,

        tokens: string[]

    ): number {

        let score = 0;

        for (const token of tokens) {

            for (const concept of pack.concepts) {

                if (

                    concept
                        .toLowerCase()
                        .includes(token)

                ) {

                    score += 25;

                }

            }

        }

        return score;

    }

    /**
     * =====================================================
     * ARTÍCULOS
     * =====================================================
     */

    private semanticArticleScore(

        pack: KnowledgePack,

        tokens: string[]

    ): number {

        let score = 0;

        for (const token of tokens) {

            for (const article of pack.articles) {

                if (

                    article
                        .toLowerCase()
                        .includes(token)

                ) {

                    score += 10;

                }

            }

        }

        return score;

    }

    /**
     * =====================================================
     * CPV
     * =====================================================
     */

    private semanticCPVScore(

        pack: KnowledgePack,

        tokens: string[]

    ): number {

        let score = 0;

        for (const token of tokens) {

            for (const cpv of pack.cpvCodes) {

                if (

                    cpv
                        .toLowerCase()
                        .includes(token)

                ) {

                    score += 12;

                }

            }

        }

        return score;

    }

    /**
     * =====================================================
     * BÚSQUEDA HÍBRIDA
     * =====================================================
     *
     * Combina:
     *
     *  • búsqueda exacta
     *  • búsqueda ponderada
     *  • búsqueda semántica
     *
     */

    public hybridSearch(

        text: string

    ): QueryResult[] {

        const results: QueryResult[] = [

            ...this.byKeywords(text),

            ...this.rankedSearch(text),

            ...this.semanticSearch(text)

        ];

        return this.deduplicate(

            this.order(results)

        );

    }

    /**
     * =====================================================
     * BÚSQUEDA DE MAYOR RELEVANCIA
     * =====================================================
     */

    public best(

        text: string

    ): QueryResult | undefined {

        return this.hybridSearch(text)[0];

    }

    /**
     * =====================================================
     * EXISTE CONOCIMIENTO
     * =====================================================
     */

    public hasKnowledge(

        text: string

    ): boolean {

        return this.best(text) !== undefined;

    }

      /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public statistics() {

        return {

            packs: this.loader.statistics().totalPacks,

            concepts: this.loader.statistics().totalConcepts,

            articles: this.loader.statistics().totalArticles,

            rules: this.loader.statistics().totalRules

        };

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            loader: this.loader.diagnostics(),

            statistics: this.statistics()

        };

    }

    /**
     * =====================================================
     * PREPARADO PARA CACHE
     * =====================================================
     */

    private readonly cache =

        new Map<string, QueryResult[]>();

    /**
     * Recupera una búsqueda cacheada.
     */
    public cachedSearch(

        text: string

    ): QueryResult[] {

        const key =

            text.trim().toLowerCase();

        const cached =

            this.cache.get(key);

        if (cached) {

            return cached;

        }

        const results =

            this.hybridSearch(text);

        this.cache.set(

            key,

            results

        );

        return results;

    }

    /**
     * Limpia la caché.
     */
    public clearCache(): void {

        this.cache.clear();

    }

    /**
     * =====================================================
     * PUNTOS DE EXTENSIÓN FUTUROS
     * =====================================================
     *
     * En futuras versiones estos métodos podrán
     * sustituir la búsqueda basada en texto por:
     *
     *  • Embeddings
     *  • Vector DB
     *  • Similaridad semántica
     *  • IA generativa
     *
     * Los Resolvers NO tendrán que modificarse.
     */

    public async semanticEmbeddingSearch(

        _query: string

    ): Promise<QueryResult[]> {

        throw new Error(

            "Pendiente de implementación."

        );

    }

    public async vectorSearch(

        _query: string

    ): Promise<QueryResult[]> {

        throw new Error(

            "Pendiente de implementación."

        );

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public exportKnowledge(): KnowledgePack[] {

        return this.loader.export();

    }

}
