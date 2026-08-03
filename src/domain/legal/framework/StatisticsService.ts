/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * StatisticsService
 * ------------------------------------------------------------
 * Servicio centralizado de estadísticas.
 *
 * Todos los motores publican aquí sus métricas.
 *
 * ============================================================
 */

import {

    StatisticsResult

} from "./FrameworkTypes";

export interface StatisticsEntry {

    component: string;

    key: string;

    value: number;

}

export class StatisticsService {

    /**
     * Estadísticas registradas.
     */
    private readonly entries =

        new Map<string, StatisticsEntry[]>();

    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    public register(

        component: string,

        key: string,

        value: number

    ): void {

        const list =

            this.entries.get(component)

            ?? [];

        const existing =

            list.find(

                e => e.key === key

            );

        if (existing) {

            existing.value = value;

        }

        else {

            list.push({

                component,

                key,

                value

            });

        }

        this.entries.set(

            component,

            list

        );

    }

    /**
     * =====================================================
     * INCREMENTAR
     * =====================================================
     */

    public increment(

        component: string,

        key: string,

        amount = 1

    ): void {

        const current =

            this.get(

                component,

                key

            ) ?? 0;

        this.register(

            component,

            key,

            current + amount

        );

    }

    /**
     * =====================================================
     * OBTENER
     * =====================================================
     */

    public get(

        component: string,

        key: string

    ): number | undefined {

        const list =

            this.entries.get(

                component

            );

        return list

            ?.find(

                e => e.key === key

            )

            ?.value;

    }

    /**
     * =====================================================
     * TODAS LAS ESTADÍSTICAS
     * =====================================================
     */

    public byComponent(

        component: string

    ): StatisticsEntry[] {

        return [

            ...(this.entries.get(component)

            ?? [])

        ];

    }

    /**
     * =====================================================
     * TOTAL COMPONENTES
     * =====================================================
     */

    public components(): string[] {

        return Array.from(

            this.entries.keys()

        );

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export()

    : StatisticsResult {

        let total = 0;

        for (

            const component

            of this.entries.values()

        ) {

            for (

                const stat

                of component

            ) {

                total += stat.value;

            }

        }

        return {

            totalRules:

                this.get(

                    "RuleEngine",

                    "rules"

                ) ?? 0,

            executedRules:

                this.get(

                    "RuleEngine",

                    "executed"

                ) ?? 0,

            executionTime:

                this.get(

                    "Performance",

                    "executionTime"

                ) ?? 0,

            extra: {

                totalComponents:

                    this.entries.size,

                accumulatedValue:

                    total,

                statistics:

                    Object.fromEntries(

                        this.components().map(

                            c => [

                                c,

                                this.byComponent(c)

                            ]

                        )

                    )

            }

        };

    }

    /**
     * =====================================================
     * RESET
     * =====================================================
     */

    public clear(): void {

        this.entries.clear();

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            components:

                this.entries.size,

            statistics:

                this.components()

                    .length

        };

    }

}
