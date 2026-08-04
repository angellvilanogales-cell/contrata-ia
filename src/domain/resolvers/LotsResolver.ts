/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * LotsResolver
 * ------------------------------------------------------------
 * Responsable de determinar:
 *
 * • División en lotes.
 * • Número de lotes.
 * • Lotes funcionales.
 * • Lotes territoriales.
 * • Limitaciones de adjudicación.
 * • Justificación jurídica.
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

import { AwardCriteriaResolver } from "./AwardCriteriaResolver";

import { PublicationResolver } from "./PublicationResolver";

import { DeadlinesResolver } from "./DeadlinesResolver";

import { KnowledgeConnector } from "../framework/KnowledgeConnector";

import { RuleExecutor } from "../framework/RuleExecutor";

import { DecisionFactory } from "../framework/DecisionFactory";

import { ValidationPipeline } from "../framework/ValidationPipeline";

import { AuditService } from "../framework/AuditService";

import { StatisticsService } from "../framework/StatisticsService";

import { DiagnosticService } from "../framework/DiagnosticService";

import { BaseCache } from "../framework/BaseCache";

import {

    LotsResult

} from "../types/LotsResult";

import {

    LotsReason

} from "../types/LotsReason";

export class LotsResolver

extends BaseResolver<LotsResult>{

    private readonly cache =

        new BaseCache<

            ResolverDecision<LotsResult>

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

        private readonly award:

            AwardCriteriaResolver,

        private readonly publication:

            PublicationResolver,

        private readonly deadlines:

            DeadlinesResolver,

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

            "LotsResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada
     * =====================================================
     */

    public resolve(

        context: ResolverContext

    ): ResolverDecision<LotsResult>{

        const cacheKey =

            JSON.stringify({

                cpv:

                    context.contract.cpv,

                value:

                    context.contract.estimatedValue,

                type:

                    context.contract.type

            });

        const cached =

            this.cache.get(

                cacheKey

            );

        if(cached){

            return cached;

        }

        this.statistics.increment(

            "LotsResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio LotsResolver"

        );

        return this.execute(

            context,

            cacheKey

        );

    }

    /**
     * =====================================================
     * EJECUCIÓN
     * =====================================================
     */

    private execute(

        context: ResolverContext,

        cacheKey: string

    ): ResolverDecision<LotsResult> {

        /**
         * -------------------------------------------------
         * Resolver dependencias
         * -------------------------------------------------
         */

        const thresholdDecision =

            this.thresholds.resolve(

                context

            );

        const procedureDecision =

            this.procedures.resolve(

                context

            );

        const cpvDecision =

            this.cpv.resolve(

                context

            );

        const solvencyDecision =

            this.solvency.resolve(

                context

            );

        const awardDecision =

            this.award.resolve(

                context

            );

        const publicationDecision =

            this.publication.resolve(

                context

            );

        const deadlinesDecision =

            this.deadlines.resolve(

                context

            );

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

            "Reglas de división en lotes ejecutadas",

            executions

        );

        /**
         * -------------------------------------------------
         * Recuperar conocimiento
         * -------------------------------------------------
         */

        const knowledge =

            this.knowledge.hybrid(

                [

                    cpvDecision.value.principal,

                    cpvDecision.value.semanticFamily,

                    procedureDecision.value,

                    "division lotes",

                    "LCSP"

                ].join(" ")

            );

        this.audit.log(

            "KNOWLEDGE",

            "Knowledge Packs recuperados",

            knowledge.map(

                k => k.pack.id

            )

        );

        /**
         * -------------------------------------------------
         * Calcular división en lotes
         * -------------------------------------------------
         */

        const lots =

            this.calculateLots(

                context,

                thresholdDecision.value,

                procedureDecision.value,

                cpvDecision.value,

                solvencyDecision.value,

                awardDecision.value,

                publicationDecision.value,

                deadlinesDecision.value,

                executions

            );

        /**
         * -------------------------------------------------
         * Construcción decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                lots,

                LotsReason.AUTOMATIC

            );

        /**
         * -------------------------------------------------
         * Añadir justificación jurídica
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

            "LotsResolver",

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
     * CÁLCULO DE LOTES
     * =====================================================
     */

    private calculateLots(

        context: ResolverContext,

        thresholds: any,

        procedure: any,

        cpv: any,

        solvency: any,

        award: any,

        publication: any,

        deadlines: any,

        executions: ReadonlyArray<any>

    ): LotsResult {

        /**
         * -------------------------------------------------
         * Si alguna regla jurídica devuelve el resultado
         * completo, se utiliza directamente.
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

                return execution.value as LotsResult;

            }

        }

        const estimatedValue = Number(

            context.contract.estimatedValue ?? 0

        );

        const result: LotsResult = {

            divideIntoLots: false,

            justification: "",

            lotType: "NONE",

            lots: [],

            maximumLotsPerTenderer: undefined,

            maximumLotsAwarded: undefined,

            allowMultipleOffers: true,

            allowCombinedAwards: true

        };

        /**
         * =================================================
         * ¿PROCEDE DIVISIÓN EN LOTES?
         * =================================================
         */

        const shouldDivide =

            estimatedValue >= 150000 ||

            cpv.semanticFamily === "SERVICIOS" ||

            cpv.semanticFamily === "SUMINISTROS";

        result.divideIntoLots = shouldDivide;

        /**
         * =================================================
         * TIPO DE LOTES
         * =================================================
         */

        if (!shouldDivide) {

            result.justification =

                "No procede la división en lotes por tratarse de una prestación única cuya fragmentación dificultaría su correcta ejecución.";

            return result;

        }

        if (

            cpv.semanticFamily === "SERVICIOS"

        ) {

            result.lotType =

                "FUNCTIONAL";

        }

        else if (

            cpv.semanticFamily === "SUMINISTROS"

        ) {

            result.lotType =

                "PRODUCT";

        }

        else if (

            cpv.semanticFamily === "OBRAS"

        ) {

            result.lotType =

                "GEOGRAPHIC";

        }

        /**
         * =================================================
         * GENERACIÓN AUTOMÁTICA DE LOTES
         * =================================================
         */

        const numberOfLots =

            Math.min(

                Math.max(

                    Math.ceil(

                        estimatedValue / 250000

                    ),

                    2

                ),

                8

            );

        for (

            let i = 1;

            i <= numberOfLots;

            i++

        ) {

            result.lots.push({

                id: `LOT-${i}`,

                name: `Lote ${i}`,

                description:

                    `Prestación correspondiente al lote ${i}.`

            });

        }

        /**
         * =================================================
         * LIMITACIONES
         * =================================================
         */

        result.maximumLotsPerTenderer =

            Math.min(

                3,

                numberOfLots

            );

        result.maximumLotsAwarded =

            numberOfLots;

        /**
         * =================================================
         * OFERTAS
         * =================================================
         */

        result.allowMultipleOffers =

            true;

        result.allowCombinedAwards =

            numberOfLots > 1;

        /**
         * =================================================
         * JUSTIFICACIÓN
         * =================================================
         */

        result.justification =

            "La división en lotes favorece la concurrencia, facilita el acceso de las PYMES y mejora la competencia efectiva sin comprometer la correcta ejecución del contrato.";

        return result;

    }

    /**
     * =====================================================
     * RAZONAMIENTO JURÍDICO
     * =====================================================
     */

    private buildReasoning(

        context: ResolverContext,

        decision: ResolverDecision<LotsResult>

    ): void {

        const lots = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones del Knowledge Graph
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "DivisionLotes"

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
         * Knowledge Packs
         * ---------------------------------------------
         */

        const packs =

            this.knowledge.hybrid(

                "division lotes"

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
         * Justificación jurídica específica
         * ---------------------------------------------
         */

        if (

            lots.divideIntoLots

        ) {

            decision.reasons.push({

                source:

                    "LCSP art.99",

                description:

                    "La división en lotes favorece la libre concurrencia y el acceso de las pequeñas y medianas empresas."

            });

        }

        else {

            decision.reasons.push({

                source:

                    "LCSP art.99",

                description:

                    lots.justification

            });

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validateLots(

        decision: ResolverDecision<LotsResult>

    ): void {

        const lots = decision.value;

        if (

            lots.divideIntoLots &&

            lots.lots.length === 0

        ) {

            decision.validation.errors.push(

                "Se indica división en lotes pero no se han generado lotes."

            );

        }

        if (

            !lots.divideIntoLots &&

            lots.justification.trim() === ""

        ) {

            decision.validation.errors.push(

                "Debe justificarse expresamente la no división en lotes."

            );

        }

        if (

            lots.maximumLotsPerTenderer !== undefined &&

            lots.maximumLotsAwarded !== undefined &&

            lots.maximumLotsPerTenderer >

            lots.maximumLotsAwarded

        ) {

            decision.validation.errors.push(

                "La limitación de lotes por licitador no puede superar el número máximo adjudicable."

            );

        }

        if (

            lots.lotType === "NONE" &&

            lots.divideIntoLots

        ) {

            decision.validation.warnings.push(

                "No se ha identificado correctamente el tipo de división."

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
