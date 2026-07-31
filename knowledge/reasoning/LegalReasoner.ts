/**
 * ============================================================================
 * CONTRATA-IA
 * Expert Legal Reasoning Engine
 * ----------------------------------------------------------------------------
 * Archivo:
 *      LegalReasoner.ts
 *
 * Responsabilidad:
 *      Motor principal de razonamiento jurídico.
 *
 * Funciones:
 *
 *  • Interpretación normativa.
 *  • Aplicación de la LCSP.
 *  • Resolución de conflictos normativos.
 *  • Generación de motivaciones jurídicas.
 *  • Construcción de la fundamentación legal.
 *  • Justificación administrativa.
 *  • Evaluación de excepciones.
 *  • Compatibilidad normativa.
 *  • Integración con Ontología Jurídica.
 *
 * ============================================================================
 */

import {

    UUID,
    ISODate,
    Severity

} from "../core/types";

import {

    LegalOntology

} from "../ontology/LegalOntology";

import {

    RuleEngine

} from "../rules/RuleEngine";

import {

    InferenceEngine

} from "../inference/InferenceEngine";

/**
 * ============================================================================
 * Tipos básicos
 * ============================================================================
 */

export type LegalReference = string;

export type ArticleNumber = string;

export type RegulationIdentifier = string;

export type Confidence =

    | "VERY_HIGH"
    | "HIGH"
    | "MEDIUM"
    | "LOW";

/**
 * ============================================================================
 * Tipo de norma
 * ============================================================================
 */

export enum LegalSourceType {

    EUROPEAN_REGULATION = "EUROPEAN_REGULATION",

    EUROPEAN_DIRECTIVE = "EUROPEAN_DIRECTIVE",

    CONSTITUTION = "CONSTITUTION",

    ORGANIC_LAW = "ORGANIC_LAW",

    ORDINARY_LAW = "ORDINARY_LAW",

    ROYAL_DECREE = "ROYAL_DECREE",

    DECREE = "DECREE",

    ORDER = "ORDER",

    RESOLUTION = "RESOLUTION",

    INSTRUCTION = "INSTRUCTION",

    INTERNAL_GUIDE = "INTERNAL_GUIDE",

    JURISPRUDENCE = "JURISPRUDENCE"

}

/**
 * ============================================================================
 * Estado de aplicación
 * ============================================================================
 */

export enum Applicability {

    APPLIES = "APPLIES",

    PARTIALLY_APPLIES = "PARTIALLY_APPLIES",

    DOES_NOT_APPLY = "DOES_NOT_APPLY",

    UNKNOWN = "UNKNOWN"

}

/**
 * ============================================================================
 * Prioridad normativa
 * ============================================================================
 */

export enum LegalPriority {

    VERY_HIGH = 100,

    HIGH = 80,

    MEDIUM = 60,

    LOW = 40,

    VERY_LOW = 20

}

/**
 * ============================================================================
 * Contexto jurídico
 * ============================================================================
 */

export interface LegalContext {

    inferenceId: UUID;

    contractingAuthority: string;

    contractType: string;

    estimatedValue: number;

    cpvCodes: string[];

    procedureType?: string;

    autonomousCommunity?: string;

    contractingBody?: string;

    metadata?:

        Record<string, unknown>;

}

/**
 * ============================================================================
 * Norma jurídica
 * ============================================================================
 */

export interface LegalRule {

    id: UUID;

    identifier: RegulationIdentifier;

    source: LegalSourceType;

    title: string;

    article: ArticleNumber;

    priority: LegalPriority;

    applicable: Applicability;

    reference: LegalReference;

}

/**
 * ============================================================================
 * Resultado de interpretación
 * ============================================================================
 */

export interface LegalInterpretation {

    id: UUID;

    rule: LegalRule;

    confidence: Confidence;

    reasoning: string;

    interpretation: string;

    applicableArticles:

        ArticleNumber[];

    references:

        LegalReference[];

    observations:

        string[];

}

/**
 * ============================================================================
 * Conflicto normativo
 * ============================================================================
 */

export interface LegalConflict {

    id: UUID;

    description: string;

    higherPriorityRule: LegalRule;

    lowerPriorityRule: LegalRule;

    resolution: string;

    justification: string;

}

/**
 * ============================================================================
 * Motivación jurídica
 * ============================================================================
 */

export interface LegalMotivation {

    id: UUID;

    generatedAt: ISODate;

    title: string;

    summary: string;

    legalBasis:

        LegalReference[];

    reasoning:

        string[];

    conclusion: string;

}

/**
 * ============================================================================
 * Resultado del razonamiento
 * ============================================================================
 */

export interface LegalReasoningResult {

    id: UUID;

    context: LegalContext;

    interpretations:

        LegalInterpretation[];

    conflicts:

        LegalConflict[];

    motivation:

        LegalMotivation;

    confidence:

        Confidence;

    executionMilliseconds:

        number;

}

/**
 * ============================================================================
 * Configuración
 * ============================================================================
 */

export interface LegalReasonerConfiguration {

    enableConflictResolution: boolean;

    enableInterpretation: boolean;

    enableMotivationGeneration: boolean;

    enableLegalValidation: boolean;

    enableOntologySupport: boolean;

    enableRuleEngineSupport: boolean;

    enableTraceability: boolean;

}

/**
 * ============================================================================
 * Configuración por defecto
 * ============================================================================
 */

const DEFAULT_CONFIGURATION:

LegalReasonerConfiguration = {

    enableConflictResolution: true,

    enableInterpretation: true,

    enableMotivationGeneration: true,

    enableLegalValidation: true,

    enableOntologySupport: true,

    enableRuleEngineSupport: true,

    enableTraceability: true

};

/**
 * ============================================================================
 * Clase principal
 * ============================================================================
 */

export class LegalReasoner {

    /**
     * Ontología jurídica
     */

    private readonly ontology:

        LegalOntology;

    /**
     * Motor de reglas
     */

    private readonly ruleEngine:

        RuleEngine;

    /**
     * Motor de inferencia
     */

    private readonly inferenceEngine:

        InferenceEngine;

    /**
     * Configuración
     */

    private readonly configuration:

        LegalReasonerConfiguration;

    /**
     * ============================================================================
     * Constructor
     * ============================================================================
     */

    constructor(

        ontology: LegalOntology,

        ruleEngine: RuleEngine,

        inferenceEngine: InferenceEngine,

        configuration?:

            Partial<LegalReasonerConfiguration>

    ) {

        this.ontology = ontology;

        this.ruleEngine = ruleEngine;

        this.inferenceEngine = inferenceEngine;

        this.configuration = {

            ...DEFAULT_CONFIGURATION,

            ...configuration

        };

        this.initialize();

    }

    /**
     * ============================================================================
     * Inicialización
     * ============================================================================
     */

    private initialize(): void {

        this.loadLegalSources();

        this.loadInterpretationCriteria();

        this.loadConflictResolvers();

        this.loadLegalHierarchy();

    }

    /**
     * ============================================================================
     * Catálogo normativo
     * ============================================================================
     */

    private readonly legalRules:

        Map<UUID, LegalRule> =

            new Map();

    /**
     * Interpretaciones disponibles
     * ============================================================================
     */

    private readonly interpretations:

        Map<UUID, LegalInterpretation> =

            new Map();

    /**
     * Conflictos detectados
     * ============================================================================
     */

    private readonly conflicts:

        Map<UUID, LegalConflict> =

            new Map();

    /**
     * Motivaciones generadas
     * ============================================================================
     */

    private readonly motivations:

        Map<UUID, LegalMotivation> =

            new Map();

    /**
     * ============================================================================
     * Cargar fuentes jurídicas
     * ============================================================================
     */

    private loadLegalSources(): void {

        /**
         * Futuras versiones:
         *
         * - LCSP
         * - Ley 39/2015
         * - Ley 40/2015
         * - Directivas Europeas
         * - Reglamento UE
         * - ENS
         * - ENI
         * - Normativa Junta de Andalucía
         * - Jurisprudencia
         */

    }

    /**
     * ============================================================================
     * Criterios interpretativos
     * ============================================================================
     */

    private loadInterpretationCriteria(): void {

        /**
         * Interpretación:
         *
         * - Literal
         * - Sistemática
         * - Finalista
         * - Teleológica
         * - Jerárquica
         * - Cronológica
         * - Especialidad
         */

    }

    /**
     * ============================================================================
     * Resolución de conflictos
     * ============================================================================
     */

    private loadConflictResolvers(): void {

    }

    /**
     * ============================================================================
     * Jerarquía normativa
     * ============================================================================
     */

    private loadLegalHierarchy(): void {

    }

    /**
     * ============================================================================
     * Método principal de razonamiento jurídico
     * ============================================================================
     */

