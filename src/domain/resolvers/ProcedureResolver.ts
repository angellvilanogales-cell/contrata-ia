/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ProcedureResolver
 * ------------------------------------------------------------
 *
 * Primer motor experto jurídico.
 *
 * Determina el procedimiento de adjudicación utilizando:
 *
 *  • DecisionContext
 *  • Knowledge Packs
 *  • RuleEngine
 *  • BaseResolver
 *
 * IMPORTANTE
 *
 * Este componente NO contiene artículos LCSP escritos
 * directamente.
 *
 * Toda la normativa llegará desde los Knowledge Packs.
 *
 * ============================================================
 */

import { BaseResolver } from "./BaseResolver";

import {
    ResolutionResult,
    ResolutionConfidence
} from "./ResolutionResult";

import { DecisionContext } from "../knowledge/DecisionContext";

import { KnowledgeRepository } from "../knowledge/KnowledgeRepository";

import { KnowledgeRuleProvider } from "../knowledge/KnowledgeRuleProvider";

import { RuleEngine } from "../knowledge/RuleEngine";

/**
 * Procedimientos soportados.
 */
export enum ProcedureType {

    OPEN = "OPEN",

    OPEN_SIMPLIFIED = "OPEN_SIMPLIFIED",

    OPEN_SIMPLIFIED_ABBREVIATED = "OPEN_SIMPLIFIED_ABBREVIATED",

    RESTRICTED = "RESTRICTED",

    NEGOTIATED = "NEGOTIATED",

    DIALOGUE = "DIALOGUE",

    INNOVATION = "INNOVATION",

    MINOR = "MINOR",

    UNKNOWN = "UNKNOWN"

}

/**
 * Resolver del procedimiento.
 */
