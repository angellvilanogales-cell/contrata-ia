/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI PROVIDER REGISTRY
 *
 * Registro centralizado de proveedores de IA.
 *
 ******************************************************************************/

import {
    AIProvider,
    AIProviderType
} from "./AIProvider";

export class AIProviderRegistry {

    private readonly providers =
        new Map<AIProviderType, AIProvider>();

    private activeProvider?:
        AIProviderType;

    /**********************************************************************
     * REGISTER
     **********************************************************************/

    public register(
        provider: AIProvider
    ): void {

        this.providers.set(
            provider.provider,
            provider
        );

        if (!this.activeProvider) {

            this.activeProvider =
                provider.provider;

        }

    }

    /**********************************************************************
     * UNREGISTER
     **********************************************************************/

    public unregister(
        provider: AIProviderType
    ): boolean {

        if (
            this.activeProvider === provider
        ) {

            this.activeProvider =
                undefined;

        }

        return this.providers.delete(
            provider
        );

    }

    /**********************************************************************
     * GET
     **********************************************************************/

    public get(
        provider: AIProviderType
    ): AIProvider {

        const result =
            this.providers.get(
                provider
            );

        if (!result) {

            throw new Error(
                `Proveedor IA no registrado: ${provider}`
            );

        }

        return result;

    }

    /**********************************************************************
     * GET ACTIVE
     **********************************************************************/

    public getActive(): AIProvider {

        if (!this.activeProvider) {

            throw new Error(
                "No existe proveedor IA activo."
            );

        }

        return this.get(
            this.activeProvider
        );

    }

    /**********************************************************************
     * SET ACTIVE
     **********************************************************************/

    public setActive(
        provider: AIProviderType
    ): void {

        if (
            !this.providers.has(
                provider
            )
        ) {

            throw new Error(
                `Proveedor no registrado: ${provider}`
            );

        }

        this.activeProvider =
            provider;

    }

    /**********************************************************************
     * HAS
     **********************************************************************/

    public has(
        provider: AIProviderType
    ): boolean {

        return this.providers.has(
            provider
        );

    }

    /**********************************************************************
     * COUNT
     **********************************************************************/

    public count(): number {

        return this.providers.size;

    }

    /**********************************************************************
     * CLEAR
     **********************************************************************/

    public async clear(): Promise<void> {

        for (
            const provider
            of this.providers.values()
        ) {

            await provider.dispose();

        }

        this.providers.clear();

        this.activeProvider =
            undefined;

    }

    /**********************************************************************
     * LIST
     **********************************************************************/

    public listProviders(): AIProviderType[] {

        return [
            ...this.providers.keys()
        ];

    }

    /**********************************************************************
     * HEALTH CHECK
     **********************************************************************/

    public async healthReport() {

        const report = [];

        for (
            const provider
            of this.providers.values()
        ) {

            report.push(

                await provider.healthCheck()

            );

        }

        return report;

    }

    /**********************************************************************
     * ACTIVE PROVIDER
     **********************************************************************/

    public getActiveProviderType()

        : AIProviderType | undefined {

        return this.activeProvider;

    }

}
