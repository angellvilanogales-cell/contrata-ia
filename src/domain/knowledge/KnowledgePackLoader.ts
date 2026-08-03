/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgePackLoader
 * ------------------------------------------------------------
 *
 * Gestor de carga de Knowledge Packs.
 *
 * RESPONSABILIDADES
 *
 * • Registrar Knowledge Packs.
 * • Cargarlos.
 * • Indexarlos.
 * • Localizarlos.
 * • Servirlos al resto del sistema.
 *
 * IMPORTANTE
 *
 * Este componente NO interpreta la normativa.
 *
 * Únicamente organiza el conocimiento.
 *
 * ============================================================
 */

/**
 * ============================================================
 * MODELOS
 * ============================================================
 */

export interface KnowledgePack {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Versión.
     */
    version: string;

    /**
     * Conceptos cubiertos.
     */
    concepts: string[];

    /**
     * Artículos relacionados.
     */
    articles: string[];

    /**
     * Códigos CPV relacionados.
     */
    cpvCodes: string[];

    /**
     * Reglas incluidas.
     */
    rules: string[];

    /**
     * Contenido.
     */
    data: unknown;

}

/**
 * Estadísticas.
 */
export interface KnowledgePackStatistics {

    totalPacks: number;

    totalConcepts: number;

    totalArticles: number;

    totalRules: number;

}

/**
 * ============================================================
 * LOADER
 * ============================================================
 */

export class KnowledgePackLoader {

    /**
     * Packs registrados.
     */
    private readonly packs =

        new Map<string, KnowledgePack>();

    /**
     * Índice por concepto.
     */
    private readonly conceptIndex =

        new Map<string, string[]>();

    /**
     * Índice por artículo.
     */
    private readonly articleIndex =

        new Map<string, string[]>();

    /**
     * Índice por CPV.
     */
    private readonly cpvIndex =

        new Map<string, string[]>();

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public register(

        pack: KnowledgePack

    ): void {

        this.packs.set(

            pack.id,

            pack

        );

        this.indexConcepts(

            pack

        );

        this.indexArticles(

            pack

        );

        this.indexCPV(

            pack

        );

    }

    /**
     * =====================================================
     * EXISTE
     * =====================================================
     */

    public exists(

        id: string

    ): boolean {

        return this.packs.has(id);

    }

    /**
     * =====================================================
     * OBTENER
     * =====================================================
     */

    public get(

        id: string

    ): KnowledgePack | undefined {

        return this.packs.get(id);

    }

    /**
     * =====================================================
     * TODOS
     * =====================================================
     */

    public all():

        KnowledgePack[] {

        return Array.from(

            this.packs.values()

        );

    }

      /**
     * =====================================================
     * INDEXACIÓN DE CONCEPTOS
     * =====================================================
     */

    private indexConcepts(

        pack: KnowledgePack

    ): void {

        for (const concept of pack.concepts) {

            const list =

                this.conceptIndex.get(

                    concept

                ) ?? [];

            if (!list.includes(pack.id)) {

                list.push(pack.id);

            }

            this.conceptIndex.set(

                concept,

                list

            );

        }

    }

    /**
     * =====================================================
     * INDEXACIÓN DE ARTÍCULOS
     * =====================================================
     */

    private indexArticles(

        pack: KnowledgePack

    ): void {

        for (const article of pack.articles) {

            const list =

                this.articleIndex.get(

                    article

                ) ?? [];

            if (!list.includes(pack.id)) {

                list.push(pack.id);

            }

            this.articleIndex.set(

                article,

                list

            );

        }

    }

    /**
     * =====================================================
     * INDEXACIÓN DE CPV
     * =====================================================
     */

    private indexCPV(

        pack: KnowledgePack

    ): void {

        for (const cpv of pack.cpvCodes) {

            const list =

                this.cpvIndex.get(

                    cpv

                ) ?? [];

            if (!list.includes(pack.id)) {

                list.push(pack.id);

            }

            this.cpvIndex.set(

                cpv,

                list

            );

        }

    }

