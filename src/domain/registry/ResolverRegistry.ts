/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ResolverRegistry
 * ------------------------------------------------------------
 *
 * Registro centralizado de todos los Resolvers del sistema.
 *
 * OBJETIVOS
 *
 * • Evitar registros manuales.
 * • Centralizar prioridades.
 * • Gestionar dependencias.
 * • Facilitar futuras ampliaciones.
 *
 * IMPORTANTE
 *
 * Este componente NO contiene lógica jurídica.
 *
 * Únicamente administra el catálogo de resolvers.
 * ============================================================
 */

import { BaseResolver } from "../resolvers/BaseResolver";

/**
 * Definición registrada de un Resolver.
 */
export interface ResolverDefinition {

    /**
     * Identificador único.
     */
    id: string;

    /**
     * Nombre descriptivo.
     */
    name: string;

    /**
     * Instancia del Resolver.
     */
    resolver: BaseResolver<any>;

    /**
     * Prioridad de ejecución.
     */
    priority: number;

    /**
     * Dependencias.
     */
    dependsOn: string[];

    /**
     * Activo.
     */
    enabled: boolean;

}

/**
 * ============================================================
 * ResolverRegistry
 * ============================================================
 */

export class ResolverRegistry {

    /**
     * Catálogo.
     */
    private readonly catalog =

        new Map<

            string,

            ResolverDefinition

        >();

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public register(

        definition: ResolverDefinition

    ): void {

        this.catalog.set(

            definition.id,

            definition

        );

    }

    /**
     * =====================================================
     * ELIMINACIÓN
     * =====================================================
     */

