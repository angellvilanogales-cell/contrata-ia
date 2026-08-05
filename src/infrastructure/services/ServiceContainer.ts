/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * SERVICE CONTAINER
 *
 * Contenedor de dependencias (IoC).
 *
 ******************************************************************************/

export type ServiceFactory<T> = () => T;

export interface ServiceRegistration<T = unknown> {

    name: string;

    singleton: boolean;

    factory: ServiceFactory<T>;

    instance?: T;

}

export class ServiceContainer {

    private readonly services =

        new Map<

            string,

            ServiceRegistration

        >();

    /**************************************************************************
     *
     * Registro Singleton
     *
     **************************************************************************/

    public registerSingleton<T>(

        name: string,

        factory: ServiceFactory<T>

    ): void {

        this.services.set(

            name,

            {

                name,

                singleton: true,

                factory

            }

        );

    }

    /**************************************************************************
     *
     * Registro Transient
     *
     **************************************************************************/

    public registerTransient<T>(

        name: string,

        factory: ServiceFactory<T>

    ): void {

        this.services.set(

            name,

            {

                name,

                singleton: false,

                factory

            }

        );

    }

    /**************************************************************************
     *
     * Resolución
     *
     **************************************************************************/

    public resolve<T>(

        name: string

    ): T {

        const registration =

            this.services.get(

                name

            );

        if (

            !registration

        ) {

            throw new Error(

                `Service '${name}' is not registered.`

            );

        }

        if (

            registration.singleton

        ) {

            if (

                registration.instance === undefined

            ) {

                registration.instance =

                    registration.factory();

            }

            return registration.instance as T;

        }

        return registration.factory() as T;

    }

    /**************************************************************************
     *
     * Estado
     *
     **************************************************************************/

    public isRegistered(

        name: string

    ): boolean {

        return this.services.has(

            name

        );

    }

    public unregister(

        name: string

    ): void {

        this.services.delete(

            name

        );

    }

    public clear(): void {

        this.services.clear();

    }

    public registeredServices()

        : string[] {

        return [

            ...this.services.keys()

        ];

    }

    public diagnostics() {

        return {

            total:

                this.services.size,

            services:

                Array.from(

                    this.services.values()

                ).map(

                    service => (

                        {

                            name:

                                service.name,

                            singleton:

                                service.singleton,

                            instantiated:

                                service.instance !== undefined

                        }

                    )

                )

        };

    }

}
