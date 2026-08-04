/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * CPVResolver
 * ------------------------------------------------------------
 * Clasificador oficial CPV.
 *
 * Responsable de:
 *
 * • Determinar CPV principal.
 * • Determinar CPV secundarios.
 * • Clasificación semántica.
 * • Activación de reglas jurídicas.
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

    CPVResult

} from "../types/CPVResult";

import {

    CPVReason

} from "../types/CPVReason";

export class CPVResolver

extends BaseResolver<CPVResult>{

    /**
     * Caché local.
     */

    private readonly cache=

        new BaseCache<

            ResolverDecision<CPVResult>

        >();

    constructor(

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

            "CPVResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada
     * =====================================================
     */

    public resolve(

        context:ResolverContext

    ):ResolverDecision<CPVResult>{

        const cacheKey=

            JSON.stringify({

                object:

                    context.contract.object,

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

            "CPVResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio CPVResolver"

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

    ): ResolverDecision<CPVResult> {

        /**
         * -------------------------------------------------
         * 1. Ejecutar reglas jurídicas
         * -------------------------------------------------
         */

        const executions =

            this.rules.execute(

                context

            );

        this.audit.log(

            "RULE_ENGINE",

            "Reglas CPV ejecutadas",

            executions

        );

        /**
         * -------------------------------------------------
         * 2. Recuperar conocimiento semántico
         * -------------------------------------------------
         */

        const objectDescription =

            context.contract.object ??
            "";

        const knowledge =

            this.knowledge.hybrid(

                objectDescription

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
         * 3. Clasificar CPV
         * -------------------------------------------------
         */

        const cpvResult =

            this.calculateCPV(

                context,

                executions,

                knowledge

            );

        /**
         * -------------------------------------------------
         * 4. Construcción decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                cpvResult,

                CPVReason.AUTOMATIC

            );

        /**
         * -------------------------------------------------
         * 5. Justificación jurídica
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
         * 6. Validación
         * -------------------------------------------------
         */

        ValidationPipeline.validate(

            decision,

            context

        );

        /**
         * -------------------------------------------------
         * 7. Auditoría
         * -------------------------------------------------
         */

        this.audit.decision(

            decision

        );

        /**
         * -------------------------------------------------
         * 8. Estadísticas
         * -------------------------------------------------
         */

        this.statistics.increment(

            "CPVResolver",

            "resolved"

        );

        /**
         * -------------------------------------------------
         * 9. Caché
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
     * CÁLCULO DEL CPV
     * =====================================================
     */

    private calculateCPV(

        context: ResolverContext,

        executions: ReadonlyArray<any>,

        knowledge: ReadonlyArray<any>

    ): CPVResult {

        /**
         * -------------------------------------------------
         * 1. Si una regla ya determina el CPV,
         *    se utiliza directamente.
         * -------------------------------------------------
         */

        for (const execution of executions) {

            if (

                execution.valid &&
                execution.value !== undefined

            ) {

                return execution.value as CPVResult;

            }

        }

        /**
         * -------------------------------------------------
         * 2. Clasificación semántica del objeto
         * -------------------------------------------------
         */

        const objectText = (

            context.contract.object ?? ""

        ).toLowerCase();

        /**
         * -------------------------------------------------
         * Resultado inicial
         * -------------------------------------------------
         */

        const result: CPVResult = {

            principal: "",

            secondary: [],

            confidence: 0,

            semanticFamily: "",

            semanticCategory: "",

            semanticTags: [],

            activatedRules: []

        };

        /**
         * -------------------------------------------------
         * 3. Buscar el pack con mayor confianza
         * -------------------------------------------------
         */

        let bestScore = -1;

        for (const item of knowledge) {

            const score = item.score ?? 0;

            if (score > bestScore) {

                bestScore = score;

                result.principal =

                    item.pack.metadata?.cpv ??

                    item.pack.metadata?.principalCPV ??

                    "";

                result.semanticFamily =

                    item.pack.metadata?.family ??

                    "";

                result.semanticCategory =

                    item.pack.metadata?.category ??

                    "";

                result.semanticTags =

                    item.pack.metadata?.tags ??

                    [];

                result.confidence = score;

            }

        }

        /**
         * -------------------------------------------------
         * 4. Obtener CPV secundarios
         * -------------------------------------------------
         */

        for (const item of knowledge) {

            const cpv =

                item.pack.metadata?.cpv;

            if (

                cpv &&
                cpv !== result.principal &&
                !result.secondary.includes(cpv)

            ) {

                result.secondary.push(cpv);

            }

        }

        /**
         * -------------------------------------------------
         * 5. Activar reglas por familia
         * -------------------------------------------------
         */

        switch (

            result.semanticFamily

        ) {

            case "SERVICIOS":

                result.activatedRules.push(

                    "SERVICES_RULESET"

                );

                break;

            case "SUMINISTROS":

                result.activatedRules.push(

                    "SUPPLY_RULESET"

                );

                break;

            case "OBRAS":

                result.activatedRules.push(

                    "WORKS_RULESET"

                );

                break;

            case "MIXTO":

                result.activatedRules.push(

                    "MIXED_RULESET"

                );

                break;

            default:

                result.activatedRules.push(

                    "GENERAL_RULESET"

                );

        }

        /**
         * -------------------------------------------------
         * 6. Ajustes mediante análisis semántico
         * -------------------------------------------------
         */

        if (

            objectText.includes("formación") ||

            objectText.includes("curso")

        ) {

            result.semanticTags.push(

                "TRAINING"

            );

        }

        if (

            objectText.includes("software") ||

            objectText.includes("licencia")

        ) {

            result.semanticTags.push(

                "ICT"

            );

        }

        if (

            objectText.includes("obra")

        ) {

            result.semanticTags.push(

                "WORK"

            );

        }

        return result;

    }

    /**
     * =====================================================
     * CONSTRUCCIÓN DEL RAZONAMIENTO JURÍDICO
     * =====================================================
     */

    private buildReasoning(

        context: ResolverContext,

        decision: ResolverDecision<CPVResult>

    ): void {

        const cpv = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones del Knowledge Graph
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                cpv.principal

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
         * Packs relacionados
         * ---------------------------------------------
         */

        const packs =

            this.knowledge.hybrid(

                cpv.principal

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

            source:

                "CPV",

            description:

                `Código principal seleccionado: ${cpv.principal}`

        });

        if (

            cpv.secondary.length > 0

        ) {

            decision.reasons.push({

                source:

                    "CPV",

                description:

                    `CPV secundarios: ${cpv.secondary.join(", ")}`

            });

        }

        decision.reasons.push({

            source:

                "SEMANTIC",

            description:

                `Familia semántica: ${cpv.semanticFamily}`

        });

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validateCPV(

        decision: ResolverDecision<CPVResult>

    ): void {

        const cpv = decision.value;

        if (

            !cpv.principal ||

            cpv.principal.trim() === ""

        ) {

            decision.validation.errors.push(

                "No se ha podido determinar un CPV principal."

            );

        }

        if (

            cpv.confidence < 0.50

        ) {

            decision.validation.warnings.push(

                "La confianza de la clasificación CPV es baja. Se recomienda revisión manual."

            );

        }

        if (

            cpv.semanticFamily === ""

        ) {

            decision.validation.warnings.push(

                "No se ha identificado una familia semántica."

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
