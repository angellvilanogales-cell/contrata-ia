/**
 * ============================================================
 * CONTRATA-IA
 * Knowledge Repository
 * ============================================================
 */

import {
    KnowledgeModule,
    KnowledgeModuleRegistry,
    KnowledgeModuleType
} from "./KnowledgeModuleRegistry";

export interface KnowledgeResource {

    id: string;

    module: KnowledgeModuleType;

    type: string;

    key: string;

    value: unknown;

    metadata?: Record<string, unknown>;

}

export class KnowledgeRepository {

    private readonly registry: KnowledgeModuleRegistry;

    private readonly resources = new Map<string, KnowledgeResource>();

    constructor(
        registry: KnowledgeModuleRegistry
    ) {
        this.registry = registry;
    }

    public registerModule(
        module: KnowledgeModule
    ): void {

        this.registry.register(module);

    }

    public add(
        resource: KnowledgeResource
    ): void {

        this.resources.set(resource.id, resource);

    }

    public update(
        resource: KnowledgeResource
    ): void {

        this.resources.set(resource.id, resource);

    }

    public remove(
        id: string
    ): void {

        this.resources.delete(id);

    }

    public get(
        id: string
    ): KnowledgeResource | undefined {

        return this.resources.get(id);

    }

    public getAll(): KnowledgeResource[] {

        return [...this.resources.values()];

    }

    public findByModule(
        module: KnowledgeModuleType
    ): KnowledgeResource[] {

        return this.getAll()
            .filter(r => r.module === module);

    }

    public findByType(
        type: string
    ): KnowledgeResource[] {

        return this.getAll()
            .filter(r => r.type === type);

    }

    public findByKey(
        key: string
    ): KnowledgeResource | undefined {

        return this.getAll()
            .find(r => r.key === key);

    }

    public clear(): void {

        this.resources.clear();

    }

}
