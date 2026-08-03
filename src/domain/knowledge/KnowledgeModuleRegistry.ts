/**
 * ============================================================
 * CONTRATA-IA
 * Knowledge Module Registry
 * ============================================================
 */

export enum KnowledgeModuleType {

    LCSP = "lcsp",

    CPV = "cpv",

    RULES = "rules",

    ONTOLOGY = "ontology",

    PARAMETERS = "parameters",

    TEMPLATES = "templates",

    SNIPPETS = "snippets",

    INFERENCE = "inference",

    REASONING = "reasoning",

    DOCUMENTS = "documents",

    VALIDATION = "validation",

    WORKFLOW = "workflow"

}

export interface KnowledgeModule {

    id: string;

    name: string;

    version: string;

    type: KnowledgeModuleType;

    enabled: boolean;

    priority: number;

    description?: string;

}

export class KnowledgeModuleRegistry {

    private readonly modules = new Map<string, KnowledgeModule>();

    register(module: KnowledgeModule): void {

        this.modules.set(module.id, module);

    }

    unregister(id: string): void {

        this.modules.delete(id);

    }

    get(id: string): KnowledgeModule | undefined {

        return this.modules.get(id);

    }

    getAll(): KnowledgeModule[] {

        return [...this.modules.values()]
            .sort((a, b) => a.priority - b.priority);

    }

    getEnabled(): KnowledgeModule[] {

        return this.getAll()
            .filter(m => m.enabled);

    }

    has(id: string): boolean {

        return this.modules.has(id);

    }

    clear(): void {

        this.modules.clear();

    }

}
