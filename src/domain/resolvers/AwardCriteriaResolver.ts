/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * AwardCriteriaResolver
 * ------------------------------------------------------------
 * Genera automáticamente:
 *
 * • Criterios de adjudicación.
 * • Ponderaciones.
 * • Fórmulas.
 * • Juicios de valor.
 * • Criterios automáticos.
 * • Desempates.
 * • Ofertas anormalmente bajas.
 *
 * ============================================================
 */

import { BaseResolver } from "../framework/BaseResolver";

import {

    ResolverContext,
    ResolverDecision

} from "../framework/FrameworkTypes";

import { ThresholdResolver } from "./ThresholdResolver";

import { ProcedureResolver } from "./ProcedureResolver";

import { CPVResolver } from "./CPVResolver";

import { SolvencyResolver } from "./SolvencyResolver";

import { KnowledgeConnector } from "../framework/KnowledgeConnector";

import { RuleExecutor } from "../framework/RuleExecutor";

import { DecisionFactory } from "../framework/DecisionFactory";

import { ValidationPipeline } from "../framework/ValidationPipeline";

import { AuditService } from "../framework/AuditService";

import { StatisticsService } from "../framework/StatisticsService";

import { DiagnosticService } from "../framework/DiagnosticService";

import { BaseCache } from "../framework/BaseCache";

import {

    AwardCriteriaResult

} from "../types/AwardCriteriaResult";

import {

    AwardCriteriaReason

} from "../types/AwardCriteriaReason";

export class AwardCriteriaResolver

