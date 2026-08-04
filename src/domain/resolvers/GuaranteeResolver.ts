/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * GuaranteeResolver
 * ------------------------------------------------------------
 * Determina:
 *
 * • Garantía provisional
 * • Garantía definitiva
 * • Garantía complementaria
 * • Exenciones
 *
 * Toda la lógica económica procede del
 * ThresholdResolver.
 *
 * ============================================================
 */

import { BaseResolver } from "../framework/BaseResolver";

import {

    ResolverContext,
    ResolverDecision

} from "../framework/FrameworkTypes";

import { ThresholdResolver } from "./ThresholdResolver";

import { KnowledgeConnector } from "../framework/KnowledgeConnector";

import { RuleExecutor } from "../framework/RuleExecutor";

import { DecisionFactory } from "../framework/DecisionFactory";

import { ValidationPipeline } from "../framework/ValidationPipeline";

import { AuditService } from "../framework/AuditService";

import { StatisticsService } from "../framework/StatisticsService";

import { DiagnosticService } from "../framework/DiagnosticService";

import { BaseCache } from "../framework/BaseCache";

import {

    GuaranteeResult

} from "../types/GuaranteeResult";

import {

    GuaranteeReason

} from "../types/GuaranteeReason";

export class GuaranteeResolver

extends BaseResolver<GuaranteeResult>{

    /**
     * Caché
     */

    private readonly cache=

        new BaseCache<

            ResolverDecision<GuaranteeResult>

        >();

    constructor(

        private readonly thresholds:

            ThresholdResolver,

        private readonly knowledge:

            KnowledgeConnector,

        private readonly rules:

            RuleExecutor,

        private readonly audit:

            AuditService,

        private readonly statistics:

            StatisticsService,

        private readonly diagnostics:

            DiagnosticService

    ){

        super(

            "GuaranteeResolver"

        );

    }

    /**
     * =====================================================
     * Entrada
     * =====================================================
     */

    public resolve(

        context:ResolverContext

    ):ResolverDecision<GuaranteeResult>{

        const cacheKey=

            JSON.stringify({

                value:

                    context.contract.estimatedValue,

                type:

                    context.contract.type,

                cpv:

                    context.contract.cpv

            });

        const cached=

            this.cache.get(

                cacheKey

            );

        if(cached){

            return cached;

        }

        this.statistics.increment(

            "GuaranteeResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio GuaranteeResolver"

        );

        return this.execute(

            context,

            cacheKey

        );

    }

    /**
     * =====================================================
     * EJECUCIÓN INTERNA
     * =====================================================
     */

    private execute(

        context: ResolverContext,

        cacheKey: string

    ): ResolverDecision<GuaranteeResult> {

        /**
         * -------------------------------------------------
         * 1. Obtener umbrales ya calculados
         * -------------------------------------------------
         */

        const thresholdDecision =

            this.thresholds.resolve(

                context

            );

        const thresholds =

            thresholdDecision.value;

        /**
         * -------------------------------------------------
         * 2. Ejecutar reglas jurídicas
         * -------------------------------------------------
         */

        const executions =

            this.rules.execute(

                context

            );

        this.audit.log(

            "RULE_ENGINE",

            "Reglas de garantías ejecutadas",

            executions

        );

        /**
         * -------------------------------------------------
         * 3. Recuperar conocimiento
         * -------------------------------------------------
         */

        const knowledge =

            this.knowledge.hybrid(

                [

                    "garantías",

                    context.contract.type,

                    context.contract.cpv,

                    String(

                        context.contract.estimatedValue

                    )

                ].join(" ")

            );

        /**
         * -------------------------------------------------
         * 4. Calcular garantías
         * -------------------------------------------------
         */

        const guarantees =

            this.calculateGuarantees(

                context,

                thresholds,

                executions

            );

        /**
         * -------------------------------------------------
         * 5. Crear decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                guarantees,

                GuaranteeReason.AUTOMATIC

            );

        /**
         * -------------------------------------------------
         * 6. Añadir justificación jurídica
         * -------------------------------------------------
         */

        for (

            const pack

            of knowledge

        ) {

            decision.reasons.push({

                source:

                    pack.pack.id,

                description:

                    pack.reason

            });

        }

        /**
         * -------------------------------------------------
         * 7. Validación
         * -------------------------------------------------
         */

        ValidationPipeline.validate(

            decision,

            context

        );

        /**
         * -------------------------------------------------
         * 8. Auditoría
         * -------------------------------------------------
         */

        this.audit.decision(

            decision

        );

        /**
         * -------------------------------------------------
         * 9. Estadísticas
         * -------------------------------------------------
         */

        this.statistics.increment(

            "GuaranteeResolver",

            "resolved"

        );

        /**
         * -------------------------------------------------
         * 10. Caché
         * -------------------------------------------------
         */

        this.cache.set(

            cacheKey,

            decision

        );

        return decision;

    }

    /**
     * =====================================================
     * CÁLCULO DE GARANTÍAS
     * =====================================================
     */

    private calculateGuarantees(

        context: ResolverContext,

        thresholds: any,

        executions: ReadonlyArray<any>

    ): GuaranteeResult {

        /**
         * -------------------------------------------------
         * Si alguna regla jurídica ya determina el
         * resultado, se utiliza directamente.
         * -------------------------------------------------
         */

        for (

            const execution

            of executions

        ) {

            if (

                execution.valid &&
                execution.value !== undefined

            ) {

                return execution.value as GuaranteeResult;

            }

        }

        const estimatedValue =

            Number(

                context.contract.estimatedValue

                ?? 0

            );

        /**
         * =================================================
         * Porcentajes parametrizados
         * =================================================
         */

        const provisionalPercentage =

            this.rules.variable<number>(

                "PROVISIONAL_GUARANTEE_PERCENTAGE"

            ) ?? 0;

        const definitivePercentage =

            this.rules.variable<number>(

                "DEFINITIVE_GUARANTEE_PERCENTAGE"

            ) ?? 5;

        const complementaryPercentage =

            this.rules.variable<number>(

                "COMPLEMENTARY_GUARANTEE_PERCENTAGE"

            ) ?? 5;

        /**
         * =================================================
         * Exención contrato menor
         * =================================================
         */

        const exemptMinor =

            thresholds.isMinor;

        /**
         * =================================================
         * Garantía provisional
         * =================================================
         */

        const provisionalRequired =

            provisionalPercentage > 0 &&
            !exemptMinor;

        const provisionalAmount =

            provisionalRequired

                ? estimatedValue *
                    provisionalPercentage /
                    100

                : 0;

        /**
         * =================================================
         * Garantía definitiva
         * =================================================
         */

        const definitiveRequired =

            !exemptMinor;

        const definitiveAmount =

            definitiveRequired

                ? estimatedValue *
                    definitivePercentage /
                    100

                : 0;

        /**
         * =================================================
         * Garantía complementaria
         * =================================================
         */

        const complementaryRequired =

            Boolean(

                context.flags?.abnormallyLowBid ||

                context.flags?.specialRisk ||

                context.flags?.highComplexity

            );

        const complementaryAmount =

            complementaryRequired

                ? estimatedValue *
                    complementaryPercentage /
                    100

                : 0;

        /**
         * =================================================
         * Resultado
         * =================================================
         */

        return {

            estimatedValue,

            exempt: exemptMinor,

            provisional: {

                required:

                    provisionalRequired,

                percentage:

                    provisionalPercentage,

                amount:

                    provisionalAmount

            },

            definitive: {

                required:

                    definitiveRequired,

                percentage:

                    definitivePercentage,

                amount:

                    definitiveAmount

            },

            complementary: {

                required:

                    complementaryRequired,

                percentage:

                    complementaryPercentage,

                amount:

                    complementaryAmount

            }

        };

    }

    /**
     * =====================================================
     * RAZONAMIENTO JURÍDICO
     * =====================================================
     */

    private buildReasoning(

        context: ResolverContext,

        decision: ResolverDecision<GuaranteeResult>

    ): void {

        const guarantee = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones del grafo jurídico
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "Garantías"

            );

        for (

            const relation

            of relations

        ) {

            decision.reasons.push({

                source:

                    "KnowledgeGraph",

                description:

                    `${relation.from} ${relation.relation} ${relation.to}`

            });

        }

        /**
         * ---------------------------------------------
         * Knowledge Packs relacionados
         * ---------------------------------------------
         */

        const packs =

            this.knowledge.hybrid(

                "garantías contrato"

            );

        for (

            const pack

            of packs

        ) {

            decision.reasons.push({

                source:

                    pack.pack.id,

                description:

                    pack.reason

            });

        }

        /**
         * ---------------------------------------------
         * Justificación específica
         * ---------------------------------------------
         */

        if (

            guarantee.exempt

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "El expediente queda exento de garantía por aplicación del régimen correspondiente."

            });

        }

        else {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "La garantía definitiva se calcula conforme al porcentaje configurado para el expediente."

            });

        }

        if (

            guarantee.complementary.required

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "Procede garantía complementaria debido al nivel de riesgo identificado."

            });

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validateGuarantees(

        decision: ResolverDecision<GuaranteeResult>

    ): void {

        const guarantee = decision.value;

        if (

            guarantee.estimatedValue < 0

        ) {

            decision.validation.errors.push(

                "El valor estimado es inválido."

            );

        }

        if (

            guarantee.definitive.percentage < 0 ||

            guarantee.provisional.percentage < 0 ||

            guarantee.complementary.percentage < 0

        ) {

            decision.validation.errors.push(

                "Los porcentajes de garantía no son válidos."

            );

        }

        if (

            guarantee.exempt &&

            guarantee.definitive.required

        ) {

            decision.validation.errors.push(

                "No puede exigirse garantía definitiva cuando el expediente está exento."

            );

        }

        decision.valid =

            decision.validation.errors.length === 0;

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics() {

        return {

            cache:

                this.cache.diagnostics(),

            statistics:

                this.statistics.export(),

            framework:

                this.diagnostics.report(),

            audit:

                this.audit.export()

        };

    }

}
