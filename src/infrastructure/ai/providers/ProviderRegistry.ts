/******************************************************************************
 * ProviderRegistry
 *
 * Registro dinámico de proveedores IA.
 *
 * Permite añadir nuevos proveedores sin modificar
 * el resto del sistema.
 ******************************************************************************/

import { AIProvider } from "../AIProvider";

export class ProviderRegistry {

    private readonly providers =
        new Map<string, AIProvider>();

    /*======================================================================
    = REGISTRO
    ======================================================================*/

    public register(

        provider: AIProvider

    ): void {

        this.providers.set(

            provider.id,

            provider

        );

    }

    /*======================================================================
    = ELIMINACIÓN
    ======================================================================*/

    public unregister(

        providerId: string

    ): void {

        this.providers.delete(

            providerId

        );

    }

    /*======================================================================
    = EXISTENCIA
    ======================================================================*/

    public has(

        providerId: string

    ): boolean {

        return this.providers.has(

            providerId

        );

    }

    /*======================================================================
    = OBTENER
    ======================================================================*/

    public get(

        providerId: string

    ): AIProvider {

        const provider =

            this.providers.get(

                providerId

            );

        if (

            !provider

        ) {

            throw new Error(

                `Provider '${providerId}' not registered.`

            );

        }

        return provider;

    }

    /*======================================================================
    = OBTENER OPCIONAL
    ======================================================================*/

    public tryGet(

        providerId: string

    ): AIProvider | undefined {

        return this.providers.get(

            providerId

        );

    }

    /*======================================================================
    = LISTADO
    ======================================================================*/

    public getAll()

        : ReadonlyArray<AIProvider> {

        return Object.freeze(

            [

                ...this.providers.values()

            ]

        );

    }

    /*======================================================================
    = IDS
    ======================================================================*/

    public getIds()

        : ReadonlyArray<string> {

        return Object.freeze(

            [

                ...this.providers.keys()

            ]

        );

    }

    /*======================================================================
    = NÚMERO
    ======================================================================*/

    public size()

        : number {

        return this.providers.size;

    }

    /*======================================================================
    = LIMPIEZA
    ======================================================================*/

    public clear()

        : void {

        this.providers.clear();

    }

    /*======================================================================
    = HEALTH CHECK GLOBAL
    ======================================================================*/

    public async healthCheck()

        : Promise<Record<string, boolean>> {

        const result:

            Record<string, boolean> = {};

        for (

            const provider

            of this.providers.values()

        ) {

            try {

                result[provider.id] =

                    await provider.healthCheck();

            }

            catch {

                result[provider.id] =

                    false;

            }

        }

        return result;

    }

    /*======================================================================
    = PROVEEDOR POR DEFECTO
    ======================================================================*/

    public getDefault()

        : AIProvider {

        if (

            this.providers.size === 0

        ) {

            throw new Error(

                "No AI providers registered."

            );

        }

        return this.providers

            .values()

            .next()

            .value;

    }

}
