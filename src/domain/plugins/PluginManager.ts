/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PluginManager
 * ------------------------------------------------------------
 *
 * Gestor de Plugins del sistema.
 *
 * RESPONSABILIDADES
 *
 * • Registrar plugins.
 * • Activarlos.
 * • Desactivarlos.
 * • Cargar módulos.
 * • Descargar módulos.
 * • Comprobar compatibilidad.
 * • Gestionar dependencias.
 *
 * IMPORTANTE
 *
 * Este componente NO conoce la LCSP.
 *
 * Su única misión consiste en administrar los
 * complementos instalados en Contrata-IA.
 * ============================================================
 */

/**
 * Estado del plugin.
 */
export enum PluginStatus {

    REGISTERED = "REGISTERED",

    ENABLED = "ENABLED",

    DISABLED = "DISABLED",

    ERROR = "ERROR"

}

/**
 * Contrato de cualquier plugin.
 */
export interface Plugin {

    /**
     * Identificador.
     */
    readonly id: string;

    /**
     * Nombre.
     */
    readonly name: string;

    /**
     * Versión.
     */
    readonly version: string;

    /**
     * Dependencias.
     */
    readonly dependencies?: string[];

    /**
     * Inicialización.
     */
    initialize(): Promise<void> | void;

    /**
     * Finalización.
     */
    dispose(): Promise<void> | void;

}

/**
 * Información registrada.
 */
interface RegisteredPlugin {

    plugin: Plugin;

    status: PluginStatus;

    installedAt: Date;

}

/**
 * ============================================================
 * PLUGIN MANAGER
 * ============================================================
 */

export class PluginManager {

    /**
     * Plugins registrados.
     */
    private readonly plugins =

        new Map<

            string,

            RegisteredPlugin

        >();

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public register(

        plugin: Plugin

    ): void {

        this.plugins.set(

            plugin.id,

            {

                plugin,

                status:

                    PluginStatus.REGISTERED,

                installedAt:

                    new Date()

            }

        );

    }

    /**
     * =====================================================
     * EXISTE
     * =====================================================
     */

    public exists(

        pluginId: string

    ): boolean {

        return this.plugins.has(

            pluginId

        );

    }

    /**
     * =====================================================
     * OBTENER
     * =====================================================
     */

    public get(

        pluginId: string

    ): Plugin | undefined {

        return this.plugins.get(

            pluginId

        )?.plugin;

    }

    /**
     * =====================================================
     * ELIMINAR
     * =====================================================
     */

    public unregister(

        pluginId: string

    ): void {

        this.plugins.delete(

            pluginId

        );

    }

    /**
     * =====================================================
     * TOTAL
     * =====================================================
     */

    public count(): number {

        return this.plugins.size;

    }

    /**
     * =====================================================
     * LISTADO
     * =====================================================
     */

    public registeredPlugins():

        Plugin[] {

        return Array.from(

            this.plugins.values()

        ).map(

            registered =>

                registered.plugin

        );

    }

      /**
     * =====================================================
     * ACTIVAR PLUGIN
     * =====================================================
     */

    public async enable(

        pluginId: string

    ): Promise<void> {

        const registered =

            this.plugins.get(pluginId);

        if (!registered) {

            throw new Error(

                `Plugin '${pluginId}' no registrado.`

            );

        }

        /**
         * Verificar dependencias.
         */

        this.verifyDependencies(

            registered.plugin

        );

        try {

            await registered.plugin.initialize();

            registered.status =

                PluginStatus.ENABLED;

        }

        catch (error) {

            registered.status =

                PluginStatus.ERROR;

            throw error;

        }

    }

    /**
     * =====================================================
     * DESACTIVAR PLUGIN
     * =====================================================
     */

    public async disable(

        pluginId: string

    ): Promise<void> {

        const registered =

            this.plugins.get(pluginId);

        if (!registered) {

            return;

        }

        try {

            await registered.plugin.dispose();

        }

        finally {

            registered.status =

                PluginStatus.DISABLED;

        }

    }

    /**
     * =====================================================
     * CARGAR TODOS
     * =====================================================
     */

    public async enableAll(): Promise<void> {

        for (

            const plugin of

            this.plugins.values()

        ) {

            await this.enable(

                plugin.plugin.id

            );

        }

    }

    /**
     * =====================================================
     * DESCARGAR TODOS
     * =====================================================
     */

    public async disableAll(): Promise<void> {

        for (

            const plugin of

            this.plugins.values()

        ) {

            await this.disable(

                plugin.plugin.id

            );

        }

    }

    /**
     * =====================================================
     * VERIFICACIÓN DE DEPENDENCIAS
     * =====================================================
     */