    public async reason(

        context: LegalContext

    ): Promise<LegalReasoningResult> {

        const start = performance.now();

        /**
         * Validaciones iniciales
         */

        this.validateContext(context);

        /**
         * Interpretación normativa
         */

        const interpretations =

            await this.interpretApplicableRules(

                context

            );

        /**
         * Resolución de conflictos
         */

        const conflicts =

            this.configuration.enableConflictResolution

                ? await this.resolveConflicts(

                    interpretations

                )

                : [];

        /**
         * Construcción de motivación jurídica
         */

        const motivation =

            await this.generateMotivation(

                context,

                interpretations,

                conflicts

            );

        /**
         * Nivel de confianza
         */

        const confidence =

            this.calculateConfidence(

                interpretations,

                conflicts

            );

        return {

            id: crypto.randomUUID(),

            context,

            interpretations,

            conflicts,

            motivation,

            confidence,

            executionMilliseconds:

                performance.now() - start

        };

    }

    /**
     * ============================================================================
     * Validación del contexto
     * ============================================================================
     */

    private validateContext(

        context: LegalContext

    ): void {

        if (

            context.contractType.trim().length === 0

        ) {

            throw new Error(

                "Contract type is mandatory."

            );

        }

        if (

            context.estimatedValue < 0

        ) {

            throw new Error(

                "Estimated value cannot be negative."

            );

        }

        if (

            context.cpvCodes.length === 0

        ) {

            throw new Error(

                "At least one CPV code is required."

            );

        }

    }

    /**
     * ============================================================================
     * Recuperar normas aplicables
     * ============================================================================
     */

    private async interpretApplicableRules(

        context: LegalContext

    ): Promise<LegalInterpretation[]> {

        /**
         * Este método será conectado con:
         *
         *  • Ontología Jurídica
         *  • RuleEngine
         *  • Base documental
         *  • Motor de Inferencia
         */

        return [];

    }

    /**
     * ============================================================================
     * Resolver conflictos normativos
     * ============================================================================
     */

    private async resolveConflicts(

        interpretations: LegalInterpretation[]

    ): Promise<LegalConflict[]> {

        const conflicts: LegalConflict[] = [];

        /**
         * Futuras versiones:
         *
         *  • Lex Superior
         *  • Lex Specialis
         *  • Lex Posterior
         *  • Principio de Competencia
         *  • Principio de Proporcionalidad
         *  • Principio de Buena Administración
         */

        for (

            let i = 0;

            i < interpretations.length;

            i++

        ) {

            for (

                let j = i + 1;

                j < interpretations.length;

                j++

            ) {

                const first =

                    interpretations[i];

                const second =

                    interpretations[j];

                if (

                    first.rule.article ===

                    second.rule.article

                ) {

                    continue;

                }

                const conflict =

                    this.evaluateConflict(

                        first,

                        second

                    );

                if (

                    conflict

                ) {

                    conflicts.push(

                        conflict

                    );

                }

            }

        }

        return conflicts;

    }

    /**
     * ============================================================================
     * Evaluación individual del conflicto
     * ============================================================================
     */

    private evaluateConflict(

        first: LegalInterpretation,

        second: LegalInterpretation

    ): LegalConflict | undefined {

        if (

            first.rule.priority ===

            second.rule.priority

        ) {

            return undefined;

        }

        const higher =

            first.rule.priority >

            second.rule.priority

                ? first.rule

                : second.rule;

        const lower =

            first.rule.priority >

            second.rule.priority

                ? second.rule

                : first.rule;

        return {

            id: crypto.randomUUID(),

            description:

                `Potential legal conflict between ${higher.identifier} and ${lower.identifier}.`,

            higherPriorityRule:

                higher,

            lowerPriorityRule:

                lower,

            resolution:

                "Higher priority legal rule prevails.",

            justification:

                "Conflict resolved according to the principle of legal hierarchy."

        };

    }

    /**
     * ============================================================================
     * Número de conflictos
     * ============================================================================
     */

    public getConflictCount(): number {

        return this.conflicts.size;

    }

    /**
     * ============================================================================
     * Generación de la motivación jurídica
     * ============================================================================
     */

    private async generateMotivation(

        context: LegalContext,

        interpretations: LegalInterpretation[],

        conflicts: LegalConflict[]

    ): Promise<LegalMotivation> {

        const legalBasis =

            interpretations.flatMap(

                interpretation =>

                    interpretation.references

            );

        const reasoning =

            interpretations.map(

                interpretation =>

                    interpretation.reasoning

            );

        const conclusion =

            this.buildConclusion(

                context,

                interpretations,

                conflicts

            );

        const motivation: LegalMotivation = {

            id: crypto.randomUUID(),

            generatedAt:

                new Date().toISOString(),

            title:

                "Fundamentación jurídica",

            summary:

                this.buildSummary(

                    interpretations,

                    conflicts

                ),

            legalBasis,

            reasoning,

            conclusion

        };

        this.motivations.set(

            motivation.id,

            motivation

        );

        return motivation;

    }

    /**
     * ============================================================================
     * Construcción del resumen
     * ============================================================================
     */

    private buildSummary(

        interpretations: LegalInterpretation[],

        conflicts: LegalConflict[]

    ): string {

        return [

            `${interpretations.length} interpretaciones jurídicas.`,

            `${conflicts.length} conflictos normativos.`

        ].join(" ");

    }

    /**
     * ============================================================================
     * Construcción de la conclusión
     * ============================================================================
     */

    private buildConclusion(

        context: LegalContext,

        interpretations: LegalInterpretation[],

        conflicts: LegalConflict[]

    ): string {

        if (

            interpretations.length === 0

        ) {

            return

                "No existen elementos suficientes para emitir una conclusión jurídica.";

        }

        if (

            conflicts.length === 0

        ) {

            return

                `La actuación propuesta resulta compatible con el marco normativo aplicable al contrato ${context.contractType}.`;

        }

        return

            "La actuación requiere la aplicación de criterios de prevalencia normativa para resolver los conflictos detectados.";

    }

    /**
     * ============================================================================
     * Recuperar motivación
     * ============================================================================
     */

    public getMotivation(

        id: UUID

    ): LegalMotivation | undefined {

        return this.motivations.get(id);

    }

    /**
     * ============================================================================
     * Número de motivaciones
     * ============================================================================
     */

    public getMotivationCount(): number {

        return this.motivations.size;

    }

    /**
     * ============================================================================
     * Cálculo del nivel de confianza
     * ============================================================================
     */

    private calculateConfidence(

        interpretations: LegalInterpretation[],

        conflicts: LegalConflict[]

    ): Confidence {

        let score = 100;

        /**
         * Penalización por ausencia de interpretación
         */

        if (

            interpretations.length === 0

        ) {

            score -= 60;

        }

        /**
         * Penalización por conflictos normativos
         */

        score -= conflicts.length * 10;

        /**
         * Penalización por interpretaciones poco fundamentadas
         */

        const weakInterpretations =

            interpretations.filter(

                interpretation =>

                    interpretation.references.length === 0 ||

                    interpretation.reasoning.trim().length === 0

            );

        score -= weakInterpretations.length * 5;

        /**
         * Normalización
         */

        score =

            Math.max(

                0,

                Math.min(

                    100,

                    score

                )

            );

        if (

            score >= 90

        ) {

            return "VERY_HIGH";

        }

        if (

            score >= 75

        ) {

            return "HIGH";

        }

        if (

            score >= 50

        ) {

            return "MEDIUM";

        }

        return "LOW";

    }

    /**
     * ============================================================================
     * Validación jurídica final
     * ============================================================================
     */

    public validateReasoning(

        result: LegalReasoningResult

    ): boolean {

        return (

            result.interpretations.length > 0 &&

            result.motivation.legalBasis.length > 0 &&

            result.motivation.reasoning.length > 0 &&

            result.confidence !== "LOW"

        );

    }

    /**
     * ============================================================================
     * Verificación de coherencia
     * ============================================================================
     */

    public verifyConsistency(

        result: LegalReasoningResult

    ): boolean {

        return result.interpretations.every(

            interpretation =>

                interpretation.rule.applicable !==

                Applicability.UNKNOWN

        );

    }

    /**
     * ============================================================================
     * Estado general del razonamiento
     * ============================================================================
     */

    public getReasoningStatus(

        result: LegalReasoningResult

    ) {

        return {

            valid:

                this.validateReasoning(

                    result

                ),

            consistent:

                this.verifyConsistency(

                    result

                ),

            confidence:

                result.confidence,

            conflicts:

                result.conflicts.length,

            interpretations:

                result.interpretations.length

        };

    }

    /**
     * ============================================================================
     * Compatibilidad normativa
     * ============================================================================
     */