    /**
     * =====================================================
     * BÚSQUEDA POR CONCEPTO
     * =====================================================
     */

    public byConcept(

        concept: string

    ): KnowledgePack[] {

        const ids =

            this.conceptIndex.get(

                concept

            ) ?? [];

        return ids

            .map(id => this.packs.get(id))

            .filter(

                (pack): pack is KnowledgePack =>

                    pack !== undefined

            );

    }

    /**
     * =====================================================
     * BÚSQUEDA POR ARTÍCULO
     * =====================================================
     */

    public byArticle(

        article: string

    ): KnowledgePack[] {

        const ids =

            this.articleIndex.get(

                article

            ) ?? [];

        return ids

            .map(id => this.packs.get(id))

            .filter(

                (pack): pack is KnowledgePack =>

                    pack !== undefined

            );

    }

    /**
     * =====================================================
     * BÚSQUEDA POR CPV
     * =====================================================
     */

    public byCPV(

        cpv: string

    ): KnowledgePack[] {

        const ids =

            this.cpvIndex.get(

                cpv

            ) ?? [];

        return ids

            .map(id => this.packs.get(id))

            .filter(

                (pack): pack is KnowledgePack =>

                    pack !== undefined

            );

    }

    /**
     * =====================================================
     * CARGA MÚLTIPLE
     * =====================================================
     */

    public registerMany(

        packs: KnowledgePack[]

    ): void {

        for (const pack of packs) {

            this.register(

                pack

            );

        }

    }

    /**
     * =====================================================
     * ELIMINACIÓN
     * =====================================================
     */

    public remove(

        id: string

    ): boolean {

        return this.packs.delete(id);

    }

    /**
     * =====================================================
     * LIMPIEZA COMPLETA
     * =====================================================
     */

    public clear(): void {

        this.packs.clear();

        this.conceptIndex.clear();

        this.articleIndex.clear();

        this.cpvIndex.clear();

    }


      /**
     * =====================================================
     * BÚSQUEDA GENERAL
     * =====================================================
     */

    public search(

        text: string

    ): KnowledgePack[] {

        const query = text.toLowerCase();

        return this.all().filter(pack =>

            pack.id.toLowerCase().includes(query) ||

            pack.name.toLowerCase().includes(query) ||

            pack.concepts.some(c =>
                c.toLowerCase().includes(query)
            ) ||

            pack.articles.some(a =>
                a.toLowerCase().includes(query)
            ) ||

            pack.cpvCodes.some(c =>
                c.toLowerCase().includes(query)
            )

        );

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    public validate(

        pack: KnowledgePack

    ): boolean {

        if (!pack.id.trim()) {

            return false;

        }

        if (!pack.name.trim()) {

            return false;

        }

        if (!pack.version.trim()) {

            return false;

        }

        return true;

    }

    /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public statistics():

        KnowledgePackStatistics {

        let concepts = 0;

        let articles = 0;

        let rules = 0;

        for (const pack of this.packs.values()) {

            concepts += pack.concepts.length;

            articles += pack.articles.length;

            rules += pack.rules.length;

        }

        return {

            totalPacks:

                this.packs.size,

            totalConcepts:

                concepts,

            totalArticles:

                articles,

            totalRules:

                rules

        };

    }

    /**
     * =====================================================
     * IMPORTACIÓN FUTURA
     * =====================================================
     *
     * Estos métodos quedan preparados para
     * futuras versiones donde los Knowledge Packs
     * se cargarán automáticamente desde JSON,
     * base de datos o repositorio documental.
     * =====================================================
     */

    public async loadFromJSON(

        _path: string

    ): Promise<void> {

        throw new Error(

            "Pendiente de implementación."

        );

    }

    public async loadDirectory(

        _directory: string

    ): Promise<void> {

        throw new Error(

            "Pendiente de implementación."

        );

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export():

        KnowledgePack[] {

        return this.all();

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            packs:

                this.packs.size,

            indexedConcepts:

                this.conceptIndex.size,

            indexedArticles:

                this.articleIndex.size,

            indexedCPV:

                this.cpvIndex.size

        };

    }

}