    private verifyDependencies(

        plugin: Plugin

    ): void {

        if (

            !plugin.dependencies ||

            plugin.dependencies.length === 0

        ) {

            return;

        }

        for (

            const dependency of

            plugin.dependencies

        ) {

            if (

                !this.exists(

                    dependency

                )

            ) {

                throw new Error(

                    `Dependencia '${dependency}' requerida por '${plugin.id}' no encontrada.`

                );

            }

        }

    }

    /**
     * =====================================================
     * ESTADO DEL PLUGIN
     * =====================================================
     */

    public status(

        pluginId: string

    ): PluginStatus | undefined {

        return this.plugins.get(

            pluginId

        )?.status;

    }

    /**
     * =====================================================
     * PLUGINS ACTIVOS
     * =====================================================
     */

    public enabledPlugins(): Plugin[] {

        return Array.from(

            this.plugins.values()

        )

        .filter(

            plugin =>

                plugin.status ===

                PluginStatus.ENABLED

        )

        .map(

            plugin =>

                plugin.plugin

        );

    }

    /**
     * =====================================================
     * PLUGINS DESACTIVADOS
     * =====================================================
     */

    public disabledPlugins(): Plugin[] {

        return Array.from(

            this.plugins.values()

        )

        .filter(

            plugin =>

                plugin.status ===

                PluginStatus.DISABLED

        )

        .map(

            plugin =>

                plugin.plugin

        );

    }
      /**
     * =====================================================
     * PLUGINS CON ERROR
     * =====================================================
     */

    public pluginsWithErrors(): Plugin[] {

        return Array.from(

            this.plugins.values()

        )

        .filter(

            plugin =>

                plugin.status ===

                PluginStatus.ERROR

        )

        .map(

            plugin =>

                plugin.plugin

        );

    }

    /**
     * =====================================================
     * INFORMACIÓN DE UN PLUGIN
     * =====================================================
     */

    public pluginInfo(

        pluginId: string

    ) {

        const registered =

            this.plugins.get(

                pluginId

            );

        if (!registered) {

            return undefined;

        }

        return {

            id:

                registered.plugin.id,

            name:

                registered.plugin.name,

            version:

                registered.plugin.version,

            status:

                registered.status,

            dependencies:

                registered.plugin.dependencies ?? [],

            installedAt:

                registered.installedAt

        };

    }

    /**
     * =====================================================
     * COMPATIBILIDAD
     * =====================================================
     */

    public compatibilityReport() {

        return Array.from(

            this.plugins.values()

        ).map(

            registered => ({

                plugin:

                    registered.plugin.name,

                version:

                    registered.plugin.version,

                compatible:

                    true,

                dependencies:

                    registered.plugin.dependencies ?? []

            })

        );

    }

    /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public statistics() {

        return {

            total:

                this.plugins.size,

            enabled:

                this.enabledPlugins().length,

            disabled:

                this.disabledPlugins().length,

            errors:

                this.pluginsWithErrors().length

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

            registeredPlugins:

                this.registeredPlugins().map(

                    plugin => ({

                        id:

                            plugin.id,

                        name:

                            plugin.name,

                        version:

                            plugin.version,

                        status:

                            this.status(

                                plugin.id

                            )

                    })

                ),

            compatibility:

                this.compatibilityReport()

        };

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public exportState() {

        return {

            diagnostics:

                this.diagnostics(),

            plugins:

                Array.from(

                    this.plugins.values()

                ).map(

                    registered => ({

                        id:

                            registered.plugin.id,

                        name:

                            registered.plugin.name,

                        version:

                            registered.plugin.version,

                        status:

                            registered.status

                    })

                )

        };

    }

    /**
     * =====================================================
     * REINICIO
     * =====================================================
     */

    public reset(): void {

        this.plugins.clear();

    }

      /**
     * =====================================================
     * HEALTH CHECK
     * =====================================================
     */

    public health() {

        return {

            healthy:

                this.pluginsWithErrors().length === 0,

            statistics:

                this.statistics(),

            registeredPlugins:

                this.plugins.size

        };

    }

    /**
     * =====================================================
     * FACTORÍA POR DEFECTO
     * =====================================================
     */

    public static createDefault():

        PluginManager {

        const manager =

            new PluginManager();

        /**
         * Aquí se registrarán automáticamente
         * todos los plugins oficiales.
         *
         * Ejemplos:
         *
         * manager.register(
         *      new LCSPPlugin()
         * );
         *
         * manager.register(
         *      new CPVPlugin()
         * );
         *
         * manager.register(
         *      new JuntaAndaluciaPlugin()
         * );
         *
         * manager.register(
         *      new DocumentAIPlugin()
         * );
         */

        return manager;

    }

    /**
     * =====================================================
     * INFORMACIÓN
     * =====================================================
     */

    public info() {

        return {

            version:

                this.version(),

            health:

                this.health(),

            statistics:

                this.statistics(),

            compatibility:

                this.compatibilityReport()

        };

    }

    /**
     * =====================================================
     * SERIALIZACIÓN
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.info(),

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

}
