/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ContractKnowledgeEngine
 * ------------------------------------------------------------
 * Motor principal de conocimiento.
 *
 * RESPONSABILIDAD
 *
 * Coordina:
 *
 * - KnowledgeRepository
 * - KnowledgeGraph
 * - KnowledgeRuleProvider
 * - RuleEngine
 *
 * No contiene normativa.
 * No contiene reglas.
 * No contiene decisiones jurídicas.
 *
 * Es únicamente el orquestador del conocimiento.
 *
 * ============================================================
 */

import { KnowledgeRepository } from "./KnowledgeRepository";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { KnowledgeRuleProvider } from "./KnowledgeRuleProvider";
import { RuleEngine } from "./RuleEngine";
import { DecisionContext } from "./DecisionContext";
import { KnowledgeDecision } from "./models/KnowledgeDecision";

export class ContractKnowledgeEngine {

    /**
     * Repositorio.
     */
    private readonly repository: KnowledgeRepository;

    /**
     * Grafo.
     */
    private readonly graph: KnowledgeGraph;

    /**
     * Rule Engine.
     */
    private readonly ruleEngine: RuleEngine;

    /**
     * Adaptador.
     */
    private readonly provider: KnowledgeRuleProvider;

    constructor(

        repository?: KnowledgeRepository,

        graph?: KnowledgeGraph,

        ruleEngine?: RuleEngine

    ) {

        this.repository = repository ?? new KnowledgeRepository();

        this.graph = graph ?? new KnowledgeGraph();

        this.ruleEngine = ruleEngine ?? new RuleEngine();

        this.provider = new KnowledgeRuleProvider(

            this.repository

        );

    }

    /**
     * Inicializa todo el motor.
     */
    public initialize(): void {

        this.graph.loadCoreRelations();

        this.provider.registerAll(

            this.ruleEngine

        );

    }

    /**
     * Devuelve el repositorio.
     */
    public getRepository(): KnowledgeRepository {

        return this.repository;

    }

    /**
     * Devuelve el Rule Engine.
     */
    public getRuleEngine(): RuleEngine {

        return this.ruleEngine;

    }

    /**
     * Devuelve el grafo.
     */
    public getGraph(): KnowledgeGraph {

        return this.graph;

    }

    /**
     * Ejecuta una evaluación.
     */
    public evaluate(

        context: DecisionContext

    ): KnowledgeDecision {

        return this.ruleEngine.execute(

            context

        );

    }

    /**
     * Conceptos relacionados.
     */
    public relatedConcepts(

        concept: string

    ): string[] {

        return this.graph
            .outgoing(concept)
            .map(

                relation => relation.to

            );

    }

    /**
     * Conceptos que afectan a otro.
     */
    public dependentConcepts(

        concept: string

    ): string[] {

        return this.graph
            .incoming(concept)
            .map(

                relation => relation.from

            );

    }

    /**
     * Número de reglas cargadas.
     */
    public ruleCount(): number {

        return this.ruleEngine.count();

    }

    /**
     * Número de módulos.
     */
    public moduleCount(): number {

        return this.provider.moduleCount();

    }

    /**
     * Número de relaciones.
     */
    public relationCount(): number {

        return this.graph.count();

    }

}
