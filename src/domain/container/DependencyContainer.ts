/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DependencyContainer
 * ------------------------------------------------------------
 *
 * Contenedor de dependencias del sistema.
 *
 * RESPONSABILIDADES
 *
 * • Registrar servicios.
 * • Resolver dependencias.
 * • Gestionar Singleton.
 * • Crear instancias bajo demanda.
 * • Evitar dependencias circulares.
 *
 * IMPORTANTE
 *
 * Este componente NO contiene lógica jurídica.
 *
 * Su única misión es construir correctamente toda la
 * arquitectura de Contrata-IA.
 * ============================================================
 */

export type Constructor<T> = new (...args: any[]) => T;

/**
 * Resultado de validación estructural del contenedor.
 */
export interface ContainerValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Estado de salud observable del contenedor.
 */
export interface ContainerHealthStatus {
    healthy: boolean;
    registeredServices: number;
    singletonInstances: number;
    activeResolutions: number;
    errors: string[];
}

/**
 * Registro interno.
 */
interface ServiceDescriptor<T = unknown> {

    /**
     * Tipo registrado.
     */
    token: Constructor<T>;

    /**
     * Constructor.
     */
    implementation: Constructor<T>;

    /**
     * Instancia Singleton.
     */
    instance?: T;

    /**
     * Crear Singleton.
     */
    singleton: boolean;

}

/**
 * ============================================================
 * CONTENEDOR
 * ============================================================
 */

export class DependencyContainer {

    /**
     * Servicios registrados.
     */
    private readonly services =

        new Map<

            Constructor<any>,

            ServiceDescriptor

        >();

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public register<T>(

        token: Constructor<T>,

        implementation: Constructor<T>,

        singleton = true

    ): void {

        this.services.set(

            token,

            {

                token,

                implementation,

                singleton

            }

        );

    }

    /**
     * =====================================================
     * EXISTE
     * =====================================================
     */

    public has<T>(

        token: Constructor<T>

    ): boolean {

        return this.services.has(

            token

        );

    }

    /**
     * =====================================================
     * ELIMINACIÓN
     * =====================================================
     */

    public unregister<T>(

        token: Constructor<T>

    ): void {

        this.services.delete(

            token

        );

    }

    /**
     * =====================================================
     * LIMPIEZA
     * =====================================================
     */

    public clear(): void {

        this.services.clear();

    }

    /**
     * =====================================================
     * TOTAL
     * =====================================================
     */

    public count(): number {

        return this.services.size;

    }

    /**
     * =====================================================
     * LISTADO
     * =====================================================
     */

    public registeredServices():

        Constructor<any>[] {

        return Array.from(

            this.services.keys()

        );

    }

    /**
     * =====================================================
     * RESOLVER SERVICIO
     * =====================================================
     */

    public resolve<T>(

        token: Constructor<T>

    ): T {

        const descriptor =

            this.services.get(

                token

            );

        if (!descriptor) {

            throw new Error(

                `Servicio no registrado: ${token.name}`

            );

        }

        /**
         * Singleton ya construido.
         */

        if (

            descriptor.singleton &&

            descriptor.instance

        ) {

            return descriptor.instance as T;

        }

        /**
         * Crear nueva instancia.
         */

        const instance =

            this.instantiate(

                descriptor.implementation

            );

        if (

            descriptor.singleton

        ) {

            descriptor.instance =

                instance;

        }

        return instance;

    }

    /**
     * =====================================================
     * RESOLVER OPCIONAL
     * =====================================================
     */

    public tryResolve<T>(

        token: Constructor<T>

    ): T | undefined {

        if (

            !this.has(token)

        ) {

            return undefined;

        }

        return this.resolve(

            token

        );

    }

    /**
     * =====================================================
     * CREACIÓN DE INSTANCIA
     * =====================================================
     */

    private instantiate<T>(

        implementation:

            Constructor<T>

    ): T {

        return new implementation();

    }

    /**
     * =====================================================
     * RECONSTRUCCIÓN
     * =====================================================
     */

    public rebuild<T>(

        token: Constructor<T>

    ): T {

        const descriptor =

            this.services.get(

                token

            );

        if (!descriptor) {

            throw new Error(

                `Servicio no registrado: ${token.name}`

            );

        }

        descriptor.instance =

            undefined;

        return this.resolve(

            token

        );

    }

    /**
     * =====================================================
     * DESTRUIR SINGLETON
     * =====================================================
     */

    public destroy<T>(

        token: Constructor<T>

    ): void {

        const descriptor =

            this.services.get(

                token

            );

        if (!descriptor) {

            return;

        }

        descriptor.instance =

            undefined;

    }

