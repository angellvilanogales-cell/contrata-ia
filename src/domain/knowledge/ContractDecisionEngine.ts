/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ContractDecisionEngine
 * ------------------------------------------------------------
 * Cerebro del sistema de conocimiento.
 *
 * Responsabilidades:
 *
 *  - Coordinar los distintos catálogos.
 *  - Ejecutar consultas de conocimiento.
 *  - Combinar decisiones.
 *  - Resolver conflictos.
 *  - Devolver una respuesta única.
 *
 * IMPORTANTE
 *
 * NO contiene normativa.
 * NO contiene reglas jurídicas.
 * NO genera documentos.
 *
 * Toda la inteligencia reside en los catálogos y en el
 * RuleEngine.
 * ============================================================
 */

import { DecisionContext } from "./DecisionContext";
import {
    KnowledgeDecision,
    createKnowledgeDecision
} from "./models/KnowledgeDecision";

import { ProcedureCatalog } from "./catalogs/ProcedureCatalog";
import { CPVCatalog } from "./catalogs/CPVCatalog";

export class ContractDecisionEngine {

    /**
     * Catálogo de procedimientos.
     */
    private readonly procedureCatalog: ProcedureCatalog;

    /**
     * Catálogo CPV.
     */
    private readonly cpvCatalog: CPVCatalog;

    /**
     * Constructor.
     */
    constructor() {

        this.procedureCatalog = new ProcedureCatalog();
        this.cpvCatalog = new CPVCatalog();

    }

    /**
     * Punto único de entrada del motor.
     *
     * En futuras versiones este método ejecutará todos los
     * catálogos necesarios dependiendo de la consulta.
     */
    public resolve(
        context: DecisionContext
    ): KnowledgeDecision {

        const decision = createKnowledgeDecision();

        /**
         * --------------------------------------------------
         * Primera fase:
         * Obtener recomendaciones de los distintos catálogos.
         * --------------------------------------------------
         */

        const procedure = this.procedureCatalog.resolve(context);

        const cpv = this.cpvCatalog.resolve(context);

        /**
         * --------------------------------------------------
         * TODO
         *
         * Combinar resultados.
         *
         * Resolver conflictos.
         *
         * Priorizar decisiones.
         *
         * Unificar explicaciones.
         *
         * Añadir referencias normativas.
         *
         * --------------------------------------------------
         */

        decision.observations.push(
            "ContractDecisionEngine orchestration not implemented yet."
        );

        decision.success = false;

        return decision;

    }

}