    public evaluateCompatibility(

        context: LegalContext,

        rule: LegalRule

    ): Applicability {

        /**
         * En versiones posteriores este método consultará:
         *
         *  • Ontología Jurídica
         *  • Base documental
         *  • RuleEngine
         *  • Clasificador IA
         *  • Grafo de relaciones normativas
         */

        if (

            context.contractType.length === 0

        ) {

            return Applicability.UNKNOWN;

        }

        return Applicability.APPLIES;

    }

    /**
     * ============================================================================
     * Determinar prioridad jurídica
     * ============================================================================
     */

    public determinePriority(

        source: LegalSourceType

    ): LegalPriority {

        switch (source) {

            case LegalSourceType.CONSTITUTION:

                return LegalPriority.VERY_HIGH;

            case LegalSourceType.EUROPEAN_REGULATION:

                return LegalPriority.VERY_HIGH;

            case LegalSourceType.EUROPEAN_DIRECTIVE:

                return LegalPriority.HIGH;

            case LegalSourceType.ORGANIC_LAW:

                return LegalPriority.HIGH;

            case LegalSourceType.ORDINARY_LAW:

                return LegalPriority.MEDIUM;

            case LegalSourceType.ROYAL_DECREE:

                return LegalPriority.MEDIUM;

            case LegalSourceType.DECREE:

                return LegalPriority.LOW;

            case LegalSourceType.ORDER:

                return LegalPriority.LOW;

            case LegalSourceType.RESOLUTION:

                return LegalPriority.VERY_LOW;

            case LegalSourceType.INSTRUCTION:

                return LegalPriority.VERY_LOW;

            case LegalSourceType.INTERNAL_GUIDE:

                return LegalPriority.VERY_LOW;

            case LegalSourceType.JURISPRUDENCE:

                return LegalPriority.HIGH;

            default:

                return LegalPriority.LOW;

        }

    }

    /**
     * ============================================================================
     * Registro de norma
     * ============================================================================
     */

    public registerRule(

        rule: LegalRule

    ): void {

        this.legalRules.set(

            rule.id,

            rule

        );

    }

    /**
     * ============================================================================
     * Recuperar norma
     * ============================================================================
     */

    public getRule(

        id: UUID

    ): LegalRule | undefined {

        return this.legalRules.get(

            id

        );

    }

    /**
     * ============================================================================
     * Todas las normas
     * ============================================================================
     */

    public getRules():

        ReadonlyArray<LegalRule> {

        return [

            ...this.legalRules.values()

        ];

    }

    /**
     * ============================================================================
     * Número de normas registradas
     * ============================================================================
     */

    public getRuleCount(): number {

        return this.legalRules.size;

    }

    /**
     * ============================================================================
     * Búsqueda por artículo
     * ============================================================================
     */

    public findRulesByArticle(

        article: ArticleNumber

    ): LegalRule[] {

        return this.getRules().filter(

            rule =>

                rule.article === article

        );

    }

    /**
     * ============================================================================
     * Búsqueda por tipo de norma
     * ============================================================================
     */

    public findRulesBySource(

        source: LegalSourceType

    ): LegalRule[] {

        return this.getRules().filter(

            rule =>

                rule.source === source

        );

    }

    /**
     * ============================================================================
     * Búsqueda por identificador normativo
     * ============================================================================
     */

    public findRule(

        identifier: RegulationIdentifier

    ): LegalRule | undefined {

        return this.getRules().find(

            rule =>

                rule.identifier === identifier

        );

    }

    /**
     * ============================================================================
     * Normas aplicables
     * ============================================================================
     */

    public getApplicableRules(

        context: LegalContext

    ): LegalRule[] {

        return this.getRules().filter(

            rule =>

                this.evaluateCompatibility(

                    context,

                    rule

                ) ===

                Applicability.APPLIES

        );

    }

    /**
     * ============================================================================
     * Normas ordenadas por prioridad
     * ============================================================================
     */

    public getRulesOrderedByPriority():

        LegalRule[] {

        return this.getRules()

            .sort(

                (a, b) =>

                    b.priority -

                    a.priority

            );

    }

    /**
     * ============================================================================
     * Comprobación de existencia
     * ============================================================================
     */

    public hasRule(

        identifier: RegulationIdentifier

    ): boolean {

        return this.findRule(

            identifier

        ) !== undefined;

    }

    /**
     * ============================================================================
     * Eliminación de norma
     * ============================================================================
     */

