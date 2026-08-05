/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * FILE REPOSITORY
 *
 ******************************************************************************/

import * as fs from "fs";
import * as path from "path";

export class FileRepository {

    constructor(

        private readonly rootDirectory: string

    ) {

        this.ensureDirectory();

    }

    /**************************************************************************
     *
     * Lectura
     *
     **************************************************************************/

    public read(

        relativePath: string,

        encoding: BufferEncoding = "utf8"

    ): string {

        return fs.readFileSync(

            this.resolve(

                relativePath

            ),

            encoding

        );

    }

    /**************************************************************************
     *
     * Escritura
     *
     **************************************************************************/

    public write(

        relativePath: string,

        content: string

    ): void {

        const file =

            this.resolve(

                relativePath

            );

        this.ensureParentDirectory(

            file

        );

        fs.writeFileSync(

            file,

            content,

            {

                encoding: "utf8"

            }

        );

    }

    /**************************************************************************
     *
     * Añadir
     *
     **************************************************************************/

    public append(

        relativePath: string,

        content: string

    ): void {

        const file =

            this.resolve(

                relativePath

            );

        this.ensureParentDirectory(

            file

        );

        fs.appendFileSync(

            file,

            content,

            {

                encoding: "utf8"

            }

        );

    }

    /**************************************************************************
     *
     * Borrar
     *
     **************************************************************************/

    public delete(

        relativePath: string

    ): void {

        const file =

            this.resolve(

                relativePath

            );

        if (

            fs.existsSync(

                file

            )

        ) {

            fs.unlinkSync(

                file

            );

        }

    }

    /**************************************************************************
     *
     * Copiar
     *
     **************************************************************************/

    public copy(

        source: string,

        destination: string

    ): void {

        fs.copyFileSync(

            this.resolve(source),

            this.resolve(destination)

        );

    }

    /**************************************************************************
     *
     * Mover
     *
     **************************************************************************/

    public move(

        source: string,

        destination: string

    ): void {

        fs.renameSync(

            this.resolve(source),

            this.resolve(destination)

        );

    }

    /**************************************************************************
     *
     * Listado
     *
     **************************************************************************/

    public list()

        : string[] {

        return fs.readdirSync(

            this.rootDirectory

        );

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public exists(

        relativePath: string

    ): boolean {

        return fs.existsSync(

            this.resolve(

                relativePath

            )

        );

    }

    public size(

        relativePath: string

    ): number {

        return fs.statSync(

            this.resolve(

                relativePath

            )

        ).size;

    }

    /**************************************************************************
     *
     * Utilidades
     *
     **************************************************************************/

    private resolve(

        relativePath: string

    ): string {

        return path.join(

            this.rootDirectory,

            relativePath

        );

    }

    private ensureDirectory()

        : void {

        if (

            !fs.existsSync(

                this.rootDirectory

            )

        ) {

            fs.mkdirSync(

                this.rootDirectory,

                {

                    recursive: true

                }

            );

        }

    }

    private ensureParentDirectory(

        file: string

    ): void {

        const directory =

            path.dirname(

                file

            );

        if (

            !fs.existsSync(

                directory

            )

        ) {

            fs.mkdirSync(

                directory,

                {

                    recursive: true

                }

            );

        }

    }

}
