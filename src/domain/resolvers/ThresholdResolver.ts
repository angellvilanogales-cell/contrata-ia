/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ThresholdResolver
 * ------------------------------------------------------------
 * Resolver responsable de determinar los umbrales
 * económicos aplicables al expediente.
 *
 * Todas las decisiones relacionadas con:
 *
 *  • Contrato menor
 *  • Simplificado
 *  • DOUE
 *  • Recursos especiales
 *  • Publicidad
 *
 * deben pasar por este resolver.
 *
 * ============================================================
 */

import { BaseResolver } from "../framework/BaseResolver";

import {

    ResolverContext,
    ResolverDecision

} from "../framework/FrameworkTypes";

import { KnowledgeConnector } from "../framework/KnowledgeConnector";

import { RuleExecutor } from "../framework/RuleExecutor";

import { DecisionFactory } from "../framework/DecisionFactory";

import { ValidationPipeline } from "../framework/ValidationPipeline";

import { AuditService } from "../framework/AuditService";

import { StatisticsService } from "../framework/StatisticsService";

import { DiagnosticService } from "../framework/DiagnosticService";

import { BaseCache } from "../framework/BaseCache";

import {

    ThresholdResult

} from "../types/ThresholdResult";

import {

    ThresholdReason

} from "../types/ThresholdReason";

export class ThresholdResolver extends BaseResolver<ThresholdResult> {

    /**
     * Caché del resolver.
     */
    private readonly cache =

        new BaseCache<ResolverDecision<ThresholdResult>>();