    /**
     * =====================================================
     * DESTRUIR TODOS
     * =====================================================
     */

    public destroyAll(): void {

        for (

            const descriptor of

            this.services.values()

        ) {

            descriptor.instance =

                undefined;

        }

    }

    /**
     * =====================================================
     * DETECCIÓN DE DEPENDENCIAS CIRCULARES
     * =====================================================
     */

    private readonly resolvingStack: Constructor<any>[] = [];

    private isResolving<T>(

        token: Constructor<T>

    ): boolean {

        return this.resolvingStack.includes(

            token

        );

    }

    private beginResolve<T>(

        token: Constructor<T>

    ): void {

        if (this.isResolving(token)) {

            throw new Error(

                `Dependencia circular detectada: ${token.name}`

            );

        }

        this.resolvingStack.push(token);

    }

    private endResolve<T>(

        token: Constructor<T>

    ): void {

        const index =

            this.resolvingStack.lastIndexOf(token);

        if (index >= 0) {

            this.resolvingStack.splice(index, 1);

        }

    }

    public validate(): ContainerValidationResult {

        const errors: string[] = [];

        for (const descriptor of this.services.values()) {

            if (!descriptor.token) {

                errors.push("Servicio sin token.");

            }

            if (!descriptor.implementation) {

                errors.push(

                    `Implementación no definida para ${descriptor.token?.name}`

                );

            }

        }

        return {

            valid: errors.length === 0,

            errors

        };

    }

    public health(): ContainerHealthStatus {

        const validation = this.validate();

        return {

            healthy: validation.valid,

            registeredServices: this.count(),

            singletonInstances: Array.from(this.services.values())

                .filter(s => s.instance !== undefined)

                .length,

            activeResolutions: this.resolvingStack.length,

            errors: validation.errors

        };

    }

    public metrics() {

        return {

            totalServices: this.count(),

            singletonServices:

                Array.from(this.services.values())

                    .filter(s => s.singleton)

                    .length,

            transientServices:

                Array.from(this.services.values())

                    .filter(s => !s.singleton)

                    .length,

            instantiatedServices:

                Array.from(this.services.values())

                    .filter(s => s.instance !== undefined)

                    .length

        };

    }

    public exportState() {

        return {

            services:

                Array.from(this.services.values()).map(

                    service => ({

                        token: service.token.name,

                        implementation:

                            service.implementation.name,

                        singleton:

                            service.singleton,

                        instantiated:

                            service.instance !== undefined

                    })

                ),

            metrics:

                this.metrics(),

            health:

                this.health()

        };

    }

    public resolveSafe<T>(

        token: Constructor<T>

    ): T | undefined {

        try {

            return this.resolve(token);

        }

        catch (error) {

            console.error(

                `[DependencyContainer] Error resolviendo ${token.name}`,

                error

            );

            return undefined;

        }

    }

    public replace<T>(

        token: Constructor<T>,

        implementation: Constructor<T>,

        singleton = true

    ): void {

        this.register(

            token,

            implementation,

            singleton

        );

    }

    public isInstantiated<T>(

        token: Constructor<T>

    ): boolean {

        const descriptor =

            this.services.get(token);

        if (!descriptor) {

            return false;

        }

        return descriptor.instance !== undefined;

    }

    public descriptor<T>(

        token: Constructor<T>

    ): ServiceDescriptor<T> | undefined {

        return this.services.get(

            token

        ) as ServiceDescriptor<T>;

    }

    public warmUp(): void {

        for (

            const descriptor of

            this.services.values()

        ) {

            if (!descriptor.singleton) {

                continue;

            }

            if (descriptor.instance) {

                continue;

            }

            this.resolve(

                descriptor.token

            );

        }

    }

    public reset(): void {

        this.destroyAll();

        this.resolvingStack.length = 0;

    }

    public snapshot() {

        return {

            registered:

                this.count(),

            instantiated:

                Array.from(

                    this.services.values()

                ).filter(

                    service =>

                        service.instance !== undefined

                ).length,

            resolving:

                this.resolvingStack.map(

                    service =>

                        service.name

                )

        };

    }

    public printStatus(): void {

        console.table(

            this.exportState()

                .services

        );

    }

    public static createDefault():

        DependencyContainer {

        const container =

            new DependencyContainer();

        return container;

    }

    public info() {

        return {

            version: this.version(),

            services: this.count(),

            health: this.health(),

            metrics: this.metrics()

        };

    }

    public toJSON(): string {

        return JSON.stringify(

            this.exportState(),

            null,

            4

        );

    }

    public version(): string {

        return "1.0.0";

    }

}
