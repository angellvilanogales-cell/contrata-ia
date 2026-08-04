/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * DeadlinesResolver
 * ------------------------------------------------------------
 * Responsable de calcular automáticamente:
 *
 * • Plazos mínimos LCSP.
 * • Presentación de ofertas.
 * • Solicitudes de participación.
 * • Recursos.
 * • Adjudicación.
 * • Formalización.
 * • Cronograma completo.
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

import { PublicationResolver } from "./PublicationResolver";

import { CPVResolver } from "./CPVResolver";

import { KnowledgeConnector } from "../framework/KnowledgeConnector";

import { RuleExecutor } from "../framework/RuleExecutor";

import { DecisionFactory } from "../framework/DecisionFactory";

import { ValidationPipeline } from "../framework/ValidationPipeline";

import { AuditService } from "../framework/AuditService";

import { StatisticsService } from "../framework/StatisticsService";

import { DiagnosticService } from "../framework/DiagnosticService";

import { BaseCache } from "../framework/BaseCache";

import {

    DeadlinesResult

} from "../types/DeadlinesResult";

import {

    DeadlinesReason

} from "../types/DeadlinesReason";

export class DeadlinesResolver

extends BaseResolver<DeadlinesResult>{

    private readonly cache =

        new BaseCache<

            ResolverDecision<DeadlinesResult>

        >();

    constructor(

        private readonly thresholds:

            ThresholdResolver,

        private readonly procedures:

            ProcedureResolver,

        private readonly publication:

            PublicationResolver,

        private readonly cpv:

            CPVResolver,

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

            "DeadlinesResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada
     * =====================================================
     */

    public resolve(

        context: ResolverContext

    ): ResolverDecision<DeadlinesResult>{

        const cacheKey =

            JSON.stringify({

                procedure:

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

        if(cached){

            return cached;

        }

        this.statistics.increment(

            "DeadlinesResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio DeadlinesResolver"

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

    ): ResolverDecision<DeadlinesResult> {

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

        const publicationDecision =

            this.publication.resolve(

                context

            );

        const cpvDecision =

            this.cpv.resolve(

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

            "Reglas de plazos ejecutadas",

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

                    procedureDecision.value,

                    cpvDecision.value.semanticFamily,

                    "plazos",

                    "LCSP",

                    publicationDecision.value.doueRequired

                        ? "DOUE"

                        : "NACIONAL"

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
         * Calcular plazos
         * -------------------------------------------------
         */

        const deadlines =

            this.calculateDeadlines(

                context,

                thresholdDecision.value,

                procedureDecision.value,

                publicationDecision.value,

                cpvDecision.value,

                executions

            );

        /**
         * -------------------------------------------------
         * Construcción decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                deadlines,

                DeadlinesReason.AUTOMATIC

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

            "DeadlinesResolver",

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
     * CÁLCULO DE PLAZOS
     * =====================================================
     */

    private calculateDeadlines(

        context: ResolverContext,

        thresholds: any,

        procedure: any,

        publication: any,

        cpv: any,

        executions: ReadonlyArray<any>

    ): DeadlinesResult {

        /**
         * -------------------------------------------------
         * Si alguna regla jurídica ya devuelve
         * el resultado completo, se utiliza.
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

                return execution.value as DeadlinesResult;

            }

        }

        const result: DeadlinesResult = {

            offerSubmissionDays: 0,

            participationDays: 0,

            correctionDays: 3,

            evaluationDays: 10,

            awardDays: 5,

            formalizationDays: 15,

            appealDays: 15,

            executionStartDays: 0,

            timeline: []

        };

        /**
         * =================================================
         * PLAZO PRESENTACIÓN OFERTAS
         * =================================================
         */

        switch (

            procedure

        ) {

            case "MINOR":

                result.offerSubmissionDays = 0;

                break;

            case "SIMPLIFIED_SHORT":

                result.offerSubmissionDays = 10;

                break;

            case "SIMPLIFIED":

                result.offerSubmissionDays = 15;

                break;

            case "RESTRICTED":

                result.participationDays = 30;

                result.offerSubmissionDays = 30;

                break;

            default:

                result.offerSubmissionDays =

                    publication.doueRequired

                        ? 35

                        : 20;

        }

        /**
         * =================================================
         * FORMALIZACIÓN
         * =================================================
         */

        if (

            procedure === "MINOR"

        ) {

            result.formalizationDays = 0;

        }

        /**
         * =================================================
         * INICIO EJECUCIÓN
         * =================================================
         */

        result.executionStartDays =

            result.formalizationDays;

        /**
         * =================================================
         * CRONOGRAMA
         * =================================================
         */

        result.timeline.push(

            {

                phase:

                    "Publicación",

                days:

                    0

            },

            {

                phase:

                    "Presentación ofertas",

                days:

                    result.offerSubmissionDays

            },

            {

                phase:

                    "Subsanación",

                days:

                    result.correctionDays

            },

            {

                phase:

                    "Valoración",

                days:

                    result.evaluationDays

            },

            {

                phase:

                    "Adjudicación",

                days:

                    result.awardDays

            },

            {

                phase:

                    "Formalización",

                days:

                    result.formalizationDays

            },

            {

                phase:

                    "Inicio ejecución",

                days:

                    result.executionStartDays

            }

        );

        /**
         * =================================================
         * RECURSO ESPECIAL
         * =================================================
         */

        if (

            thresholds.specialAppeal

        ) {

            result.timeline.push(

                {

                    phase:

                        "Recurso especial",

                    days:

                        result.appealDays

                }

            );

        }

        return result;

    }

    /**
     * =====================================================
     * RAZONAMIENTO JURÍDICO
     * =====================================================
     */

    private buildReasoning(

        context: ResolverContext,

        decision: ResolverDecision<DeadlinesResult>

    ): void {

        const deadlines = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones del Knowledge Graph
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "Plazos"

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

                "plazos LCSP"

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
         * Justificación jurídica
         * ---------------------------------------------
         */

        decision.reasons.push({

            source:

                "LCSP",

            description:

                "Los plazos mínimos se han calculado automáticamente conforme al procedimiento, al régimen de publicidad y al valor estimado del contrato."

        });

        if (

            deadlines.appealDays > 0

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "Se incorpora el plazo correspondiente al recurso especial en materia de contratación."

            });

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validateDeadlines(

        decision: ResolverDecision<DeadlinesResult>

    ): void {

        const d = decision.value;

        if (

            d.offerSubmissionDays < 0

        ) {

            decision.validation.errors.push(

                "El plazo de presentación de ofertas no puede ser negativo."

            );

        }

        if (

            d.formalizationDays < 0

        ) {

            decision.validation.errors.push(

                "El plazo de formalización es inválido."

            );

        }

        if (

            d.timeline.length === 0

        ) {

            decision.validation.errors.push(

                "No se ha generado el cronograma del expediente."

            );

        }

        if (

            d.offerSubmissionDays === 0 &&

            d.timeline.length > 1

        ) {

            decision.validation.warnings.push(

                "Revisar el cronograma para contratos menores."

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
