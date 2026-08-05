/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DEPENDENCY RESOLVER
 *
 * Resolución automática de dependencias.
 *
 ******************************************************************************/

import { ServiceContainer } from "./ServiceContainer";

export interface DependencyDefinition {

    service: string;

    dependencies: string[];

}

export class DependencyResolver {

    private readonly definitions =

        new Map<

            string,

            DependencyDefinition

        >();

    constructor(

        private readonly container: ServiceContainer

    ) {

    }

    /**************************************************************************
     *
     * Registro
     *
     **************************************************************************/

    public register(

        service: string,

        dependencies: string[]

    ): void {

        this.definitions.set(

            service,

            {

                service,

                dependencies

            }

        );

    }

    /**************************************************************************
     *
     * Resolución
     *
     **************************************************************************/

    public resolve<T>(

        service: string

    ): T {

        this.resolveDependencies(

            service,

            []

        );

        return this.container.resolve<T>(

            service

        );

    }

    /**************************************************************************
     *
     * Resolver árbol
     *
     **************************************************************************/

    private resolveDependencies(

        service: string,

        stack: string[]

    ): void {

        if (

            stack.includes(

                service

            )

        ) {

            throw new Error(

                `Circular dependency detected: ${

                    [

                        ...stack,

                        service

                    ].join(" -> ")

                }`

            );

        }

        const definition =

            this.definitions.get(

                service

            );

        if (

            !definition

        ) {

            return;

        }

        for (

            const dependency

            of definition.dependencies

        ) {

            this.resolveDependencies(

                dependency,

                [

                    ...stack,

                    service

                ]

            );

            this.container.resolve(

                dependency

            );

        }

    }

    /**************************************************************************
     *
     * Información
     *
     **************************************************************************/

    public dependenciesOf(

        service: string

    ): string[] {

        return (

            this.definitions.get(

                service

            )?.dependencies

            ??

            []

        );

    }

    public registeredServices()

        : string[] {

        return [

            ...this.definitions.keys()

        ];

    }

    public diagnostics() {

        return {

            total:

                this.definitions.size,

            graph:

                Array.from(

                    this.definitions.values()

                )

        };

    }

    /**************************************************************************
     *
     * Limpieza
     *
     **************************************************************************/

    public clear()

        : void {

        this.definitions.clear();

    }

}