    public unregister(

        id: string

    ): void {

        this.catalog.delete(

            id

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

        return this.catalog.has(

            id

        );

    }

    /**
     * =====================================================
     * OBTENER
     * =====================================================
     */

    public get(

        id: string

    ): ResolverDefinition | undefined {

        return this.catalog.get(

            id

        );

    }

    /**
     * =====================================================
     * LISTADO
     * =====================================================
     */

    public all():

        ResolverDefinition[] {

        return Array.from(

            this.catalog.values()

        );

    }

    /**
     * =====================================================
     * ACTIVACIÓN
     * =====================================================
     */

    public enable(

        id: string

    ): void {

        const resolver =

            this.catalog.get(id);

        if (!resolver) {

            return;

        }

        resolver.enabled = true;

    }

    /**
     * =====================================================
     * DESACTIVACIÓN
     * =====================================================
     */

    public disable(

        id: string

    ): void {

        const resolver =

            this.catalog.get(id);

        if (!resolver) {

            return;

        }

        resolver.enabled = false;

    }

    /**
     * =====================================================
     * ACTIVOS
     * =====================================================
     */

    public enabledResolvers():

        ResolverDefinition[] {

        return this.all()

            .filter(

                resolver =>

                    resolver.enabled

            );

    }

    /**
     * =====================================================
     * DESACTIVADOS
     * =====================================================
     */

    public disabledResolvers():

        ResolverDefinition[] {

        return this.all()

            .filter(

                resolver =>

                    !resolver.enabled

            );

    }

    /**
     * =====================================================
     * ORDENADOS POR PRIORIDAD
     * =====================================================
     */

    public ordered():

        ResolverDefinition[] {

        return this.enabledResolvers()

            .sort(

                (a, b) =>

                    a.priority -

                    b.priority

            );

    }

    /**
     * =====================================================
     * VALIDAR DEPENDENCIAS
     * =====================================================
     */

    public validateDependencies():

        string[] {

        const errors: string[] = [];

        for (

            const resolver of

            this.all()

        ) {

            for (

                const dependency of

                resolver.dependsOn

            ) {

                if (

                    !this.exists(

                        dependency

                    )

                ) {

                    errors.push(

                        `Resolver '${resolver.id}' depende de '${dependency}', que no está registrado.`

                    );

                }

            }

        }

        return errors;

    }

    /**
     * =====================================================
     * EXISTEN ERRORES
     * =====================================================
     */

    public hasDependencyErrors():

        boolean {

        return (

            this.validateDependencies()

                .length > 0

        );

    }

    /**
     * =====================================================
     * RESOLVERS SIN DEPENDENCIAS
     * =====================================================
     */

    public rootResolvers():

        ResolverDefinition[] {

        return this.enabledResolvers()

            .filter(

                resolver =>

                    resolver.dependsOn.length === 0

            );

    }

    /**
     * =====================================================
     * RESOLVERS DEPENDIENTES
     * =====================================================
     */

    public dependentResolvers():

        ResolverDefinition[] {

        return this.enabledResolvers()

            .filter(

                resolver =>

                    resolver.dependsOn.length > 0

            );

    }


      /**
     * =====================================================
     * BÚSQUEDA
     * =====================================================
     */

    public find(

        predicate: (

            resolver: ResolverDefinition

        ) => boolean

    ): ResolverDefinition[] {

        return this.all().filter(

            predicate

        );

    }

    /**
     * =====================================================
     * FILTRAR POR PRIORIDAD
     * =====================================================
     */

    public byPriority(

        priority: number

    ): ResolverDefinition[] {

        return this.find(

            resolver =>

                resolver.priority === priority

        );

    }

    /**
     * =====================================================
     * FILTRAR POR DEPENDENCIA
     * =====================================================
     */

    public dependingOn(

        resolverId: string

    ): ResolverDefinition[] {

        return this.find(

            resolver =>

                resolver.dependsOn.includes(

                    resolverId

                )

        );

    }

    /**
     * =====================================================
     * RESOLVERS EJECUTABLES
     * =====================================================
     */

    public executable(

        executed: string[]

    ): ResolverDefinition[] {

        return this.enabledResolvers()

            .filter(

                resolver =>

                    resolver.dependsOn.every(

                        dependency =>

                            executed.includes(

                                dependency

                            )

                    )

            );

    }

    /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public statistics() {

        const enabled =

            this.enabledResolvers().length;

        const disabled =

            this.disabledResolvers().length;

        const root =

            this.rootResolvers().length;

        const dependent =

            this.dependentResolvers().length;

        return {

            total:

                this.catalog.size,

            enabled,

            disabled,

            rootResolvers: root,

            dependentResolvers: dependent

        };

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            statistics:

                this.statistics(),

            dependencyErrors:

                this.validateDependencies(),

            ordered:

                this.ordered().map(

                    resolver =>

                        resolver.id

                )

        };

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export():

        ResolverDefinition[] {

        return this.all().map(

            resolver => ({

                ...resolver,

                dependsOn: [

                    ...resolver.dependsOn

                ]

            })

        );

    }

    /**
     * =====================================================
     * IMPORTACIÓN
     * =====================================================
     */

    public import(

        definitions:

            ResolverDefinition[]

    ): void {

        this.catalog.clear();

        for (

            const definition of definitions

        ) {

            this.register(

                definition

            );

        }

    }

    /**
     * =====================================================
     * LIMPIAR REGISTRO
     * =====================================================
     */

    public clear(): void {

        this.catalog.clear();

    }


      /**
     * =====================================================
     * CONSTRUCCIÓN POR DEFECTO
     * =====================================================
     *
     * Este método permitirá que toda la aplicación obtenga
     * un registro preparado para producción.
     *
     * Los resolvers concretos se irán incorporando conforme
     * se desarrollen.
     */

    public static createDefault(): ResolverRegistry {

        const registry =

            new ResolverRegistry();

        /**
         * Registro automático de resolvers.
         *
         * Ejemplo:
         *
         * registry.register({
         *      id: "procedure",
         *      name: "Procedure Resolver",
         *      resolver: new ProcedureResolver(),
         *      priority: 100,
         *      dependsOn: [],
         *      enabled: true
         * });
         *
         * Aquí irán apareciendo todos los motores
         * del sistema.
         */

        return registry;

    }

    /**
     * =====================================================
     * RESUMEN
     * =====================================================
     */

    public summary() {

        return {

            totalResolvers:

                this.catalog.size,

            enabled:

                this.enabledResolvers().length,

            disabled:

                this.disabledResolvers().length,

            dependencyErrors:

                this.validateDependencies().length

        };

    }

    /**
     * =====================================================
     * COMPROBACIÓN DE SALUD
     * =====================================================
     */

    public health() {

        return {

            healthy:

                this.validateDependencies().length === 0,

            registeredResolvers:

                this.catalog.size,

            activeResolvers:

                this.enabledResolvers().length

        };

    }

    /**
     * =====================================================
     * SERIALIZACIÓN
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.export(),

            null,

            4

        );

    }

    /**
     * =====================================================
     * VERSIÓN
     * =====================================================
     */

    public version(): string {

        return "1.0.0";

    }

}