    constructor(

        private readonly knowledge: KnowledgeConnector,

        private readonly rules: RuleExecutor,

        private readonly audit: AuditService,

        private readonly statistics: StatisticsService,

        private readonly diagnostics: DiagnosticService

    ) {

        super(

            "ThresholdResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada.
     * =====================================================
     */

    public resolve(

        context: ResolverContext

    ): ResolverDecision<ThresholdResult> {

        const cacheKey = JSON.stringify({

            contractType:

                context.contract.type,

            estimatedValue:

                context.contract.estimatedValue,

            cpv:

                context.contract.cpv

        });

        const cached =

            this.cache.get(

                cacheKey

            );

        if (cached) {

            return cached;

        }

        this.statistics.increment(

            "ThresholdResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio ThresholdResolver"

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

    ): ResolverDecision<ThresholdResult> {

        /**
         * -------------------------------------------------
         * Ejecutar reglas jurídicas
         * -------------------------------------------------
         */

        const executions =

            this.rules.execute(

                context

            );

        this.audit.log(

            "RULE_ENGINE",

            "Reglas de umbrales ejecutadas",

            executions

        );

        /**
         * -------------------------------------------------
         * Obtener conocimiento asociado
         * -------------------------------------------------
         */

        const knowledge =

            this.knowledge.hybrid(

                [

                    context.contract.type,

                    context.contract.cpv,

                    String(

                        context.contract.estimatedValue

                    )

                ].join(" ")

            );

        /**
         * -------------------------------------------------
         * Calcular umbrales
         * -------------------------------------------------
         */

        const result =

            this.calculateThresholds(

                context,

                executions

            );

        /**
         * -------------------------------------------------
         * Construcción de decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                result,

                ThresholdReason.AUTOMATIC

            );

        /**
         * -------------------------------------------------
         * Justificación jurídica
         * -------------------------------------------------
         */

        for (

            const item

            of knowledge

        ) {

            decision.reasons.push({

                source:

                    item.pack.id,

                description:

                    item.reason

            });

        }

        /**
         * -------------------------------------------------
         * Validación
         * -------------------------------------------------
         */

        ValidationPipeline.validate(

            decision,

            context

        );

        /**
         * -------------------------------------------------
         * Auditoría
         * -------------------------------------------------
         */

        this.audit.decision(

            decision

        );

        /**
         * -------------------------------------------------
         * Estadísticas
         * -------------------------------------------------
         */

        this.statistics.increment(

            "ThresholdResolver",

            "resolved"

        );

        /**
         * -------------------------------------------------
         * Caché
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
     * CÁLCULO CENTRALIZADO DE UMBRALES
     * =====================================================
     */

    private calculateThresholds(

        context: ResolverContext,

        executions: ReadonlyArray<any>

    ): ThresholdResult {

        /**
         * Si alguna regla ya ha producido
         * el resultado, se utiliza directamente.
         */

        for (

            const execution

            of executions

        ) {

            if (

                execution.valid &&

                execution.value !== undefined

            ) {

                return execution.value as ThresholdResult;

            }

        }

        const estimatedValue =

            Number(

                context.contract.estimatedValue

                ?? 0

            );

        return {

            estimatedValue,

            minorThreshold:

                this.rules.variable<number>(

                    "MINOR_THRESHOLD"

                ) ?? 15000,

            simplifiedShortThreshold:

                this.rules.variable<number>(

                    "SIMPLIFIED_SHORT_LIMIT"

                ) ?? 60000,

            simplifiedThreshold:

                this.rules.variable<number>(

                    "SIMPLIFIED_LIMIT"

                ) ?? 100000,

            doueThreshold:

                this.rules.variable<number>(

                    "DOUE_THRESHOLD"

                ) ?? 221000,

            appealThreshold:

                this.rules.variable<number>(

                    "SPECIAL_APPEAL_THRESHOLD"

                ) ?? 100000,

            publicationThreshold:

                this.rules.variable<number>(

                    "PUBLICATION_THRESHOLD"

                ) ?? 15000

        };

    }

    /**
     * =====================================================
     * CLASIFICACIÓN JURÍDICA
     * =====================================================
     */

    private classifyThresholds(

        result: ThresholdResult

    ): ThresholdResult {

        const value = result.estimatedValue;

        result.isMinor =

            value <= result.minorThreshold;

        result.isSimplifiedShort =

            value > result.minorThreshold &&
            value <= result.simplifiedShortThreshold;

        result.isSimplified =

            value > result.simplifiedShortThreshold &&
            value <= result.simplifiedThreshold;

        result.requiresDOUE =

            value >= result.doueThreshold;

        result.specialAppeal =

            value >= result.appealThreshold;

        result.requiresPublication =

            value >= result.publicationThreshold;

        return result;

    }

    /**
     * =====================================================
     * PROCEDIMIENTO RECOMENDADO
     * =====================================================
     */

    private assignRecommendedProcedure(

        result: ThresholdResult

    ): ThresholdResult {

        if (result.isMinor) {

            result.recommendedProcedure =
                "MINOR";

            return result;
        }

        if (result.isSimplifiedShort) {

            result.recommendedProcedure =
                "SIMPLIFIED_SHORT";

            return result;
        }

        if (result.isSimplified) {

            result.recommendedProcedure =
                "SIMPLIFIED";

            return result;
        }

        result.recommendedProcedure =
            "OPEN";

        return result;

    }

    /**
     * =====================================================
     * VALIDACIONES ESPECÍFICAS
     * =====================================================
     */

    private validateThresholds(

        context: ResolverContext,

        decision: ResolverDecision<ThresholdResult>

    ): void {

        const threshold = decision.value;

        if (

            threshold.estimatedValue < 0

        ) {

            decision.validation.errors.push(

                "El valor estimado no puede ser negativo."

            );

        }

        if (

            threshold.minorThreshold <= 0 ||

            threshold.simplifiedThreshold <= 0 ||

            threshold.doueThreshold <= 0

        ) {

            decision.validation.errors.push(

                "Los umbrales configurados no son válidos."

            );

        }

        if (

            threshold.minorThreshold >

            threshold.simplifiedThreshold

        ) {

            decision.validation.errors.push(

                "La jerarquía de umbrales es incorrecta."

            );

        }

        if (

            threshold.simplifiedThreshold >

            threshold.doueThreshold

        ) {

            decision.validation.warnings.push(

                "Revisar configuración de umbrales DOUE."

            );

        }

        decision.valid =

            decision.validation.errors.length === 0;

    }

    /**
     * =====================================================
     * CONSTRUCCIÓN DEL RAZONAMIENTO JURÍDICO
     * =====================================================
     */

    private buildReasoning(

        context: ResolverContext,

        decision: ResolverDecision<ThresholdResult>

    ): void {

        const threshold = decision.value;

        /**
         * --------------------------------------------
         * Relaciones del Knowledge Graph
         * --------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "ValorEstimado"

            );

        for (

            const relation

            of relations

        ) {

            decision.reasons.push({

                source: "KnowledgeGraph",

                description:

                    `${relation.from} ${relation.relation} ${relation.to}`

            });

        }

        /**
         * --------------------------------------------
         * Knowledge Packs relacionados
         * --------------------------------------------
         */

        const packs =

            this.knowledge.hybrid(

                `valor estimado ${threshold.estimatedValue}`

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
         * --------------------------------------------
         * Justificación específica
         * --------------------------------------------
         */

        if (

            threshold.isMinor

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "El valor estimado permite analizar la utilización del contrato menor."

            });

        }

        else if (

            threshold.isSimplifiedShort

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "El valor estimado permite utilizar el procedimiento abierto simplificado abreviado."

            });

        }

        else if (

            threshold.isSimplified

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "El valor estimado permite utilizar el procedimiento abierto simplificado."

            });

        }

        else {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "Debe acudirse al procedimiento abierto ordinario o al procedimiento especial que corresponda."

            });

        }

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
