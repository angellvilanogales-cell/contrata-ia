/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * KnowledgeRuleProvider
 * ------------------------------------------------------------
 * Adaptador entre la Base de Conocimiento y el RuleEngine.
 *
 * RESPONSABILIDAD
 *
 * - Descubrir Knowledge Packs disponibles.
 * - Registrar automáticamente sus reglas.
 * - Evitar que el RuleEngine conozca el origen del conocimiento.
 *
 * ============================================================
 */

import {
    RuleEngine,
    RuleDefinition
} from "./RuleEngine";

import {
    KnowledgeRepository
} from "./KnowledgeRepository";

/**
 * Un Knowledge Pack capaz de aportar reglas.
 */
export interface KnowledgeRuleModule {

    /**
     * Identificador.
     */
    id: string;

    /**
     * Nombre.
     */
    name: string;

    /**
     * Devuelve las reglas disponibles.
     */
    getRules(): RuleDefinition[];

}

/**
 * Proveedor de reglas.
 */
export class KnowledgeRuleProvider {

    constructor(

        private readonly repository: KnowledgeRepository

    ) {}

    /**
     * Registra todas las reglas existentes
     * en el RuleEngine.
     */
    public registerAll(

        engine: RuleEngine

    ): void {

        const sources = this.repository.getSources();

        for (const source of sources) {

            const module = source as unknown as Partial<KnowledgeRuleModule>;

            if (!module.getRules) {

                continue;

            }

            const rules = module.getRules();

            for (const rule of rules) {

                engine.register(rule);

            }

        }

    }

    /**
     * Obtiene todas las reglas disponibles.
     */
    public getRules(): RuleDefinition[] {

        const result: RuleDefinition[] = [];

        const sources = this.repository.getSources();

        for (const source of sources) {

            const module = source as unknown as Partial<KnowledgeRuleModule>;

            if (!module.getRules) {

                continue;

            }

            result.push(

                ...module.getRules()

            );

        }

        return result;

    }

    /**
     * Número de módulos.
     */
    public moduleCount(): number {

        return this.repository.count();

    }

}
