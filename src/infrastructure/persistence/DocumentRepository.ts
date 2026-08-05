/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DOCUMENT REPOSITORY
 *
 * Persistencia de documentos generados por el sistema.
 *
 ******************************************************************************/

import { JSONRepository } from "./JSONRepository";

export interface DocumentRecord {

    id: string;

    expedienteId: string;

    type: string;

    name: string;

    version: string;

    format: string;

    path: string;

    hash: string;

    size: number;

    createdAt: string;

    updatedAt: string;

    generatedBy: string;

    signed: boolean;

    metadata: Record<string, unknown>;

}

export class DocumentRepository

    extends JSONRepository<DocumentRecord> {

    constructor(

        storageDirectory = "./storage/documents"

    ) {

        super(

            storageDirectory,

            "documents.json"

        );

    }

    public async findByExpediente(

        expedienteId: string

    ): Promise<ReadonlyArray<DocumentRecord>> {

        const documents =

            await this.readAll();

        return documents.filter(

            document =>

                document.expedienteId === expedienteId

        );

    }

    public async findByType(

        type: string

    ): Promise<ReadonlyArray<DocumentRecord>> {

        const documents =

            await this.readAll();

        return documents.filter(

            document =>

                document.type === type

        );

    }

    public async findLatestVersion(

        expedienteId: string,

        type: string

    ): Promise<DocumentRecord | undefined> {

        const documents =

            await this.findByExpediente(

                expedienteId

            );

        return documents

            .filter(

                document =>

                    document.type === type

            )

            .sort(

                (left, right) =>

                    right.version.localeCompare(

                        left.version

                    )

            )[0];

    }

    public async findSigned()

        : Promise<ReadonlyArray<DocumentRecord>> {

        const documents =

            await this.readAll();

        return documents.filter(

            document =>

                document.signed

        );

    }

    public async findUnsigned()

        : Promise<ReadonlyArray<DocumentRecord>> {

        const documents =

            await this.readAll();

        return documents.filter(

            document =>

                !document.signed

        );

    }

    public async markAsSigned(

        id: string

    ): Promise<void> {

        const document =

            await this.findById(id);

        if (

            !document

        ) {

            throw new Error(

                "Document not found."

            );

        }

        document.signed = true;

        document.updatedAt =

            new Date().toISOString();

        await this.update(

            id,

            document

        );

    }

    public async search(

        text: string

    ): Promise<ReadonlyArray<DocumentRecord>> {

        const value =

            text.toLowerCase();

        const documents =

            await this.readAll();

        return documents.filter(

            document =>

                document.name

                    .toLowerCase()

                    .includes(value)

                ||

                document.type

                    .toLowerCase()

                    .includes(value)

        );

    }

    public async listFormats()

        : Promise<ReadonlyArray<string>> {

        const documents =

            await this.readAll();

        return [

            ...new Set(

                documents.map(

                    document =>

                        document.format

                )

            )

        ];

    }

}
