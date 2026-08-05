/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * LIFETIME MANAGER
 *
 * Gestiona el ciclo de vida de los servicios registrados.
 *
 ******************************************************************************/

export enum ServiceLifetime {

    SINGLETON = "SINGLETON",

    TRANSIENT = "TRANSIENT",

    SCOPED = "SCOPED"

}

export interface LifetimeInformation {

    name: string;

    lifetime: ServiceLifetime;

    created: number;

    resolved: number;

    disposed: boolean;

}

export class LifetimeManager {

    private readonly services =

        new Map<string, LifetimeInformation>();

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public register(

        name: string,

        lifetime: ServiceLifetime

    ): void {

        this.services.set(

            name,

            {

                name,

                lifetime,

                created:

                    Date.now(),

                resolved: 0,

                disposed: false

            }

        );

    }

    /**************************************************************************
     *
     * Resolución
     *
     **************************************************************************/

    public resolved(

        name: string

    ): void {

        const service =

            this.services.get(

                name

            );

        if (

            service

        ) {

            service.resolved++;

        }

    }

    /**************************************************************************
     *
     * Eliminación
     *
     **************************************************************************/

    public dispose(

        name: string

    ): void {

        const service =

            this.services.get(

                name

            );

        if (

            service

        ) {

            service.disposed = true;

        }

    }

    /**************************************************************************
     *
     * Consultas
     *
     **************************************************************************/

    public get(

        name: string

    ): LifetimeInformation | undefined {

        return this.services.get(

            name

        );

    }

    public exists(

        name: string

    ): boolean {

        return this.services.has(

            name

        );

    }

    public list()

        : LifetimeInformation[] {

        return [

            ...this.services.values()

        ];

    }

    public active()

        : LifetimeInformation[] {

        return this.list()

            .filter(

                service =>

                    !service.disposed

            );

    }

    /**************************************************************************
     *
     * Estadísticas
     *
     **************************************************************************/

    public diagnostics() {

        return {

            total:

                this.services.size,

            active:

                this.active().length,

            disposed:

                this.list().filter(

                    s => s.disposed

                ).length,

            singleton:

                this.list().filter(

                    s =>

                        s.lifetime ===

                        ServiceLifetime.SINGLETON

                ).length,

            transient:

                this.list().filter(

                    s =>

                        s.lifetime ===

                        ServiceLifetime.TRANSIENT

                ).length,

            scoped:

                this.list().filter(

                    s =>

                        s.lifetime ===

                        ServiceLifetime.SCOPED

                ).length

        };

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public clear()

        : void {

        this.services.clear();

    }

}