export class ProcedureResolver
extends BaseResolver<ProcedureType> {

    constructor(

        private readonly repository:
            KnowledgeRepository,

        private readonly rules:
            KnowledgeRuleProvider,

        private readonly ruleEngine:
            RuleEngine

    ) {

        super();

    }

    /**
     * =====================================================
     * MÉTODO PRINCIPAL
     * =====================================================
     */

    public resolve(

        context: DecisionContext

    ): ResolutionResult<ProcedureType> {

        this.initialize(

            ProcedureType.UNKNOWN

        );

        this.loadKnowledge();

        this.evaluateContext(

            context

        );

        this.executeRules(

            context

        );

        this.buildReasoning();

        return this.build();

    }

    /**
     * =====================================================
     * CARGA DE KNOWLEDGE PACKS
     * =====================================================
     */

    private loadKnowledge(): void {

        /*
         * Este resolver utilizará principalmente:
         *
         * KP-0001
         * KP-0002
         * KP-0003
         * KP-0006
         *
         * En versiones futuras se cargarán
         * automáticamente desde el repositorio.
         */

        this.knowledgePack(

            "KP-0001"

        );

        this.knowledgePack(

            "KP-0002"

        );

        this.knowledgePack(

            "KP-0003"

        );

        this.knowledgePack(

            "KP-0006"

        );

    }

    /**
     * =====================================================
     * EVALUACIÓN INICIAL
     * =====================================================
     */

    private evaluateContext(

        context: DecisionContext

    ): void {

        const value =

            context.get(

                "estimatedValue"

            );

        const contractType =

            context.get(

                "contractType"

            );

        if (value === undefined) {

            this.warning(

                "No existe Valor Estimado."

            );

        }

        if (contractType === undefined) {

            this.warning(

                "No existe Tipo de Contrato."

            );

        }

    }

    /**
     * =====================================================
     * EJECUCIÓN DE REGLAS
     * =====================================================
     */

    private executeRules(

        context: DecisionContext

    ): void {

        /*
         * En la Parte 2 construiremos
         * la integración completa con
         * RuleEngine.
         */

        void context;

    }


    /**
     * =====================================================
     * EJECUCIÓN DEL RULE ENGINE
     * =====================================================
     */

    private executeRules(

        context: DecisionContext

    ): void {

        /**
         * En versiones posteriores el RuleEngine
         * cargará automáticamente las reglas
         * procedentes de los Knowledge Packs.
         */

        const decision =

            this.ruleEngine.execute(

                context

            );

        /**
         * Si el RuleEngine ya ha propuesto un
         * procedimiento lo aceptamos como
         * candidato principal.
         */

        const procedure =

            (decision as any).procedure;

        if (

            procedure !== undefined

        ) {

            this.result.value = procedure;

        }

        /**
         * Independientemente del resultado,
         * seguimos evaluando el expediente
         * para generar una explicación completa.
         */

        this.evaluateEstimatedValue(

            context

        );

        this.evaluateContractType(

            context

        );

        this.evaluateSpecialCases(

            context

        );

    }

    /**
     * =====================================================
     * VALOR ESTIMADO
     * =====================================================
     */

    private evaluateEstimatedValue(

        context: DecisionContext

    ): void {

        const estimatedValue =

            Number(

                context.get(

                    "estimatedValue"

                )

            );

        if (

            Number.isNaN(

                estimatedValue

            )

        ) {

            this.warning(

                "No puede evaluarse el procedimiento sin Valor Estimado."

            );

            return;

        }

        this.reasoning(

            "Se evalúa el Valor Estimado como uno de los criterios principales para determinar el procedimiento."

        );

        this.evidence({

            reference:

                "estimatedValue"

        });

    }

    /**
     * =====================================================
     * TIPO DE CONTRATO
     * =====================================================
     */

    private evaluateContractType(

        context: DecisionContext

    ): void {

        const contractType =

            context.get(

                "contractType"

            );

        if (

            contractType === undefined

        ) {

            this.warning(

                "No existe Tipo de Contrato."

            );

            return;

        }

        this.reasoning(

            "Se analiza el Tipo de Contrato para seleccionar únicamente los procedimientos compatibles."

        );

        this.evidence({

            reference:

                "contractType"

        });

    }

    /**
     * =====================================================
     * SUPUESTOS ESPECIALES
     * =====================================================
     */

    private evaluateSpecialCases(

        context: DecisionContext

    ): void {

        const urgent =

            context.get(

                "urgent"

            );

        const emergency =

            context.get(

                "emergency"

            );

        if (

            urgent === true

        ) {

            this.reasoning(

                "El expediente declara tramitación urgente."

            );

        }

        if (

            emergency === true

        ) {

            this.reasoning(

                "El expediente declara tramitación de emergencia."

            );

        }

    }

    /**
     * =====================================================
     * PROPUESTA PRELIMINAR
     * =====================================================
     */

    private proposeProcedure(

        procedure: ProcedureType,

        confidence: ResolutionConfidence

    ): void {

        this.result.value = procedure;

        this.confidence(

            confidence

        );

    }

    /**
     * =====================================================
     * RESOLUCIÓN DEL PROCEDIMIENTO
     * =====================================================
     */

    private determineProcedure(

        context: DecisionContext

    ): void {

        const estimatedValue = Number(

            context.get(

                "estimatedValue"

            )

        );

        const contractType = String(

            context.get(

                "contractType"

            ) ?? ""

        );

        /**
         * =================================================
         * PROCEDIMIENTO MENOR
         * =================================================
         *
         * La comprobación definitiva vendrá desde
         * los Knowledge Packs.
         */

        if (

            this.isMinorCandidate(

                estimatedValue,

                contractType

            )

        ) {

            this.proposeProcedure(

                ProcedureType.MINOR,

                ResolutionConfidence.HIGH

            );

            this.rule({

                id: "PR-001",

                name: "Minor contract candidate"

            });

            return;

        }

        /**
         * =================================================
         * PROCEDIMIENTO ABIERTO SIMPLIFICADO
         * =================================================
         */

        if (

            this.isSimplifiedCandidate(

                estimatedValue

            )

        ) {

            this.proposeProcedure(

                ProcedureType.OPEN_SIMPLIFIED,

                ResolutionConfidence.HIGH

            );

            this.rule({

                id: "PR-002",

                name: "Simplified open procedure"

            });

            return;

        }

        /**
         * =================================================
         * PROCEDIMIENTO ABIERTO
         * =================================================
         */

        this.proposeProcedure(

            ProcedureType.OPEN,

            ResolutionConfidence.MEDIUM

        );

        this.rule({

            id: "PR-003",

            name: "Open procedure"

        });

    }

    /**
     * =====================================================
     * CONTRATO MENOR
     * =====================================================
     */

    private isMinorCandidate(

        estimatedValue: number,

        contractType: string

    ): boolean {

        if (

            Number.isNaN(

                estimatedValue

            )

        ) {

            return false;

        }

        /**
         * Los umbrales definitivos serán obtenidos
         * desde los Knowledge Packs.
         *
         * Este valor únicamente mantiene operativo
         * el motor hasta incorporar el conocimiento.
         */

        switch (

            contractType

        ) {

            case "WORKS":

                return estimatedValue <= 40000;

            case "SERVICES":

                return estimatedValue <= 15000;

            case "SUPPLIES":

                return estimatedValue <= 15000;

            default:

                return false;

        }

    }

    /**
     * =====================================================
     * PROCEDIMIENTO ABIERTO SIMPLIFICADO
     * =====================================================
     */

    private isSimplifiedCandidate(

        estimatedValue: number

    ): boolean {

        if (

            Number.isNaN(

                estimatedValue

            )

        ) {

            return false;

        }

        /**
         * Sustituido posteriormente por
         * KP-0001.
         */

        return estimatedValue <= 100000;

    }

    /**
     * =====================================================
     * PROCEDIMIENTOS ESPECIALES
     * =====================================================
     */

    private evaluateExceptionalProcedures(

        context: DecisionContext

    ): void {

        const innovation =

            context.get(

                "innovation"

            );

        const dialogue =

            context.get(

                "competitiveDialogue"

            );

        const negotiated =

            context.get(

                "negotiated"

            );

        if (

            innovation === true

        ) {

            this.alternative(

                ProcedureType.INNOVATION,

                "Expediente susceptible de Asociación para la Innovación."

            );

        }

        if (

            dialogue === true

        ) {

            this.alternative(

                ProcedureType.DIALOGUE,

                "Expediente compatible con Diálogo Competitivo."

            );

        }

        if (

            negotiated === true

        ) {

            this.alternative(

                ProcedureType.NEGOTIATED,

                "Expediente susceptible de procedimiento negociado."

            );

        }

    }

      /**
     * =====================================================
     * CONSTRUCCIÓN DEL RAZONAMIENTO
     * =====================================================
     */

    private buildReasoning(): void {

        switch (this.result.value) {

            case ProcedureType.MINOR:

                this.reasoning(
                    "El motor propone inicialmente un contrato menor conforme a la información disponible y a las reglas actualmente cargadas."
                );

                break;

            case ProcedureType.OPEN_SIMPLIFIED:

                this.reasoning(
                    "El motor considera compatible el procedimiento abierto simplificado atendiendo al contexto recibido."
                );

                break;

            case ProcedureType.OPEN:

                this.reasoning(
                    "No se han detectado circunstancias que justifiquen un procedimiento especial. Se propone inicialmente el procedimiento abierto."
                );

                break;

            case ProcedureType.RESTRICTED:

                this.reasoning(
                    "El expediente reúne indicios compatibles con un procedimiento restringido."
                );

                break;

            case ProcedureType.NEGOTIATED:

                this.reasoning(
                    "Se detectan circunstancias susceptibles de justificar un procedimiento negociado."
                );

                break;

            case ProcedureType.DIALOGUE:

                this.reasoning(
                    "El expediente presenta características compatibles con un diálogo competitivo."
                );

                break;

            case ProcedureType.INNOVATION:

                this.reasoning(
                    "El expediente puede encajar en una Asociación para la Innovación."
                );

                break;

            default:

                this.warning(
                    "No ha sido posible determinar un procedimiento definitivo."
                );

        }

    }

    /**
     * =====================================================
     * VALIDACIÓN FINAL
     * =====================================================
     */

    private validateResolution(): void {

        if (

            this.result.value === ProcedureType.UNKNOWN

        ) {

            this.error(

                "No existe información suficiente para determinar el procedimiento."

            );

        }

        if (

            this.result.reasoning.trim().length === 0

        ) {

            this.warning(

                "La resolución carece de razonamiento."

            );

        }

    }

    /**
     * =====================================================
     * REFERENCIAS NORMATIVAS
     * =====================================================
     */

    private appendNormativeSupport(): void {

        /**
         * IMPORTANTE
         *
         * Aquí NO se incorporan artículos
         * directamente.
         *
         * Las referencias deberán obtenerse
         * desde el KnowledgeRepository
         * cuando los Knowledge Packs
         * estén completamente cargados.
         */

        if (

            this.repository !== undefined

        ) {

            // Punto de integración futura.

        }

    }

    /**
     * =====================================================
     * RESOLUCIÓN COMPLETA
     * =====================================================
     */

    public override resolve(

        context: DecisionContext

    ): ResolutionResult<ProcedureType> {

        this.initialize(

            ProcedureType.UNKNOWN

        );

        this.loadKnowledge();

        this.evaluateContext(

            context

        );

        this.executeRules(

            context

        );

        this.determineProcedure(

            context

        );

        this.evaluateExceptionalProcedures(

            context

        );

        this.appendNormativeSupport();

        this.buildReasoning();

        this.validateResolution();

        return this.build();

    }

}
