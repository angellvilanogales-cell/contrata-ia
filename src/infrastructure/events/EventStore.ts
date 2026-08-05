/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * EVENT STORE
 *
 * Persistencia de eventos del sistema.
 *
 ******************************************************************************/

import * as fs from "fs";
import * as path from "path";

import { Event } from "./EventBus";

export interface StoredEvent {

    id: string;

    type: string;

    timestamp: string;

    payload: unknown;

}

export class EventStore {

    private readonly directory: string;

    private readonly file: string;

    constructor(

        directory = "./events",

        filename = "event-store.jsonl"

    ) {

        this.directory = directory;

        this.file = path.join(

            directory,

            filename

        );

        this.ensureDirectory();

    }

    /**************************************************************************
     *
     * Guardar
     *
     **************************************************************************/

    public append(

        event: Event

    ): void {

        const stored: StoredEvent = {

            id:

                event.id,

            type:

                event.type,

            timestamp:

                event.timestamp.toISOString(),

            payload:

                event.payload

        };

        fs.appendFileSync(

            this.file,

            JSON.stringify(

                stored

            ) + "\n",

            {

                encoding: "utf8"

            }

        );

    }

    /**************************************************************************
     *
     * Leer todos
     *
     **************************************************************************/

    public read()

        : StoredEvent[] {

        if (

            !this.exists()

        ) {

            return [];

        }

        return fs

            .readFileSync(

                this.file,

                "utf8"

            )

            .split("\n")

            .filter(

                line =>

                    line.trim().length > 0

            )

            .map(

                line =>

                    JSON.parse(

                        line

                    ) as StoredEvent

            );

    }

    /**************************************************************************
     *
     * Buscar por tipo
     *
     **************************************************************************/

    public findByType(

        type: string

    ): StoredEvent[] {

        return this.read()

            .filter(

                event =>

                    event.type === type

            );

    }

    /**************************************************************************
     *
     * Buscar por id
     *
     **************************************************************************/

    public findById(

        id: string

    ): StoredEvent | undefined {

        return this.read()

            .find(

                event =>

                    event.id === id

            );

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public count()

        : number {

        return this.read().length;

    }

    public exists()

        : boolean {

        return fs.existsSync(

            this.file

        );

    }

    public clear()

        : void {

        fs.writeFileSync(

            this.file,

            "",

            {

                encoding: "utf8"

            }

        );

    }

    /**************************************************************************
     *
     * Directorio
     *
     **************************************************************************/

    private ensureDirectory()

        : void {

        if (

            !fs.existsSync(

                this.directory

            )

        ) {

            fs.mkdirSync(

                this.directory,

                {

                    recursive: true

                }

            );

        }

    }

}
