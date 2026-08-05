/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * KNOWLEDGE REPOSITORY
 *
 * Repositorio de acceso a la Base de Conocimiento.
 *
 ******************************************************************************/

import { JSONRepository } from "./JSONRepository";

export interface KnowledgeRecord {

    id: string;

    pack: string;

    category: string;

    title: string;

    description: string;

    keywords: string[];

    source: string;

    version: string;

    language: string;

    enabled: boolean;

    metadata: Record<string, unknown>;

}

export class KnowledgeRepository

    extends JSONRepository<KnowledgeRecord> {

    constructor(

        storageDirectory = "./storage/knowledge"

    ) {

        super(

            storageDirectory,

            "knowledge.json"

        );

    }

    public async findByPack(

        pack: string

    ): Promise<ReadonlyArray<KnowledgeRecord>> {

        const knowledge =

            await this.readAll();

        return knowledge.filter(

            record =>

                record.pack === pack

        );

    }

    public async findByCategory(

        category: string

    ): Promise<ReadonlyArray<KnowledgeRecord>> {

        const knowledge =

            await this.readAll();

        return knowledge.filter(

            record =>

                record.category === category

        );

    }

    public async findEnabled()

        : Promise<ReadonlyArray<KnowledgeRecord>> {

        const knowledge =

            await this.readAll();

        return knowledge.filter(

            record =>

                record.enabled

        );

    }

    public async findByKeyword(

        keyword: string

    ): Promise<ReadonlyArray<KnowledgeRecord>> {

        const value =

            keyword.toLowerCase();

        const knowledge =

            await this.readAll();

        return knowledge.filter(

            record =>

                record.keywords.some(

                    keyword =>

                        keyword

                            .toLowerCase()

                            .includes(

                                value

                            )

                )

        );

    }

    public async search(

        text: string

    ): Promise<ReadonlyArray<KnowledgeRecord>> {

        const value =

            text.toLowerCase();

        const knowledge =

            await this.readAll();

        return knowledge.filter(

            record =>

                record.title

                    .toLowerCase()

                    .includes(value)

                ||

                record.description

                    .toLowerCase()

                    .includes(value)

                ||

                record.keywords.some(

                    keyword =>

                        keyword

                            .toLowerCase()

                            .includes(value)

                )

        );

    }

    public async disable(

        id: string

    ): Promise<void> {

        const record =

            await this.findById(id);

        if (

            !record

        ) {

            throw new Error(

                "Knowledge record not found."

            );

        }

        record.enabled = false;

        await this.update(

            id,

            record

        );

    }

    public async enable(

        id: string

    ): Promise<void> {

        const record =

            await this.findById(id);

        if (

            !record

        ) {

            throw new Error(

                "Knowledge record not found."

            );

        }

        record.enabled = true;

        await this.update(

            id,

            record

        );

    }

    public async listPacks()

        : Promise<ReadonlyArray<string>> {

        const knowledge =

            await this.readAll();

        return [

            ...new Set(

                knowledge.map(

                    record =>

                        record.pack

                )

            )

        ];

    }

}
