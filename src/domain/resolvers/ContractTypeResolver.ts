/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ContractTypeResolver
 * ------------------------------------------------------------
 * Clasificación jurídica definitiva del expediente.
 *
 * Responsable de determinar:
 *
 * • Tipo de contrato.
 * • Contrato mixto.
 * • Prestación principal.
 * • Régimen jurídico.
 * • Contrato armonizado.
 * • Negocios excluidos.
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
import { LotsResolver } from "./LotsResolver";

import { KnowledgeConnector } from "../framework/KnowledgeConnector";
import { RuleExecutor } from "../framework/RuleExecutor";
import { DecisionFactory } from "../framework/DecisionFactory";
import { ValidationPipeline } from "../framework/ValidationPipeline";
import { AuditService } from "../framework/AuditService";
import { StatisticsService } from "../framework/StatisticsService";
import { DiagnosticService } from "../framework/DiagnosticService";
import { BaseCache } from "../framework/BaseCache";

import {

    ContractTypeResult

} from "../types/ContractTypeResult";

import {

    ContractTypeReason

} from "../types/ContractTypeReason";

export class ContractTypeResolver

extends BaseResolver<ContractTypeResult>{

    private readonly cache =

        new BaseCache<

            ResolverDecision<ContractTypeResult>

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

        private readonly lots:

            LotsResolver,

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

            "ContractTypeResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada
     * =====================================================
     */

    public resolve(

        context: ResolverContext

    ): ResolverDecision<ContractTypeResult>{

        const cacheKey =

            JSON.stringify({

                cpv:

                    context.contract.cpv,

                object:

                    context.contract.object,

                value:

                    context.contract.estimatedValue

            });

        const cached =

            this.cache.get(

                cacheKey

            );

        if(cached){

            return cached;

        }

        this.statistics.increment(

            "ContractTypeResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio ContractTypeResolver"

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

    ): ResolverDecision<ContractTypeResult> {

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

        const lotsDecision =

            this.lots.resolve(

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

            "Reglas de clasificación contractual ejecutadas",

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

                    context.contract.object,

                    "tipo contrato",

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
         * Clasificar contrato
         * -------------------------------------------------
         */

        const contract =

            this.calculateContractType(

                context,

                thresholdDecision.value,

                procedureDecision.value,

                cpvDecision.value,

                solvencyDecision.value,

                awardDecision.value,

                publicationDecision.value,

                deadlinesDecision.value,

                lotsDecision.value,

                executions

            );

        /**
         * -------------------------------------------------
         * Crear decisión
         * -------------------------------------------------
         */

        const decision =

            DecisionFactory.success(

                contract,

                ContractTypeReason.AUTOMATIC

            );

        /**
         * -------------------------------------------------
         * Incorporar razonamiento
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

            "ContractTypeResolver",

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
     * CLASIFICACIÓN JURÍDICA DEL CONTRATO
     * =====================================================
     */

    private calculateContractType(

        context: ResolverContext,

        thresholds: any,

        procedure: any,

        cpv: any,

        solvency: any,

        award: any,

        publication: any,

        deadlines: any,

        lots: any,

        executions: ReadonlyArray<any>

    ): ContractTypeResult {

        /**
         * -------------------------------------------------
         * Si alguna regla devuelve la clasificación
         * completa se utiliza directamente.
         * -------------------------------------------------
         */

        for (const execution of executions) {

            if (

                execution.valid &&
                execution.value !== undefined

            ) {

                return execution.value as ContractTypeResult;

            }

        }

        const objectText = (

            context.contract.object ?? ""

        ).toLowerCase();

        const result: ContractTypeResult = {

            contractType: "SERVICES",

            mixedContract: false,

            mainPerformance: "",

            sara: publication.doueRequired,

            excludedBusiness: false,

            legalRegime: "LCSP",

            applicableBooks: [],

            applicableArticles: [],

            observations: []

        };

        /**
         * =================================================
         * DETERMINAR TIPO DE CONTRATO
         * =================================================
         */

        switch (

            cpv.semanticFamily

        ) {

            case "OBRAS":

                result.contractType = "WORKS";

                result.mainPerformance =

                    "Obras";

                break;

            case "SUMINISTROS":

                result.contractType = "SUPPLIES";

                result.mainPerformance =

                    "Suministros";

                break;

            case "SERVICIOS":

                result.contractType = "SERVICES";

                result.mainPerformance =

                    "Servicios";

                break;

            default:

                result.contractType =

                    "SERVICES";

                result.mainPerformance =

                    "Servicios";

        }

        /**
         * =================================================
         * CONTRATO MIXTO
         * =================================================
         */

        if (

            objectText.includes("suministro")

            &&

            objectText.includes("instalación")

        ) {

            result.mixedContract = true;

            result.observations.push(

                "Contrato mixto detectado."

            );

        }

        if (

            objectText.includes("obra")

            &&

            objectText.includes("mantenimiento")

        ) {

            result.mixedContract = true;

            result.observations.push(

                "Prestaciones mixtas de obras y servicios."

            );

        }

        /**
         * =================================================
         * NEGOCIOS EXCLUIDOS
         * =================================================
         */

        const excludedWords = [

            "convenio",

            "subvención",

            "encomienda",

            "encargo a medio propio"

        ];

        for (

            const word

            of excludedWords

        ) {

            if (

                objectText.includes(

                    word

                )

            ) {

                result.excludedBusiness = true;

                result.legalRegime =

                    "NEGOCIO_EXCLUIDO";

                result.observations.push(

                    `Posible negocio excluido: ${word}`

                );

            }

        }

        /**
         * =================================================
         * CONTRATO SARA
         * =================================================
         */

        result.sara =

            publication.doueRequired;

        /**
         * =================================================
         * LIBROS LCSP APLICABLES
         * =================================================
         */

        result.applicableBooks.push(

            "Libro I",

            "Libro II"

        );

        if (

            result.contractType === "WORKS"

        ) {

            result.applicableBooks.push(

                "Libro III"

            );

        }

        /**
         * =================================================
         * ARTÍCULOS DESTACADOS
         * =================================================
         */

        result.applicableArticles.push(

            "Art.18",

            "Art.25",

            "Art.99",

            "Art.116"

        );

        if (

            result.mixedContract

        ) {

            result.applicableArticles.push(

                "Art.34"

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

        decision: ResolverDecision<ContractTypeResult>

    ): void {

        const contract = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones del Knowledge Graph
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "TipoContrato"

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

                "tipo contrato"

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

                `La prestación principal determina el régimen jurídico aplicable al expediente.`

        });

        if (

            contract.mixedContract

        ) {

            decision.reasons.push({

                source:

                    "Art.34 LCSP",

                description:

                    "El contrato presenta prestaciones mixtas, aplicándose el régimen correspondiente a la prestación principal."

            });

        }

        if (

            contract.sara

        ) {

            decision.reasons.push({

                source:

                    "Regulación armonizada",

                description:

                    "El contrato supera los umbrales de regulación armonizada."

            });

        }

        if (

            contract.excludedBusiness

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "El expediente puede encontrarse dentro de un supuesto de negocio jurídico excluido."

            });

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validateContractType(

        decision: ResolverDecision<ContractTypeResult>

    ): void {

        const contract = decision.value;

        if (

            contract.contractType === ""

        ) {

            decision.validation.errors.push(

                "No se ha podido determinar el tipo de contrato."

            );

        }

        if (

            contract.mainPerformance.trim() === ""

        ) {

            decision.validation.errors.push(

                "Debe existir una prestación principal."

            );

        }

        if (

            contract.excludedBusiness &&

            contract.sara

        ) {

            decision.validation.warnings.push(

                "Revisar si realmente procede regulación armonizada en un posible negocio excluido."

            );

        }

        if (

            contract.applicableArticles.length === 0

        ) {

            decision.validation.warnings.push(

                "No se han identificado artículos específicos de la LCSP."

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
