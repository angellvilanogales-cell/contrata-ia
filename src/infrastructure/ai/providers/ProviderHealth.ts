/******************************************************************************
 * ProviderHealth
 *
 * Monitor de salud de proveedores IA.
 *
 * Funciones:
 *
 * - Monitorización continua
 * - Latencia
 * - Disponibilidad
 * - Fallos
 * - Estadísticas
 * - Selección automática del mejor proveedor
 *
 ******************************************************************************/

import { AIProvider } from "../AIProvider";

export interface ProviderHealthStatus {

    provider: string;

    available: boolean;

    latency: number;

    failures: number;

    successes: number;

    lastCheck: Date;

    score: number;

}

export class ProviderHealth {

    private readonly providers =

        new Map<string, AIProvider>();

    private readonly status =

        new Map<string, ProviderHealthStatus>();

    constructor(

        providers: AIProvider[] = []

    ) {

        providers.forEach(

            provider =>

                this.register(provider)

        );

    }

    /**************************************************************************
     * REGISTRO
     *************************************************************************/

    public register(

        provider: AIProvider

    ): void {

        this.providers.set(

            provider.id,

            provider

        );

        this.status.set(

            provider.id,

            {

                provider: provider.id,

                available: false,

                latency: 0,

                failures: 0,

                successes: 0,

                lastCheck: new Date(0),

                score: 0

            }

        );

    }

    /**************************************************************************
     * HEALTH CHECK GLOBAL
     *************************************************************************/

    public async checkAll()

        : Promise<void> {

        for (

            const provider

            of this.providers.values()

        ) {

            await this.check(

                provider

            );

        }

    }

    /**************************************************************************
     * HEALTH CHECK INDIVIDUAL
     *************************************************************************/

    public async check(

        provider: AIProvider

    ): Promise<void> {

        const start =

            performance.now();

        const state =

            this.status.get(

                provider.id

            )!;

        try {

            const ok =

                await provider.healthCheck();

            state.available = ok;

            state.latency =

                performance.now() - start;

            state.successes++;

            state.lastCheck =

                new Date();

        }

        catch {

            state.available = false;

            state.failures++;

            state.lastCheck =

                new Date();

        }

        state.score =

            this.calculateScore(

                state

            );

    }

    /**************************************************************************
     * CÁLCULO DE PUNTUACIÓN
     *************************************************************************/

    private calculateScore(

        state: ProviderHealthStatus

    ): number {

        if (

            !state.available

        ) {

            return 0;

        }

        const successRatio =

            state.successes /

            Math.max(

                1,

                state.successes +

                state.failures

            );

        const latencyFactor =

            Math.max(

                0,

                1000 -

                state.latency

            ) / 1000;

        return (

            successRatio * 0.70 +

            latencyFactor * 0.30

        );

    }

    /**************************************************************************
     * MEJOR PROVEEDOR
     *************************************************************************/

    public getBestProvider()

        : AIProvider {

        const best =

            [...this.status.values()]

                .filter(

                    x =>

                        x.available

                )

                .sort(

                    (

                        a,

                        b

                    ) =>

                        b.score -

                        a.score

                )[0];

        if (

            !best

        ) {

            throw new Error(

                "No AI provider available."

            );

        }

        return this.providers.get(

            best.provider

        )!;

    }

    /**************************************************************************
     * DISPONIBLES
     *************************************************************************/

    public getAvailableProviders()

        : AIProvider[] {

        return [...this.status.values()]

            .filter(

                s =>

                    s.available

            )

            .map(

                s =>

                    this.providers.get(

                        s.provider

                    )!

            );

    }

    /**************************************************************************
     * ESTADO
     *************************************************************************/

    public getStatus()

        : ProviderHealthStatus[] {

        return [

            ...this.status.values()

        ];

    }

    /**************************************************************************
     * ESTADO INDIVIDUAL
     *************************************************************************/

    public getProviderStatus(

        id: string

    )

        : ProviderHealthStatus | undefined {

        return this.status.get(

            id

        );

    }

    /**************************************************************************
     * DISPONIBILIDAD
     *************************************************************************/

    public isAvailable(

        id: string

    ): boolean {

        return (

            this.status.get(

                id

            )?.available ??

            false

        );

    }

    /**************************************************************************
     * RESET
     *************************************************************************/

    public reset()

        : void {

        this.status.clear();

        this.providers.clear();

    }

}
