/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureResolver
 * ------------------------------------------------------------
 * Resolver responsable de determinar el procedimiento
 * de adjudicación conforme a la LCSP.
 *
 * Esta versión sustituye completamente la implementación
 * anterior basada en KnowledgeRepository +
 * KnowledgeRuleProvider.
 *
 * ============================================================
 */

import { BaseResolver } from "../framework/BaseResolver";
import { ResolverContext } from "../framework/FrameworkTypes";
import { ResolverDecision } from "../framework/FrameworkTypes";

import { KnowledgeConnector } from "../framework/KnowledgeConnector";
import { DecisionFactory } from "../framework/DecisionFactory";
import { ValidationPipeline } from "../framework/ValidationPipeline";

import { AuditService } from "../framework/AuditService";
import { StatisticsService } from "../framework/StatisticsService";
import { DiagnosticService } from "../framework/DiagnosticService";

import { BaseCache } from "../framework/BaseCache";

import { RuleExecutor } from "../framework/RuleExecutor";

import {

    ProcedureType

} from "../types/ProcedureType";

import {

    ProcedureReason

} from "../types/ProcedureReason";

export class ProcedureResolver extends BaseResolver<ProcedureType> {

    /**
     * Caché local.
     */
    private readonly cache =

        new BaseCache<ResolverDecision<ProcedureType>>();

    constructor(

        private readonly knowledge: KnowledgeConnector,

        private readonly rules: RuleExecutor,

        private readonly audit: AuditService,

        private readonly statistics: StatisticsService,

        private readonly diagnostics: DiagnosticService

    ) {

        super(

            "ProcedureResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada.
     * =====================================================
     */

    public resolve(

        context: ResolverContext

    ): ResolverDecision<ProcedureType> {

        const cacheKey =

            JSON.stringify({

                value:

                    context.contract.estimatedValue,

                cpv:

                    context.contract.cpv,

                type:

                    context.contract.type

            });

        const cached =

            this.cache.get(

                cacheKey

            );

        if (cached) {

            return cached;

        }

        this.statistics.increment(

            "ProcedureResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio ProcedureResolver"

        );

        return this.execute(

            context,

            cacheKey

        );

    }

        /**
     * =====================================================
     * Ejecución interna.
     * =====================================================
     */

    private execute(

        context: ResolverContext,

        cacheKey: string

    ): ResolverDecision<ProcedureType> {

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

            "Reglas ejecutadas",

            executions

        );

        /**
         * -------------------------------------------------
         * 2. Buscar conocimiento asociado
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

        this.audit.log(

            "KNOWLEDGE",

            "Knowledge Packs recuperados",

            knowledge.map(

                k => k.pack.id

            )

        );

        /**
         * -------------------------------------------------
         * 3. Determinar procedimiento
         * -------------------------------------------------
         */

        const procedure =

            this.determineProcedure(

                context,

                executions

            );

        /**
         * -------------------------------------------------
         * 4. Construir decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                procedure,

                ProcedureReason.AUTOMATIC

            );

        /**
         * -------------------------------------------------
         * 5. Añadir justificación jurídica
         * -------------------------------------------------
         */

        for (

            const result

            of knowledge

        ) {

            decision.reasons.push({

                source:

                    result.pack.id,

                description:

                    result.reason

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

            "ProcedureResolver",

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
     * Determinación del procedimiento
     * =====================================================
     */

    private determineProcedure(

        context: ResolverContext,

        executions: ReadonlyArray<any>

    ): ProcedureType {

        /**
         * -------------------------------------------------
         * 1. Si alguna regla ya determina el procedimiento,
         *    se utiliza directamente.
         * -------------------------------------------------
         */

        for (const execution of executions) {

            if (

                execution.valid &&
                execution.value !== undefined

            ) {

                return execution.value as ProcedureType;

            }

        }

        /**
         * -------------------------------------------------
         * 2. Cálculo por valor estimado
         * -------------------------------------------------
         */

        const value = Number(

            context.contract.estimatedValue ?? 0

        );

        /**
         * Umbrales cargados desde RuleEngine
         */

        const minorThreshold =

            this.rules.variable<number>(

                "MINOR_THRESHOLD"

            ) ?? 15000;

        const simplifiedShortThreshold =

            this.rules.variable<number>(

                "SIMPLIFIED_SHORT_LIMIT"

            ) ?? 60000;

        const simplifiedThreshold =

            this.rules.variable<number>(

                "SIMPLIFIED_LIMIT"

            ) ?? 100000;

        /**
         * -------------------------------------------------
         * Contrato menor
         * -------------------------------------------------
         */

        if (

            value <= minorThreshold

        ) {

            return ProcedureType.MINOR;

        }

        /**
         * -------------------------------------------------
         * Abierto simplificado abreviado
         * -------------------------------------------------
         */

        if (

            value <= simplifiedShortThreshold

        ) {

            return ProcedureType.SIMPLIFIED_SHORT;

        }

        /**
         * -------------------------------------------------
         * Abierto simplificado
         * -------------------------------------------------
         */

        if (

            value <= simplifiedThreshold

        ) {

            return ProcedureType.SIMPLIFIED;

        }

        /**
         * -------------------------------------------------
         * Procedimientos especiales
         * -------------------------------------------------
         */

        if (

            context.flags?.competitiveDialogue

        ) {

            return ProcedureType.COMPETITIVE_DIALOGUE;

        }

        if (

            context.flags?.innovationPartnership

        ) {

            return ProcedureType.INNOVATION_PARTNERSHIP;

        }

        if (

            context.flags?.negotiated

        ) {

            return ProcedureType.NEGOTIATED;

        }

        if (

            context.flags?.restricted

        ) {

            return ProcedureType.RESTRICTED;

        }

        /**
         * -------------------------------------------------
         * Procedimiento por defecto
         * -------------------------------------------------
         */

        return ProcedureType.OPEN;

    }

        /**
     * =====================================================
     * Construcción del razonamiento jurídico.
     * =====================================================
     */

    private buildReasoning(

        context: ResolverContext,

        decision: ResolverDecision<ProcedureType>

    ): void {

        /**
         * ----------------------------------------------
         * Relaciones semánticas
         * ----------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "Procedimiento"

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
         * ----------------------------------------------
         * Packs relacionados
         * ----------------------------------------------
         */

        const packs =

            this.knowledge.semantic(

                "procedimiento adjudicación"

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

    }

    /**
     * =====================================================
     * Validaciones específicas.
     * =====================================================
     */

    private validateProcedure(

        context: ResolverContext,

        decision: ResolverDecision<ProcedureType>

    ): void {

        /**
         * Valor estimado obligatorio.
         */

        if (

            Number(

                context.contract.estimatedValue

            ) <= 0

        ) {

            decision.validation.errors.push(

                "Debe existir un valor estimado válido."

            );

        }

        /**
         * CPV obligatorio.
         */

        if (

            !context.contract.cpv ||

            context.contract.cpv.length === 0

        ) {

            decision.validation.errors.push(

                "Debe seleccionarse un código CPV."

            );

        }

        /**
         * Tipo contractual.
         */

        if (

            context.contract.type == null

        ) {

            decision.validation.errors.push(

                "Debe definirse el tipo contractual."

            );

        }

        /**
         * Si existen errores, la decisión deja de ser válida.
         */

        decision.valid =

            decision.validation.errors.length === 0;

    }

    /**
     * =====================================================
     * Diagnóstico.
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