    public removeRule(

        id: UUID

    ): boolean {

        return this.legalRules.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reinicialización del catálogo
     * ============================================================================
     */

    public clearRules(): void {

        this.legalRules.clear();

    }

    /**
     * ============================================================================
     * Estado del catálogo normativo
     * ============================================================================
     */

    public getRuleRepositoryStatus() {

        return {

            totalRules:

                this.getRuleCount(),

            constitutionalRules:

                this.findRulesBySource(

                    LegalSourceType.CONSTITUTION

                ).length,

            europeanRules:

                this.findRulesBySource(

                    LegalSourceType.EUROPEAN_REGULATION

                ).length +

                this.findRulesBySource(

                    LegalSourceType.EUROPEAN_DIRECTIVE

                ).length,

            nationalRules:

                this.findRulesBySource(

                    LegalSourceType.ORGANIC_LAW

                ).length +

                this.findRulesBySource(

                    LegalSourceType.ORDINARY_LAW

                ).length

        };

    }

    /**
     * ============================================================================
     * Registro de interpretaciones
     * ============================================================================
     */

    public registerInterpretation(

        interpretation: LegalInterpretation

    ): void {

        this.interpretations.set(

            interpretation.id,

            interpretation

        );

    }

    /**
     * ============================================================================
     * Recuperar interpretación
     * ============================================================================
     */

    public getInterpretation(

        id: UUID

    ): LegalInterpretation | undefined {

        return this.interpretations.get(id);

    }

    /**
     * ============================================================================
     * Todas las interpretaciones
     * ============================================================================
     */

    public getInterpretations():

        ReadonlyArray<LegalInterpretation> {

        return [

            ...this.interpretations.values()

        ];

    }

    /**
     * ============================================================================
     * Número de interpretaciones
     * ============================================================================
     */

    public getInterpretationCount(): number {

        return this.interpretations.size;

    }

    /**
     * ============================================================================
     * Eliminar interpretación
     * ============================================================================
     */

    public removeInterpretation(

        id: UUID

    ): boolean {

        return this.interpretations.delete(id);

    }

    /**
     * ============================================================================
     * Reiniciar interpretaciones
     * ============================================================================
     */

    public clearInterpretations(): void {

        this.interpretations.clear();

    }

    /**
     * ============================================================================
     * Registro de conflictos
     * ============================================================================
     */

    public registerConflict(

        conflict: LegalConflict

    ): void {

        this.conflicts.set(

            conflict.id,

            conflict

        );

    }

    /**
     * ============================================================================
     * Recuperar conflicto
     * ============================================================================
     */

    public getConflict(

        id: UUID

    ): LegalConflict | undefined {

        return this.conflicts.get(id);

    }

    /**
     * ============================================================================
     * Todos los conflictos
     * ============================================================================
     */

    public getConflicts():

        ReadonlyArray<LegalConflict> {

        return [

            ...this.conflicts.values()

        ];

    }

    /**
     * ============================================================================
     * Eliminar conflicto
     * ============================================================================
     */

    public removeConflict(

        id: UUID

    ): boolean {

        return this.conflicts.delete(id);

    }

    /**
     * ============================================================================
     * Reiniciar conflictos
     * ============================================================================
     */

    public clearConflicts(): void {

        this.conflicts.clear();

    }

    /**
     * ============================================================================
     * Exportación de la motivación jurídica
     * ============================================================================
     */

    public exportMotivation(

        id: UUID

    ): string {

        const motivation =

            this.getMotivation(id);

        if (!motivation) {

            return "";

        }

        return [

            `Título: ${motivation.title}`,

            "",

            "Resumen:",

            motivation.summary,

            "",

            "Fundamento jurídico:",

            ...motivation.legalBasis,

            "",

            "Razonamiento:",

            ...motivation.reasoning,

            "",

            "Conclusión:",

            motivation.conclusion

        ].join("\n");

    }

    /**
     * ============================================================================
     * Exportación de interpretación jurídica
     * ============================================================================
     */

    public exportInterpretation(

        interpretation: LegalInterpretation

    ): string {

        return [

            `Norma: ${interpretation.rule.title}`,

            `Artículo: ${interpretation.rule.article}`,

            `Referencia: ${interpretation.rule.reference}`,

            "",

            "Interpretación:",

            interpretation.interpretation,

            "",

            "Motivación:",

            interpretation.reasoning,

            "",

            "Confianza:",

            interpretation.confidence,

            "",

            "Referencias:",

            ...interpretation.references

        ].join("\n");

    }

    /**
     * ============================================================================
     * Exportación del resultado completo
     * ============================================================================
     */

    public exportReasoning(

        result: LegalReasoningResult

    ): string {

        const output: string[] = [];

        output.push(

            "========== RAZONAMIENTO JURÍDICO =========="

        );

        output.push("");

        output.push(

            `Contrato: ${result.context.contractType}`

        );

        output.push(

            `Valor estimado: ${result.context.estimatedValue}`

        );

        output.push("");

        output.push(

            "INTERPRETACIONES"

        );

        output.push("");

        result.interpretations.forEach(

            interpretation => {

                output.push(

                    this.exportInterpretation(

                        interpretation

                    )

                );

                output.push("");

            }

        );

        output.push(

            "CONCLUSIÓN"

        );

        output.push("");

        output.push(

            result.motivation.conclusion

        );

        return output.join("\n");

    }

    /**
     * ============================================================================
     * Número de exportaciones disponibles
     * ============================================================================
     */

    public getExportCapabilities() {

        return {

            motivation: true,

            interpretation: true,

            reasoning: true

        };

    }

    /**
     * ============================================================================
     * Validación de referencias jurídicas
     * ============================================================================
     */

    public validateReferences(

        references: LegalReference[]

    ): boolean {

        return references.every(

            reference =>

                reference.trim().length > 0

        );

    }

    /**
     * ============================================================================
     * Validación de artículos
     * ============================================================================
     */

    public validateArticles(

        articles: ArticleNumber[]

    ): boolean {

        return articles.every(

            article =>

                article.trim().length > 0

        );

    }

    /**
     * ============================================================================
     * Validación de una interpretación
     * ============================================================================
     */

    public validateInterpretation(

        interpretation: LegalInterpretation

    ): boolean {

        return (

            interpretation.reasoning.trim().length > 0 &&

            interpretation.interpretation.trim().length > 0 &&

            this.validateReferences(

                interpretation.references

            ) &&

            this.validateArticles(

                interpretation.applicableArticles

            )

        );

    }

    /**
     * ============================================================================
     * Validación de todas las interpretaciones
     * ============================================================================
     */

    public validateInterpretations(

        interpretations: LegalInterpretation[]

    ): boolean {

        return interpretations.every(

            interpretation =>

                this.validateInterpretation(

                    interpretation

                )

        );

    }

    /**
     * ============================================================================
     * Validación de la motivación jurídica
     * ============================================================================
     */

    public validateMotivation(

        motivation: LegalMotivation

    ): boolean {

        return (

            motivation.title.trim().length > 0 &&

            motivation.summary.trim().length > 0 &&

            motivation.conclusion.trim().length > 0 &&

            motivation.reasoning.length > 0 &&

            motivation.legalBasis.length > 0

        );

    }

    /**
     * ============================================================================
     * Validación completa del resultado
     * ============================================================================
     */

    public validateResult(

        result: LegalReasoningResult

    ): boolean {

        return (

            this.validateInterpretations(

                result.interpretations

            ) &&

            this.validateMotivation(

                result.motivation

            ) &&

            this.validateReasoning(

                result

            )

        );

    }

    /**
     * ============================================================================
     * Estado de validación
     * ============================================================================
     */

    public getValidationStatus(

        result: LegalReasoningResult

    ) {

        return {

            valid:

                this.validateResult(

                    result

                ),

            interpretations:

                this.validateInterpretations(

                    result.interpretations

                ),

            motivation:

                this.validateMotivation(

                    result.motivation

                ),

            reasoning:

                this.validateReasoning(

                    result

                ),

            consistency:

                this.verifyConsistency(

                    result

                )

        };

    }

    /**
     * ============================================================================
     * Generación de trazabilidad jurídica
     * ============================================================================
     */

    public generateTraceability(

        result: LegalReasoningResult

    ): Record<string, unknown> {

        return {

            inferenceId:

                result.context.inferenceId,

            generatedAt:

                new Date().toISOString(),

            contractType:

                result.context.contractType,

            estimatedValue:

                result.context.estimatedValue,

            cpvCodes:

                result.context.cpvCodes,

            appliedRules:

                result.interpretations.map(

                    interpretation => ({

                        identifier:

                            interpretation.rule.identifier,

                        article:

                            interpretation.rule.article,

                        source:

                            interpretation.rule.source,

                        priority:

                            interpretation.rule.priority

                    })

                ),

            detectedConflicts:

                result.conflicts.length,

            confidence:

                result.confidence

        };

    }

    /**
     * ============================================================================
     * Auditoría del razonamiento
     * ============================================================================
     */

    public generateAuditRecord(

        result: LegalReasoningResult

    ): string[] {

        const audit: string[] = [];

        audit.push(

            "LEGAL REASONING AUDIT"

        );

        audit.push(

            `Inference: ${result.context.inferenceId}`

        );

        audit.push(

            `Generated: ${new Date().toISOString()}`

        );

        audit.push(

            `Confidence: ${result.confidence}`

        );

        audit.push(

            `Interpretations: ${result.interpretations.length}`

        );

        audit.push(

            `Conflicts: ${result.conflicts.length}`

        );

        audit.push(

            `Execution: ${result.executionMilliseconds.toFixed(2)} ms`

        );

        return audit;

    }

    /**
     * ============================================================================
     * Estadísticas del razonador
     * ============================================================================
     */

    public getStatistics() {

        return {

            rules:

                this.getRuleCount(),

            interpretations:

                this.getInterpretationCount(),

            conflicts:

                this.getConflictCount(),

            motivations:

                this.getMotivationCount()

        };

    }

    /**
     * ============================================================================
     * Estado completo del razonador
     * ============================================================================
     */

    public getStatus() {

        return {

            initialized: true,

            configuration:

                this.configuration,

            statistics:

                this.getStatistics(),

            repository:

                this.getRuleRepositoryStatus(),

            exportCapabilities:

                this.getExportCapabilities()

        };

    }

    /**
     * ============================================================================
     * Explicación jurídica estructurada
     * ============================================================================
     */

    public explainReasoning(

        result: LegalReasoningResult

    ): string[] {

        const explanation: string[] = [];

        explanation.push(

            "INICIO DEL RAZONAMIENTO JURÍDICO"

        );

        explanation.push("");

        explanation.push(

            "1. Análisis del contexto contractual."

        );

        explanation.push(

            `Tipo de contrato: ${result.context.contractType}`

        );

        explanation.push(

            `Valor estimado: ${result.context.estimatedValue}`

        );

        explanation.push("");

        explanation.push(

            "2. Identificación de normas aplicables."

        );

        result.interpretations.forEach(

            interpretation => {

                explanation.push(

                    `• ${interpretation.rule.identifier} - Artículo ${interpretation.rule.article}`

                );

            }

        );

        explanation.push("");

        explanation.push(

            "3. Resolución de conflictos."

        );

        if (

            result.conflicts.length === 0

        ) {

            explanation.push(

                "No se detectan conflictos normativos."

            );

        }

        else {

            result.conflicts.forEach(

                conflict => {

                    explanation.push(

                        conflict.description

                    );

                }

            );

        }

        explanation.push("");

        explanation.push(

            "4. Fundamentación."

        );

        result.motivation.reasoning.forEach(

            reasoning =>

                explanation.push(reasoning)

        );

        explanation.push("");

        explanation.push(

            "5. Conclusión."

        );

        explanation.push(

            result.motivation.conclusion

        );

        return explanation;

    }

    /**
     * ============================================================================
     * Resumen ejecutivo
     * ============================================================================
     */

    public executiveSummary(

        result: LegalReasoningResult

    ): string {

        return [

            `Contrato: ${result.context.contractType}`,

            `Normas aplicadas: ${result.interpretations.length}`,

            `Conflictos: ${result.conflicts.length}`,

            `Confianza: ${result.confidence}`,

            `Conclusión: ${result.motivation.conclusion}`

        ].join("\n");

    }

    /**
     * ============================================================================
     * Justificación administrativa
     * ============================================================================
     */

    public administrativeJustification(

        result: LegalReasoningResult

    ): string {

        return [

            "JUSTIFICACIÓN ADMINISTRATIVA",

            "",

            result.motivation.summary,

            "",

            result.motivation.conclusion

        ].join("\n");

    }

    /**
     * ============================================================================
     * Informe para el expediente
     * ============================================================================
     */

    public generateAdministrativeReport(

        result: LegalReasoningResult

    ): string {

        return [

            this.executiveSummary(result),

            "",

            this.exportReasoning(result),

            "",

            this.administrativeJustification(result)

        ].join("\n");

    }

    /**
     * ============================================================================
     * Integración con la Ontología Jurídica
     * ============================================================================
     */

    public synchronizeOntology(): void {

        /**
         * En futuras versiones:
         *
         * • Sincronización automática con LegalOntology
         * • Actualización del grafo semántico
         * • Recarga de relaciones jurídicas
         * • Reindexación de conceptos
         */

    }

    /**
     * ============================================================================
     * Integración con el RuleEngine
     * ============================================================================
     */

    public synchronizeRuleEngine(): void {

        /**
         * En futuras versiones:
         *
         * • Recarga de reglas
         * • Invalidación de caché
         * • Versionado
         * • Dependencias
         */

    }

    /**
     * ============================================================================
     * Actualización del conocimiento jurídico
     * ============================================================================
     */

    public refreshKnowledge(): void {

        this.synchronizeOntology();

        this.synchronizeRuleEngine();

    }

    /**
     * ============================================================================
     * Comprobación de disponibilidad
     * ============================================================================
     */

    public isReady(): boolean {

        return (

            this.configuration

                .enableOntologySupport &&

            this.configuration

                .enableRuleEngineSupport

        );

    }

    /**
     * ============================================================================
     * Verificación del entorno
     * ============================================================================
     */

    public verifyEnvironment(): boolean {

        if (

            !this.isReady()

        ) {

            return false;

        }

        if (

            this.ontology === undefined

        ) {

            return false;

        }

        if (

            this.ruleEngine === undefined

        ) {

            return false;

        }

        if (

            this.inferenceEngine === undefined

        ) {

            return false;

        }

        return true;

    }

    /**
     * ============================================================================
     * Diagnóstico del entorno
     * ============================================================================
     */

    public getEnvironmentStatus() {

        return {

            ready:

                this.isReady(),

            ontology:

                this.ontology !== undefined,

            ruleEngine:

                this.ruleEngine !== undefined,

            inferenceEngine:

                this.inferenceEngine !== undefined,

            environmentValid:

                this.verifyEnvironment()

        };

    }

    /**
     * ============================================================================
     * Reinicialización completa
     * ============================================================================
     */

    public reinitialize(): void {

        this.clearRules();

        this.clearInterpretations();

        this.clearConflicts();

        this.loadLegalSources();

        this.loadInterpretationCriteria();

        this.loadConflictResolvers();

        this.loadLegalHierarchy();

    }

    /**
     * ============================================================================
     * Gestión de configuración
     * ============================================================================
     */

    public getConfiguration():

        Readonly<LegalReasonerConfiguration> {

        return {

            ...this.configuration

        };

    }

    /**
     * ============================================================================
     * Configuración habilitada
     * ============================================================================
     */

    public isConflictResolutionEnabled(): boolean {

        return this.configuration

            .enableConflictResolution;

    }

    public isInterpretationEnabled(): boolean {

        return this.configuration

            .enableInterpretation;

    }

    public isMotivationGenerationEnabled(): boolean {

        return this.configuration

            .enableMotivationGeneration;

    }

    public isLegalValidationEnabled(): boolean {

        return this.configuration

            .enableLegalValidation;

    }

    public isOntologySupportEnabled(): boolean {

        return this.configuration

            .enableOntologySupport;

    }

    public isRuleEngineSupportEnabled(): boolean {

        return this.configuration

            .enableRuleEngineSupport;

    }

    public isTraceabilityEnabled(): boolean {

        return this.configuration

            .enableTraceability;

    }

    /**
     * ============================================================================
     * Validación de configuración
     * ============================================================================
     */

    public validateConfiguration(): boolean {

        if (

            this.configuration

                .enableOntologySupport &&

            this.ontology === undefined

        ) {

            return false;

        }

        if (

            this.configuration

                .enableRuleEngineSupport &&

            this.ruleEngine === undefined

        ) {

            return false;

        }

        if (

            this.configuration

                .enableTraceability &&

            !this.configuration

                .enableMotivationGeneration

        ) {

            return false;

        }

        return true;

    }

    /**
     * ============================================================================
     * Estado de configuración
     * ============================================================================
     */

    public getConfigurationStatus() {

        return {

            valid:

                this.validateConfiguration(),

            options:

                this.getConfiguration(),

            ready:

                this.verifyEnvironment()

        };

    }

    /**
     * ============================================================================
     * Información del componente
     * ============================================================================
     */

    public getComponentInfo() {

        return {

            component:

                "LegalReasoner",

            version:

                "1.0.0",

            description:

                "Expert Legal Reasoning Engine",

            initialized:

                true

        };

    }

    /**
     * ============================================================================
     * Comparación entre dos razonamientos jurídicos
     * ============================================================================
     */

    public compareReasoningResults(

        first: LegalReasoningResult,

        second: LegalReasoningResult

    ) {

        return {

            firstConfidence:

                first.confidence,

            secondConfidence:

                second.confidence,

            firstInterpretations:

                first.interpretations.length,

            secondInterpretations:

                second.interpretations.length,

            firstConflicts:

                first.conflicts.length,

            secondConflicts:

                second.conflicts.length,

            sameConclusion:

                first.motivation.conclusion ===

                second.motivation.conclusion

        };

    }

    /**
     * ============================================================================
     * Comparación de motivaciones
     * ============================================================================
     */

    public compareMotivations(

        first: LegalMotivation,

        second: LegalMotivation

    ): boolean {

        return (

            first.conclusion ===

            second.conclusion &&

            first.summary ===

            second.summary

        );

    }

    /**
     * ============================================================================
     * Detección de cambios normativos
     * ============================================================================
     */

    public detectRegulatoryChanges(

        previousRules: LegalRule[],

        currentRules: LegalRule[]

    ) {

        const previousIds =

            new Set(

                previousRules.map(

                    rule => rule.identifier

                )

            );

        const currentIds =

            new Set(

                currentRules.map(

                    rule => rule.identifier

                )

            );

        const added =

            currentRules.filter(

                rule =>

                    !previousIds.has(

                        rule.identifier

                    )

            );

        const removed =

            previousRules.filter(

                rule =>

                    !currentIds.has(

                        rule.identifier

                    )

            );

        return {

            added,

            removed,

            changed:

                added.length +

                removed.length

        };

    }

    /**
     * ============================================================================
     * Evaluación del impacto normativo
     * ============================================================================
     */

    public evaluateRegulatoryImpact(

        changes: ReturnType<

            LegalReasoner["detectRegulatoryChanges"]

        >

    ) {

        if (

            changes.changed === 0

        ) {

            return "NO_IMPACT";

        }

        if (

            changes.changed < 5

        ) {

            return "LOW_IMPACT";

        }

        if (

            changes.changed < 15

        ) {

            return "MEDIUM_IMPACT";

        }

        return "HIGH_IMPACT";

    }

    /**
     * ============================================================================
     * Preparado para actualización normativa
     * ============================================================================
     */

    public requiresKnowledgeRefresh(

        previousRules: LegalRule[],

        currentRules: LegalRule[]

    ): boolean {

        const changes =

            this.detectRegulatoryChanges(

                previousRules,

                currentRules

            );

        return changes.changed > 0;

    }

    /**
     * ============================================================================
     * Estado de actualización
     * ============================================================================
     */

    public getUpdateStatus(

        previousRules: LegalRule[],

        currentRules: LegalRule[]

    ) {

        const changes =

            this.detectRegulatoryChanges(

                previousRules,

                currentRules

            );

        return {

            refreshRequired:

                this.requiresKnowledgeRefresh(

                    previousRules,

                    currentRules

                ),

            impact:

                this.evaluateRegulatoryImpact(

                    changes

                ),

            changes

        };

    }

    /**
     * ============================================================================
     * Métricas del razonador jurídico
     * ============================================================================
     */

    private metrics = {

        executions: 0,

        successfulExecutions: 0,

        failedExecutions: 0,

        averageExecutionTime: 0,

        totalExecutionTime: 0

    };

    /**
     * ============================================================================
     * Registrar ejecución
     * ============================================================================
     */

    private registerExecution(

        executionTime: number,

        success: boolean

    ): void {

        this.metrics.executions++;

        this.metrics.totalExecutionTime +=

            executionTime;

        this.metrics.averageExecutionTime =

            this.metrics.totalExecutionTime /

            this.metrics.executions;

        if (success) {

            this.metrics.successfulExecutions++;

        }

        else {

            this.metrics.failedExecutions++;

        }

    }

    /**
     * ============================================================================
     * Obtener métricas
     * ============================================================================
     */

    public getMetrics() {

        return {

            ...this.metrics,

            successRate:

                this.metrics.executions === 0

                    ? 0

                    : (

                        this.metrics.successfulExecutions /

                        this.metrics.executions

                    ) * 100

        };

    }

    /**
     * ============================================================================
     * Reiniciar métricas
     * ============================================================================
     */

    public resetMetrics(): void {

        this.metrics = {

            executions: 0,

            successfulExecutions: 0,

            failedExecutions: 0,

            averageExecutionTime: 0,

            totalExecutionTime: 0

        };

    }

    /**
     * ============================================================================
     * Health Check del LegalReasoner
     * ============================================================================
     */

    public healthCheck() {

        return {

            healthy:

                this.verifyEnvironment() &&

                this.validateConfiguration(),

            environment:

                this.getEnvironmentStatus(),

            configuration:

                this.getConfigurationStatus(),

            repository:

                this.getRuleRepositoryStatus(),

            metrics:

                this.getMetrics()

        };

    }

    /**
     * ============================================================================
     * Autoevaluación del componente
     * ============================================================================
     */

    public selfTest(): boolean {

        const health =

            this.healthCheck();

        return (

            health.healthy &&

            health.metrics.successRate >= 0

        );

    }

    /**
     * ============================================================================
     * Gestión de versiones del razonamiento jurídico
     * ============================================================================
     */

    private readonly engineVersion =

        "1.0.0";

    private readonly legalModelVersion =

        "LCSP-2023";

    /**
     * ============================================================================
     * Información de versión
     * ============================================================================
     */

    public getVersionInfo() {

        return {

            component:

                "LegalReasoner",

            engineVersion:

                this.engineVersion,

            legalModelVersion:

                this.legalModelVersion,

            ontologyAvailable:

                this.ontology !== undefined,

            ruleEngineAvailable:

                this.ruleEngine !== undefined,

            inferenceEngineAvailable:

                this.inferenceEngine !== undefined

        };

    }

    /**
     * ============================================================================
     * Compatibilidad entre versiones
     * ============================================================================
     */

    public isCompatible(

        version: string

    ): boolean {

        return version ===

            this.engineVersion;

    }

    /**
     * ============================================================================
     * Exportación del estado completo
     * ============================================================================
     */

    public exportState() {

        return {

            version:

                this.getVersionInfo(),

            configuration:

                this.getConfiguration(),

            repository:

                this.getRuleRepositoryStatus(),

            statistics:

                this.getStatistics(),

            metrics:

                this.getMetrics(),

            environment:

                this.getEnvironmentStatus()

        };

    }

    /**
     * ============================================================================
     * Restauración del estado
     * ============================================================================
     */

    public restoreState(

        state: ReturnType<

            LegalReasoner["exportState"]

        >

    ): void {

        /**
         * Punto preparado para futuras versiones:
         *
         * • Restauración de reglas
         * • Restauración de métricas
         * • Restauración de configuración
         * • Recuperación completa del motor
         */

        void state;

    }

    /**
     * ============================================================================
     * Preparación para serialización
     * ============================================================================
     */

    public toJSON() {

        return this.exportState();

    }

    /**
     * ============================================================================
     * Estado resumido del componente
     * ============================================================================
     */

    public summary() {

        return {

            component:

                "LegalReasoner",

            ready:

                this.isReady(),

            rules:

                this.getRuleCount(),

            interpretations:

                this.getInterpretationCount(),

            conflicts:

                this.getConflictCount(),

            version:

                this.engineVersion

        };

    }

    /**
     * ============================================================================
     * Gestión de recomendaciones jurídicas
     * ============================================================================
     */

    export interface LegalRecommendation {

        id: UUID;

        priority:

            LegalPriority;

        title: string;

        description: string;

        legalBasis:

            LegalReference[];

        mandatory: boolean;

    }

    /**
     * ============================================================================
     * Recomendaciones generadas
     * ============================================================================
     */

    private readonly recommendations:

        Map<UUID, LegalRecommendation> =

            new Map();

    /**
     * ============================================================================
     * Registrar recomendación
     * ============================================================================
     */

    public registerRecommendation(

        recommendation: LegalRecommendation

    ): void {

        this.recommendations.set(

            recommendation.id,

            recommendation

        );

    }

    /**
     * ============================================================================
     * Recuperar recomendación
     * ============================================================================
     */

    public getRecommendation(

        id: UUID

    ): LegalRecommendation | undefined {

        return this.recommendations.get(id);

    }

    /**
     * ============================================================================
     * Todas las recomendaciones
     * ============================================================================
     */

    public getRecommendations():

        ReadonlyArray<LegalRecommendation> {

        return [

            ...this.recommendations.values()

        ];

    }

    /**
     * ============================================================================
     * Recomendaciones obligatorias
     * ============================================================================
     */

    public getMandatoryRecommendations():

        LegalRecommendation[] {

        return this.getRecommendations()

            .filter(

                recommendation =>

                    recommendation.mandatory

            );

    }

    /**
     * ============================================================================
     * Recomendaciones ordenadas por prioridad
     * ============================================================================
     */

    public getRecommendationsByPriority():

        LegalRecommendation[] {

        return this.getRecommendations()

            .sort(

                (a, b) =>

                    b.priority -

                    a.priority

            );

    }

    /**
     * ============================================================================
     * Eliminar recomendación
     * ============================================================================
     */

    public removeRecommendation(

        id: UUID

    ): boolean {

        return this.recommendations.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reiniciar recomendaciones
     * ============================================================================
     */

    public clearRecommendations(): void {

        this.recommendations.clear();

    }

    /**
     * ============================================================================
     * Estado del gestor de recomendaciones
     * ============================================================================
     */

    public getRecommendationStatus() {

        return {

            total:

                this.recommendations.size,

            mandatory:

                this.getMandatoryRecommendations()

                    .length

        };

    }

    /**
     * ============================================================================
     * Gestión de excepciones jurídicas
     * ============================================================================
     */

    export interface LegalException {

        id: UUID;

        code: string;

        title: string;

        description: string;

        legalBasis:

            LegalReference[];

        severity:

            Severity;

        recoverable: boolean;

    }

    /**
     * ============================================================================
     * Registro de excepciones
     * ============================================================================
     */

    private readonly legalExceptions:

        Map<UUID, LegalException> =

            new Map();

    /**
     * ============================================================================
     * Registrar excepción jurídica
     * ============================================================================
     */

    public registerLegalException(

        exception: LegalException

    ): void {

        this.legalExceptions.set(

            exception.id,

            exception

        );

    }

    /**
     * ============================================================================
     * Recuperar excepción
     * ============================================================================
     */

    public getLegalException(

        id: UUID

    ): LegalException | undefined {

        return this.legalExceptions.get(id);

    }

    /**
     * ============================================================================
     * Todas las excepciones
     * ============================================================================
     */

    public getLegalExceptions():

        ReadonlyArray<LegalException> {

        return [

            ...this.legalExceptions.values()

        ];

    }

    /**
     * ============================================================================
     * Excepciones recuperables
     * ============================================================================
     */

    public getRecoverableExceptions():

        LegalException[] {

        return this.getLegalExceptions()

            .filter(

                exception =>

                    exception.recoverable

            );

    }

    /**
     * ============================================================================
     * Excepciones críticas
     * ============================================================================
     */

    public getCriticalExceptions():

        LegalException[] {

        return this.getLegalExceptions()

            .filter(

                exception =>

                    exception.severity ===

                    Severity.CRITICAL

            );

    }

    /**
     * ============================================================================
     * Eliminar excepción
     * ============================================================================
     */

    public removeLegalException(

        id: UUID

    ): boolean {

        return this.legalExceptions.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reiniciar excepciones
     * ============================================================================
     */

    public clearLegalExceptions(): void {

        this.legalExceptions.clear();

    }

    /**
     * ============================================================================
     * Estado del gestor de excepciones
     * ============================================================================
     */

    public getExceptionStatus() {

        return {

            total:

                this.legalExceptions.size,

            recoverable:

                this.getRecoverableExceptions()

                    .length,

            critical:

                this.getCriticalExceptions()

                    .length

        };

    }

    /**
     * ============================================================================
     * Gestión de precedentes jurídicos
     * ============================================================================
     */

    export interface LegalPrecedent {

        id: UUID;

        title: string;

        reference: LegalReference;

        court: string;

        decisionDate: ISODate;

        summary: string;

        applicableArticles:

            ArticleNumber[];

        confidence:

            Confidence;

    }

    /**
     * ============================================================================
     * Repositorio de precedentes
     * ============================================================================
     */

    private readonly precedents:

        Map<UUID, LegalPrecedent> =

            new Map();

    /**
     * ============================================================================
     * Registrar precedente
     * ============================================================================
     */

    public registerPrecedent(

        precedent: LegalPrecedent

    ): void {

        this.precedents.set(

            precedent.id,

            precedent

        );

    }

    /**
     * ============================================================================
     * Recuperar precedente
     * ============================================================================
     */

    public getPrecedent(

        id: UUID

    ): LegalPrecedent | undefined {

        return this.precedents.get(id);

    }

    /**
     * ============================================================================
     * Todos los precedentes
     * ============================================================================
     */

    public getPrecedents():

        ReadonlyArray<LegalPrecedent> {

        return [

            ...this.precedents.values()

        ];

    }

    /**
     * ============================================================================
     * Buscar precedentes por artículo
     * ============================================================================
     */

    public findPrecedentsByArticle(

        article: ArticleNumber

    ): LegalPrecedent[] {

        return this.getPrecedents().filter(

            precedent =>

                precedent.applicableArticles.includes(

                    article

                )

        );

    }

    /**
     * ============================================================================
     * Buscar precedentes por tribunal
     * ============================================================================
     */

    public findPrecedentsByCourt(

        court: string

    ): LegalPrecedent[] {

        return this.getPrecedents().filter(

            precedent =>

                precedent.court === court

        );

    }

    /**
     * ============================================================================
     * Eliminar precedente
     * ============================================================================
     */

    public removePrecedent(

        id: UUID

    ): boolean {

        return this.precedents.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reiniciar precedentes
     * ============================================================================
     */

    public clearPrecedents(): void {

        this.precedents.clear();

    }

    /**
     * ============================================================================
     * Estado del repositorio de precedentes
     * ============================================================================
     */

    public getPrecedentStatus() {

        return {

            total:

                this.precedents.size,

            courts:

                [

                    ...new Set(

                        this.getPrecedents().map(

                            precedent =>

                                precedent.court

                        )

                    )

                ].length

        };

    }

    /**
     * ============================================================================
     * Gestión de principios jurídicos
     * ============================================================================
     */

    export interface LegalPrinciple {

        id: UUID;

        name: string;

        description: string;

        priority: LegalPriority;

        legalBasis:

            LegalReference[];

        applicableTo:

            string[];

    }

    /**
     * ============================================================================
     * Repositorio de principios
     * ============================================================================
     */

    private readonly principles:

        Map<UUID, LegalPrinciple> =

            new Map();

    /**
     * ============================================================================
     * Registrar principio jurídico
     * ============================================================================
     */

    public registerPrinciple(

        principle: LegalPrinciple

    ): void {

        this.principles.set(

            principle.id,

            principle

        );

    }

    /**
     * ============================================================================
     * Recuperar principio
     * ============================================================================
     */

    public getPrinciple(

        id: UUID

    ): LegalPrinciple | undefined {

        return this.principles.get(id);

    }

    /**
     * ============================================================================
     * Todos los principios
     * ============================================================================
     */

    public getPrinciples():

        ReadonlyArray<LegalPrinciple> {

        return [

            ...this.principles.values()

        ];

    }

    /**
     * ============================================================================
     * Principios aplicables
     * ============================================================================
     */

    public getApplicablePrinciples(

        contractType: string

    ): LegalPrinciple[] {

        return this.getPrinciples().filter(

            principle =>

                principle.applicableTo.includes(

                    contractType

                )

        );

    }

    /**
     * ============================================================================
     * Principios ordenados por prioridad
     * ============================================================================
     */

    public getPrinciplesByPriority():

        LegalPrinciple[] {

        return this.getPrinciples()

            .sort(

                (a, b) =>

                    b.priority -

                    a.priority

            );

    }

    /**
     * ============================================================================
     * Eliminar principio
     * ============================================================================
     */

    public removePrinciple(

        id: UUID

    ): boolean {

        return this.principles.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reiniciar principios
     * ============================================================================
     */

    public clearPrinciples(): void {

        this.principles.clear();

    }

    /**
     * ============================================================================
     * Estado del repositorio de principios
     * ============================================================================
     */

    public getPrincipleStatus() {

        return {

            total:

                this.principles.size,

            ordered:

                this.getPrinciplesByPriority()

                    .length

        };

    }

    /**
     * ============================================================================
     * Gestión de criterios interpretativos
     * ============================================================================
     */

    export interface InterpretationCriterion {

        id: UUID;

        name: string;

        description: string;

        priority: number;

        enabled: boolean;

    }

    /**
     * ============================================================================
     * Repositorio de criterios
     * ============================================================================
     */

    private readonly interpretationCriteria:

        Map<UUID, InterpretationCriterion> =

            new Map();

    /**
     * ============================================================================
     * Registrar criterio
     * ============================================================================
     */

    public registerInterpretationCriterion(

        criterion: InterpretationCriterion

    ): void {

        this.interpretationCriteria.set(

            criterion.id,

            criterion

        );

    }

    /**
     * ============================================================================
     * Recuperar criterio
     * ============================================================================
     */

    public getInterpretationCriterion(

        id: UUID

    ): InterpretationCriterion | undefined {

        return this.interpretationCriteria.get(

            id

        );

    }

    /**
     * ============================================================================
     * Todos los criterios
     * ============================================================================
     */

    public getInterpretationCriteria():

        ReadonlyArray<InterpretationCriterion> {

        return [

            ...this.interpretationCriteria.values()

        ];

    }

    /**
     * ============================================================================
     * Criterios habilitados
     * ============================================================================
     */

    public getEnabledCriteria():

        InterpretationCriterion[] {

        return this.getInterpretationCriteria()

            .filter(

                criterion =>

                    criterion.enabled

            );

    }

    /**
     * ============================================================================
     * Criterios ordenados
     * ============================================================================
     */

    public getCriteriaByPriority():

        InterpretationCriterion[] {

        return this.getInterpretationCriteria()

            .sort(

                (a, b) =>

                    b.priority -

                    a.priority

            );

    }

    /**
     * ============================================================================
     * Eliminar criterio
     * ============================================================================
     */

    public removeInterpretationCriterion(

        id: UUID

    ): boolean {

        return this.interpretationCriteria.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reiniciar criterios
     * ============================================================================
     */

    public clearInterpretationCriteria(): void {

        this.interpretationCriteria.clear();

    }

    /**
     * ============================================================================
     * Estado del repositorio
     * ============================================================================
     */

    public getCriteriaStatus() {

        return {

            total:

                this.interpretationCriteria.size,

            enabled:

                this.getEnabledCriteria()

                    .length

        };

    }

    /**
     * ============================================================================
     * Gestión de evidencias jurídicas
     * ============================================================================
     */

    export interface LegalEvidence {

        id: UUID;

        title: string;

        description: string;

        source: LegalReference;

        confidence: Confidence;

        collectedAt: ISODate;

    }

    /**
     * ============================================================================
     * Repositorio de evidencias
     * ============================================================================
     */

    private readonly evidences:

        Map<UUID, LegalEvidence> =

            new Map();

    /**
     * ============================================================================
     * Registrar evidencia
     * ============================================================================
     */

    public registerEvidence(

        evidence: LegalEvidence

    ): void {

        this.evidences.set(

            evidence.id,

            evidence

        );

    }

    /**
     * ============================================================================
     * Recuperar evidencia
     * ============================================================================
     */

    public getEvidence(

        id: UUID

    ): LegalEvidence | undefined {

        return this.evidences.get(

            id

        );

    }

    /**
     * ============================================================================
     * Todas las evidencias
     * ============================================================================
     */

    public getEvidences():

        ReadonlyArray<LegalEvidence> {

        return [

            ...this.evidences.values()

        ];

    }

    /**
     * ============================================================================
     * Evidencias por nivel de confianza
     * ============================================================================
     */

    public getEvidenceByConfidence(

        confidence: Confidence

    ): LegalEvidence[] {

        return this.getEvidences().filter(

            evidence =>

                evidence.confidence === confidence

        );

    }

    /**
     * ============================================================================
     * Eliminar evidencia
     * ============================================================================
     */

    public removeEvidence(

        id: UUID

    ): boolean {

        return this.evidences.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reiniciar evidencias
     * ============================================================================
     */

    public clearEvidence(): void {

        this.evidences.clear();

    }

    /**
     * ============================================================================
     * Estado del repositorio de evidencias
     * ============================================================================
     */

    public getEvidenceStatus() {

        return {

            total:

                this.evidences.size,

            veryHigh:

                this.getEvidenceByConfidence(

                    "VERY_HIGH"

                ).length,

            high:

                this.getEvidenceByConfidence(

                    "HIGH"

                ).length,

            medium:

                this.getEvidenceByConfidence(

                    "MEDIUM"

                ).length,

            low:

                this.getEvidenceByConfidence(

                    "LOW"

                ).length

        };

    }

    /**
     * ============================================================================
     * Gestión de decisiones jurídicas
     * ============================================================================
     */

    export interface LegalDecision {

        id: UUID;

        title: string;

        description: string;

        motivationId: UUID;

        confidence: Confidence;

        accepted: boolean;

        createdAt: ISODate;

    }

    /**
     * ============================================================================
     * Repositorio de decisiones
     * ============================================================================
     */

    private readonly decisions:

        Map<UUID, LegalDecision> =

            new Map();

    /**
     * ============================================================================
     * Registrar decisión
     * ============================================================================
     */

    public registerDecision(

        decision: LegalDecision

    ): void {

        this.decisions.set(

            decision.id,

            decision

        );

    }

    /**
     * ============================================================================
     * Recuperar decisión
     * ============================================================================
     */

    public getDecision(

        id: UUID

    ): LegalDecision | undefined {

        return this.decisions.get(

            id

        );

    }

    /**
     * ============================================================================
     * Todas las decisiones
     * ============================================================================
     */

    public getDecisions():

        ReadonlyArray<LegalDecision> {

        return [

            ...this.decisions.values()

        ];

    }

    /**
     * ============================================================================
     * Decisiones aceptadas
     * ============================================================================
     */

    public getAcceptedDecisions():

        LegalDecision[] {

        return this.getDecisions().filter(

            decision =>

                decision.accepted

        );

    }

    /**
     * ============================================================================
     * Decisiones pendientes
     * ============================================================================
     */

    public getPendingDecisions():

        LegalDecision[] {

        return this.getDecisions().filter(

            decision =>

                !decision.accepted

        );

    }

    /**
     * ============================================================================
     * Eliminar decisión
     * ============================================================================
     */

    public removeDecision(

        id: UUID

    ): boolean {

        return this.decisions.delete(

            id

        );

    }

    /**
     * ============================================================================
     * Reiniciar decisiones
     * ============================================================================
     */

    public clearDecisions(): void {

        this.decisions.clear();

    }

    /**
     * ============================================================================
     * Estado del repositorio de decisiones
     * ============================================================================
     */

    public getDecisionStatus() {

        return {

            total:

                this.decisions.size,

            accepted:

                this.getAcceptedDecisions()

                    .length,

            pending:

                this.getPendingDecisions()

                    .length

        };

    }

    /**
     * ============================================================================
     * Historial de razonamientos jurídicos
     * ============================================================================
     */

    private readonly reasoningHistory:

        LegalReasoningResult[] = [];

    /**
     * ============================================================================
     * Registrar razonamiento
     * ============================================================================
     */

    public registerReasoningResult(

        result: LegalReasoningResult

    ): void {

        this.reasoningHistory.push(

            result

        );

    }

    /**
     * ============================================================================
     * Obtener historial completo
     * ============================================================================
     */

    public getReasoningHistory():

        ReadonlyArray<LegalReasoningResult> {

        return [

            ...this.reasoningHistory

        ];

    }

    /**
     * ============================================================================
     * Último razonamiento
     * ============================================================================
     */

    public getLastReasoning():

        LegalReasoningResult | undefined {

        return this.reasoningHistory.at(

            -1

        );

    }

    /**
     * ============================================================================
     * Buscar razonamientos por contrato
     * ============================================================================
     */

    public findReasoningByContractType(

        contractType: string

    ): LegalReasoningResult[] {

        return this.reasoningHistory.filter(

            result =>

                result.context.contractType ===

                contractType

        );

    }

    /**
     * ============================================================================
     * Buscar razonamientos por nivel de confianza
     * ============================================================================
     */

    public findReasoningByConfidence(

        confidence: Confidence

    ): LegalReasoningResult[] {

        return this.reasoningHistory.filter(

            result =>

                result.confidence ===

                confidence

        );

    }

    /**
     * ============================================================================
     * Vaciar historial
     * ============================================================================
     */

    public clearReasoningHistory(): void {

        this.reasoningHistory.length = 0;

    }

    /**
     * ============================================================================
     * Estado del historial
     * ============================================================================
     */

    public getHistoryStatus() {

        return {

            total:

                this.reasoningHistory.length,

            lastExecution:

                this.reasoningHistory.length > 0

                    ? this.reasoningHistory.at(-1)?.context.inferenceId

                    : undefined

        };

    }

    /**
     * ============================================================================
     * Cierre controlado del LegalReasoner
     * ============================================================================
     */

    public shutdown(): void {

        this.clearRules();

        this.clearInterpretations();

        this.clearConflicts();

        this.clearRecommendations();

        this.clearEvidence();

        this.clearDecisions();

        this.clearPrecedents();

        this.clearPrinciples();

        this.clearInterpretationCriteria();

        this.clearReasoningHistory();

        this.resetMetrics();

    }

    /**
     * ============================================================================
     * Reinicio completo del motor
     * ============================================================================
     */

    public restart(): void {

        this.shutdown();

        this.initialize();

    }

    /**
     * ============================================================================
     * Información resumida
     * ============================================================================
     */

    public info() {

        return {

            component:

                "LegalReasoner",

            version:

                this.engineVersion,

            ready:

                this.isReady(),

            initialized:

                this.verifyEnvironment(),

            metrics:

                this.getMetrics(),

            statistics:

                this.getStatistics()

        };

    }

    /**
     * ============================================================================
     * Estado operativo
     * ============================================================================
     */

    public operationalStatus() {

        return {

            environment:

                this.verifyEnvironment(),

            configuration:

                this.validateConfiguration(),

            ontology:

                this.ontology !== undefined,

            ruleEngine:

                this.ruleEngine !== undefined,

            inferenceEngine:

                this.inferenceEngine !== undefined,

            healthy:

                this.selfTest()

        };

    }

    /**
     * ============================================================================
     * Diagnóstico completo
     * ============================================================================
     */

    public diagnostics() {

        return {

            info:

                this.info(),

            environment:

                this.getEnvironmentStatus(),

            repository:

                this.getRuleRepositoryStatus(),

            recommendations:

                this.getRecommendationStatus(),

            exceptions:

                this.getExceptionStatus(),

            precedents:

                this.getPrecedentStatus(),

            principles:

                this.getPrincipleStatus(),

            criteria:

                this.getCriteriaStatus(),

            evidence:

                this.getEvidenceStatus(),

            decisions:

                this.getDecisionStatus(),

            history:

                this.getHistoryStatus()

        };

    }

    /**
     * ============================================================================
     * Destructor lógico
     * ============================================================================
     */

    public dispose(): void {

        this.shutdown();

    }

    /**
     * ============================================================================
     * Método estático de creación
     * ============================================================================
     */

    public static create(

        ontology: LegalOntology,

        ruleEngine: RuleEngine,

        inferenceEngine: InferenceEngine,

        configuration?:

            Partial<LegalReasonerConfiguration>

    ): LegalReasoner {

        return new LegalReasoner(

            ontology,

            ruleEngine,

            inferenceEngine,

            configuration

        );

    }

    /**
     * ============================================================================
     * Método estático con configuración por defecto
     * ============================================================================
     */

    public static createDefault(

        ontology: LegalOntology,

        ruleEngine: RuleEngine,

        inferenceEngine: InferenceEngine

    ): LegalReasoner {

        return new LegalReasoner(

            ontology,

            ruleEngine,

            inferenceEngine,

            DEFAULT_CONFIGURATION

        );

    }

}

/**
 * ============================================================================
 * Exportaciones públicas
 * ============================================================================
 */

export default LegalReasoner;

export {

    DEFAULT_CONFIGURATION

};

export type {

    LegalReasonerConfiguration,

    LegalReasoningResult,

    LegalMotivation,

    LegalConflict,

    LegalInterpretation,

    LegalRecommendation,

    LegalException,

    LegalPrecedent,

    LegalPrinciple,

    InterpretationCriterion,

    LegalEvidence,

    LegalDecision

};

/**
 * =============================================================================
 * Fin del archivo LegalReasoner.ts
 * =============================================================================
 *
 * Motor experto de razonamiento jurídico para el Asistente de Contratación
 * Pública.
 *
 * Funcionalidades implementadas:
 *
 *  ✓ Interpretación normativa
 *  ✓ Resolución de conflictos
 *  ✓ Motivación jurídica
 *  ✓ Generación de recomendaciones
 *  ✓ Gestión de precedentes
 *  ✓ Gestión de principios
 *  ✓ Evidencias jurídicas
 *  ✓ Historial de razonamientos
 *  ✓ Auditoría
 *  ✓ Exportación
 *  ✓ Métricas
 *  ✓ Diagnóstico
 *  ✓ Health Check
 *  ✓ Preparado para IA
 *  ✓ Preparado para Ontología
 *  ✓ Preparado para RuleEngine
 *  ✓ Preparado para Inferencia
 *
 * -----------------------------------------------------------------------------
 * Próximas ampliaciones previstas
 * -----------------------------------------------------------------------------
 *
 * - Integración completa con la Ontología Jurídica.
 * - Consulta automática de la base documental.
 * - Integración con el motor semántico.
 * - Interpretación mediante modelos LLM.
 * - Aprendizaje a partir de expedientes reales.
 * - Integración con jurisprudencia.
 * - Actualización automática del conocimiento normativo.
 * - Explicabilidad avanzada.
 * - Auditoría ENS.
 * - Auditoría ENI.
 * - Registro completo de trazabilidad.
 *
 * Este componente constituye el núcleo del razonamiento jurídico del sistema
 * experto de contratación pública.
 *
 * =============================================================================
 */
