/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * SolvencyResolver
 * ------------------------------------------------------------
 * Determina automáticamente:
 *
 * • Exigencia de solvencia.
 * • Solvencia económica.
 * • Solvencia técnica.
 * • Clasificación empresarial.
 * • Exenciones.
 *
 * Toda la información procede de:
 *
 *  • ThresholdResolver
 *  • ProcedureResolver
 *  • CPVResolver
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

    SolvencyResult

} from "../types/SolvencyResult";

import {

    SolvencyReason

} from "../types/SolvencyReason";

export class SolvencyResolver

extends BaseResolver<SolvencyResult>{

    /**
     * Caché.
     */

    private readonly cache=

        new BaseCache<

            ResolverDecision<SolvencyResult>

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

            "SolvencyResolver"

        );

    }

    /**
     * =====================================================
     * Punto de entrada
     * =====================================================
     */

    public resolve(

        context:ResolverContext

    ):ResolverDecision<SolvencyResult>{

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

            "SolvencyResolver",

            "executions"

        );

        this.audit.log(

            "RESOLVER",

            "Inicio SolvencyResolver"

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

    ): ResolverDecision<SolvencyResult> {

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

            "Reglas de solvencia ejecutadas",

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

                    procedureDecision.value,

                    context.contract.type,

                    "solvencia"

                ].join(" ")

            );

        /**
         * -------------------------------------------------
         * Calcular solvencia
         * -------------------------------------------------
         */

        const result =

            this.calculateSolvency(

                context,

                thresholdDecision.value,

                procedureDecision.value,

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

                result,

                SolvencyReason.AUTOMATIC

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

            "SolvencyResolver",

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
     * CÁLCULO DE SOLVENCIA
     * =====================================================
     */

    private calculateSolvency(

        context: ResolverContext,

        thresholds: any,

        procedure: any,

        cpv: any,

        executions: ReadonlyArray<any>

    ): SolvencyResult {

        /**
         * -------------------------------------------------
         * Si alguna regla jurídica ya determina
         * la solvencia se utiliza directamente.
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

                return execution.value as SolvencyResult;

            }

        }

        const estimatedValue = Number(

            context.contract.estimatedValue ?? 0

        );

        /**
         * =================================================
         * Parámetros configurables
         * =================================================
         */

        const economicMultiplier =

            this.rules.variable<number>(

                "ECONOMIC_SOLVENCY_MULTIPLIER"

            ) ?? 1.5;

        const technicalYears =

            this.rules.variable<number>(

                "TECHNICAL_REFERENCE_YEARS"

            ) ?? 3;

        const roleceMandatory =

            this.rules.variable<boolean>(

                "ROLECE_REQUIRED"

            ) ?? false;

        /**
         * =================================================
         * Exención de solvencia
         * =================================================
         */

        const exempt =

            thresholds.isMinor;

        /**
         * =================================================
         * Solvencia económica
         * =================================================
         */

        const economicRequired =

            !exempt;

        const minimumTurnover =

            economicRequired

                ? estimatedValue *

                    economicMultiplier

                : 0;

        /**
         * =================================================
         * Solvencia técnica
         * =================================================
         */

        const technicalRequired =

            !exempt;

        /**
         * Número de contratos de referencia
         */

        let minimumReferences = 1;

        switch (

            cpv.semanticFamily

        ) {

            case "OBRAS":

                minimumReferences = 3;

                break;

            case "SERVICIOS":

                minimumReferences = 2;

                break;

            case "SUMINISTROS":

                minimumReferences = 2;

                break;

            default:

                minimumReferences = 1;

        }

        /**
         * =================================================
         * Clasificación empresarial
         * =================================================
         */

        const classificationRequired =

            cpv.semanticFamily === "OBRAS"

            &&

            estimatedValue >=

            (

                this.rules.variable<number>(

                    "CLASSIFICATION_THRESHOLD"

                ) ?? 500000

            );

        /**
         * =================================================
         * ROLECE
         * =================================================
         */

        const roleceRequired =

            roleceMandatory ||

            procedure === "SIMPLIFIED" ||

            procedure === "SIMPLIFIED_SHORT";

        /**
         * =================================================
         * Resultado
         * =================================================
         */

        return {

            exempt,

            economic: {

                required:

                    economicRequired,

                minimumTurnover,

                multiplier:

                    economicMultiplier

            },

            technical: {

                required:

                    technicalRequired,

                referenceYears:

                    technicalYears,

                minimumContracts:

                    minimumReferences

            },

            classification: {

                required:

                    classificationRequired

            },

            rolece: {

                required:

                    roleceRequired

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

        decision: ResolverDecision<SolvencyResult>

    ): void {

        const solvency = decision.value;

        /**
         * ---------------------------------------------
         * Relaciones Knowledge Graph
         * ---------------------------------------------
         */

        const relations =

            this.knowledge.outgoing(

                "Solvencia"

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

                "solvencia económica técnica"

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

            solvency.exempt

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "No procede exigir solvencia al expediente conforme a la normativa aplicable."

            });

        }

        else {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "La solvencia exigida resulta proporcional al objeto y al valor estimado del contrato."

            });

        }

        if (

            solvency.classification.required

        ) {

            decision.reasons.push({

                source:

                    "LCSP",

                description:

                    "Se requiere clasificación empresarial para este expediente."

            });

        }

        if (

            solvency.rolece.required

        ) {

            decision.reasons.push({

                source:

                    "ROLECE",

                description:

                    "La inscripción en ROLECE podrá utilizarse para acreditar la solvencia."

            });

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN
     * =====================================================
     */

    private validateSolvency(

        decision: ResolverDecision<SolvencyResult>

    ): void {

        const solvency = decision.value;

        if (

            solvency.economic.minimumTurnover < 0

        ) {

            decision.validation.errors.push(

                "El volumen mínimo de negocio calculado es inválido."

            );

        }

        if (

            solvency.technical.referenceYears <= 0

        ) {

            decision.validation.errors.push(

                "El número de años de referencia debe ser superior a cero."

            );

        }

        if (

            solvency.classification.required &&

            solvency.exempt

        ) {

            decision.validation.errors.push(

                "No puede exigirse clasificación cuando el expediente está exento de solvencia."

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

