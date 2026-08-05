/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * JSON REPOSITORY
 *
 * Implementación base de persistencia sobre ficheros JSON.
 *
 ******************************************************************************/

import * as fs from "fs/promises";
import * as path from "path";

import {

    Repository

} from "./Repository";

export abstract class JSONRepository<T extends { id: string }>
    implements Repository<T> {

    protected constructor(

        protected readonly storageDirectory: string,

        protected readonly filename: string

    ) {}

    protected get filePath(): string {

        return path.join(

            this.storageDirectory,

            this.filename

        );

    }

    protected async ensureStorage(): Promise<void> {

        await fs.mkdir(

            this.storageDirectory,

            {

                recursive: true

            }

        );

        try {

            await fs.access(

                this.filePath

            );

        }

        catch {

            await fs.writeFile(

                this.filePath,

                "[]",

                "utf8"

            );

        }

    }

    protected async readAll()

        : Promise<T[]> {

        await this.ensureStorage();

        const content =

            await fs.readFile(

                this.filePath,

                "utf8"

            );

        return JSON.parse(

            content

        ) as T[];

    }

    protected async writeAll(

        entities: ReadonlyArray<T>

    ): Promise<void> {

        await this.ensureStorage();

        await fs.writeFile(

            this.filePath,

            JSON.stringify(

                entities,

                null,

                2

            ),

            "utf8"

        );

    }

    async findAll()

        : Promise<ReadonlyArray<T>> {

        return this.readAll();

    }

    async findById(

        id: string

    ): Promise<T | undefined> {

        const entities =

            await this.readAll();

        return entities.find(

            entity =>

                entity.id === id

        );

    }

    async exists(

        id: string

    ): Promise<boolean> {

        return (

            await this.findById(

                id

            )

        ) !== undefined;

    }

    async save(

        entity: T

    ): Promise<void> {

        const entities =

            await this.readAll();

        entities.push(

            entity

        );

        await this.writeAll(

            entities

        );

    }

    async saveAll(

        entities: ReadonlyArray<T>

    ): Promise<void> {

        const current =

            await this.readAll();

        current.push(

            ...entities

        );

        await this.writeAll(

            current

        );

    }

    async update(

        id: string,

        entity: T

    ): Promise<void> {

        const entities =

            await this.readAll();

        const index =

            entities.findIndex(

                item =>

                    item.id === id

            );

        if (

            index < 0

        ) {

            throw new Error(

                `Entity ${id} not found.`

            );

        }

        entities[index] = entity;

        await this.writeAll(

            entities

        );

    }

    async delete(

        id: string

    ): Promise<void> {

        const entities =

            await this.readAll();

        await this.writeAll(

            entities.filter(

                entity =>

                    entity.id !== id

            )

        );

    }

    async clear()

        : Promise<void> {

        await this.writeAll(

            []

        );

    }

    async count()

        : Promise<number> {

        return (

            await this.readAll()

        ).length;

    }

}
