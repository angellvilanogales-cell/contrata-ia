/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * PublicationResolver
 * ------------------------------------------------------------
 * Responsable de determinar:
 *
 * • Publicidad obligatoria.
 * • DOUE.
 * • TED.
 * • Perfil del Contratante.
 * • Plataforma de Contratación.
 * • Transparencia.
 * • Publicidad adicional.
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

import { KnowledgeConnector } from "../framework/KnowledgeConnector";

import { RuleExecutor } from "../framework/RuleExecutor";

import { DecisionFactory } from "../framework/DecisionFactory";

import { ValidationPipeline } from "../framework/ValidationPipeline";

import { AuditService } from "../framework/AuditService";

import { StatisticsService } from "../framework/StatisticsService";

import { DiagnosticService } from "../framework/DiagnosticService";

import { BaseCache } from "../framework/BaseCache";

import {

    PublicationResult

} from "../types/PublicationResult";

import {

    PublicationReason

} from "../types/PublicationReason";

export class PublicationResolver

extends BaseResolver<PublicationResult>{

    /**
     * Caché.
     */

    private readonly cache =

        new BaseCache<

            ResolverDecision<PublicationResult>

        >();

    constructor(

        private readonly thresholds:

            ThresholdResolver,

        private readonly procedures:

            ProcedureResolver,

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

            "PublicationResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada
     * =====================================================
     */

    public resolve(

        context: ResolverContext

    ): ResolverDecision<PublicationResult>{

        const cacheKey =

            JSON.stringify({

                value:

                    context.contract.estimatedValue,

                procedure:

                    context.contract.type,

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

            "PublicationResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio PublicationResolver"

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

    ): ResolverDecision<PublicationResult> {

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

            "Reglas de publicidad ejecutadas",

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

                    "publicidad",

                    "DOUE",

                    "PLACSP"

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
         * Calcular obligaciones de publicidad
         * -------------------------------------------------
         */

        const publication =

            this.calculatePublication(

                context,

                thresholdDecision.value,

                procedureDecision.value,

                cpvDecision.value,

                executions

            );

        /**
         * -------------------------------------------------
         * Crear decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                publication,

                PublicationReason.AUTOMATIC

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

            "PublicationResolver",

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
     * CÁLCULO DE PUBLICIDAD
     * =====================================================
     */

    private calculatePublication(

        context: ResolverContext,

        thresholds: any,

        procedure: any,

        cpv: any,

        executions: ReadonlyArray<any>

    ): PublicationResult {

        /**
         * -------------------------------------------------
         * Si alguna regla devuelve el resultado completo,
         * se utiliza directamente.
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

                return execution.value as PublicationResult;

            }

        }

        const result: PublicationResult = {

            profileRequired: true,

            placspRequired: true,

            doueRequired: false,

            tedRequired: false,

            transparencyPortalRequired: true,

            electronicTenderRequired: true,

            additionalPublication: [],

            mandatoryDocuments: []

        };

        /**
         * =================================================
         * DOUE / TED
         * =================================================
         */

        if (

            thresholds.requiresDOUE

        ) {

            result.doueRequired = true;

            result.tedRequired = true;

        }

        /**
         * =================================================
         * PERFIL DEL CONTRATANTE
         * =================================================
         */

        result.profileRequired =

            true;

        /**
         * =================================================
         * PLACSP
         * =================================================
         */

        result.placspRequired =

            true;

        /**
         * =================================================
         * PORTAL TRANSPARENCIA
         * =================================================
         */

        result.transparencyPortalRequired =

            true;

        /**
         * =================================================
         * LICITACIÓN ELECTRÓNICA
         * =================================================
         */

        result.electronicTenderRequired =

            procedure !== "MINOR";

        /**
         * =================================================
         * DOCUMENTOS OBLIGATORIOS
         * =================================================
         */

        result.mandatoryDocuments.push(

            "Memoria justificativa",

            "Informe de insuficiencia de medios",

            "PCAP",

            "PPT",

            "Informe de necesidad",

            "Resolución aprobación expediente"

        );

        /**
         * =================================================
         * PUBLICIDAD ADICIONAL
         * =================================================
         */

        if (

            cpv.semanticFamily === "OBRAS"

        ) {

            result.additionalPublication.push(

                "Diario Oficial correspondiente"

            );

        }

        if (

            cpv.semanticTags.includes(

                "ICT"

            )

        ) {

            result.additionalPublication.push(

                "Portal de reutilización tecnológica"

            );

        }

        if (

            cpv.semanticTags.includes(

                "TRAINING"

            )

        ) {

            result.additionalPublication.push(

                "Portal institucional de formación"

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

        decision: ResolverDecision<PublicationResult>

    ): void {

        const publication = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones del Knowledge Graph
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "Publicidad"

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

                "publicidad licitación"

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

                "LCSP",

            description:

                "Las obligaciones de publicidad se han determinado conforme al procedimiento, valor estimado y naturaleza del contrato."

        });

        if (

            publication.doueRequired

        ) {

            decision.reasons.push({

                source:

                    "DOUE",

                description:

                    "La licitación debe remitirse al Diario Oficial de la Unión Europea."

            });

        }

        if (

            publication.placspRequired

        ) {

            decision.reasons.push({

                source:

                    "PLACSP",

                description:

                    "La publicación en la Plataforma de Contratación del Sector Público es obligatoria."

            });

        }

        if (

            publication.profileRequired

        ) {

            decision.reasons.push({

                source:

                    "PerfilContratante",

                description:

                    "Debe publicarse en el Perfil del Contratante."

            });

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validatePublication(

        decision: ResolverDecision<PublicationResult>

    ): void {

        const publication =

            decision.value;

        if (

            publication.doueRequired &&

            !publication.tedRequired

        ) {

            decision.validation.errors.push(

                "Toda publicación en DOUE debe enviarse también a TED."

            );

        }

        if (

            publication.mandatoryDocuments.length === 0

        ) {

            decision.validation.errors.push(

                "Debe existir al menos un documento obligatorio para publicar."

            );

        }

        if (

            !publication.profileRequired

        ) {

            decision.validation.warnings.push(

                "El Perfil del Contratante normalmente resulta obligatorio."

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