extends BaseResolver<AwardCriteriaResult>{

    private readonly cache=

        new BaseCache<

            ResolverDecision<AwardCriteriaResult>

        >();

    constructor(

        private readonly thresholds:

            ThresholdResolver,

        private readonly procedures:

            ProcedureResolver,

        private readonly cpv:

            CPVResolver,

        private readonly solvency:

            SolvencyResolver,

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

            "AwardCriteriaResolver"

        );

    }

    /**
     * =====================================================
     * Entrada
     * =====================================================
     */

    public resolve(

        context:ResolverContext

    ):ResolverDecision<AwardCriteriaResult>{

        const cacheKey=

            JSON.stringify({

                cpv:

                    context.contract.cpv,

                value:

                    context.contract.estimatedValue,

                procedure:

                    context.contract.type

            });

        const cached=

            this.cache.get(

                cacheKey

            );

        if(cached){

            return cached;

        }

        this.statistics.increment(

            "AwardCriteriaResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio AwardCriteriaResolver"

        );

        return this.execute(

            context,

            cacheKey

        );

    }

    /**
     * =====================================================
     * CÁLCULO DE CRITERIOS
     * =====================================================
     */

    private calculateCriteria(

        context: ResolverContext,

        thresholds: any,

        procedure: any,

        cpv: any,

        solvency: any,

        executions: ReadonlyArray<any>

    ): AwardCriteriaResult {

        /**
         * -------------------------------------------------
         * Si alguna regla ya devuelve el resultado
         * completo se utiliza directamente.
         * -------------------------------------------------
         */

        for (const execution of executions) {

            if (

                execution.valid &&
                execution.value !== undefined

            ) {

                return execution.value as AwardCriteriaResult;

            }

        }

        const result: AwardCriteriaResult = {

            automaticCriteria: [],

            judgementCriteria: [],

            socialCriteria: [],

            environmentalCriteria: [],

            innovationCriteria: [],

            tieBreakCriteria: [],

            abnormalOfferRule: "",

            totalAutomaticWeight: 0,

            totalJudgementWeight: 0

        };

        /**
         * =================================================
         * PRECIO
         * =================================================
         */

        result.automaticCriteria.push({

            id: "PRICE",

            name: "Oferta económica",

            weight: 40,

            formula: "PRICE_LINEAR"

        });

        result.totalAutomaticWeight += 40;

        /**
         * =================================================
         * CALIDAD
         * =================================================
         */

        result.judgementCriteria.push({

            id: "QUALITY",

            name: "Calidad técnica",

            weight: 25

        });

        result.totalJudgementWeight += 25;

        /**
         * =================================================
         * SERVICIOS
         * =================================================
         */

        if (

            cpv.semanticFamily === "SERVICIOS"

        ) {

            result.judgementCriteria.push({

                id: "METHODOLOGY",

                name: "Metodología",

                weight: 20

            });

            result.totalJudgementWeight += 20;

        }

        /**
         * =================================================
         * OBRAS
         * =================================================
         */

        if (

            cpv.semanticFamily === "OBRAS"

        ) {

            result.judgementCriteria.push({

                id: "WORK_PLAN",

                name: "Programa de trabajo",

                weight: 20

            });

            result.totalJudgementWeight += 20;

        }

        /**
         * =================================================
         * SUMINISTROS
         * =================================================
         */

        if (

            cpv.semanticFamily === "SUMINISTROS"

        ) {

            result.automaticCriteria.push({

                id: "DELIVERY",

                name: "Plazo de entrega",

                weight: 15,

                formula: "DELIVERY_FORMULA"

            });

            result.totalAutomaticWeight += 15;

        }

        /**
         * =================================================
         * CRITERIOS SOCIALES
         * =================================================
         */

        result.socialCriteria.push({

            id: "SOCIAL",

            name: "Mejoras sociales",

            weight: 5

        });

        /**
         * =================================================
         * CRITERIOS AMBIENTALES
         * =================================================
         */

        result.environmentalCriteria.push({

            id: "ENVIRONMENT",

            name: "Mejoras ambientales",

            weight: 5

        });

        /**
         * =================================================
         * INNOVACIÓN
         * =================================================
         */

        if (

            cpv.semanticTags.includes(

                "ICT"

            )

        ) {

            result.innovationCriteria.push({

                id: "INNOVATION",

                name: "Innovación tecnológica",

                weight: 5

            });

        }

        /**
         * =================================================
         * DESEMPATE
         * =================================================
         */

        result.tieBreakCriteria.push(

            "EMPRESA_INSERCION",

            "DISCAPACIDAD",

            "IGUALDAD"

        );

        /**
         * =================================================
         * OFERTAS ANORMALMENTE BAJAS
         * =================================================
         */

        result.abnormalOfferRule =

            "LCSP_DEFAULT";

        return result;

    }

    /**
     * =====================================================
     * CONSTRUCCIÓN DEL RAZONAMIENTO JURÍDICO
     * =====================================================
     */

    private buildReasoning(

        context: ResolverContext,

        decision: ResolverDecision<AwardCriteriaResult>

    ): void {

        const criteria = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones del Knowledge Graph
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "CriteriosAdjudicacion"

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
         * ---------------------------------------------
         * Knowledge Packs
         * ---------------------------------------------
         */

        const packs =

            this.knowledge.hybrid(

                "criterios adjudicación"

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

        decision.reasons.push({

            source: "LCSP",

            description:

                "Los criterios se han configurado respetando los principios de vinculación al objeto del contrato, proporcionalidad y mejor relación calidad-precio."

        });

        if (

            criteria.socialCriteria.length > 0

        ) {

            decision.reasons.push({

                source: "LCSP",

                description:

                    "Se incorporan criterios sociales vinculados al objeto contractual."

            });

        }

        if (

            criteria.environmentalCriteria.length > 0

        ) {

            decision.reasons.push({

                source: "LCSP",

                description:

                    "Se incorporan criterios medioambientales vinculados al objeto contractual."

            });

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validateCriteria(

        decision: ResolverDecision<AwardCriteriaResult>

    ): void {

        const criteria = decision.value;

        const total =

            criteria.totalAutomaticWeight +

            criteria.totalJudgementWeight;

        if (

            total > 100

        ) {

            decision.validation.errors.push(

                "La suma de ponderaciones supera el 100%."

            );

        }

        if (

            total < 100

        ) {

            decision.validation.warnings.push(

                "Las ponderaciones no alcanzan el 100%; deberán completarse antes de aprobar el expediente."

            );

        }

        if (

            criteria.automaticCriteria.length === 0

        ) {

            decision.validation.errors.push(

                "Debe existir al menos un criterio automático."

            );

        }

        if (

            criteria.abnormalOfferRule === ""

        ) {

            decision.validation.warnings.push(

                "No se ha configurado una regla para ofertas anormalmente bajas."

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
