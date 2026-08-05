/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * RULES REPOSITORY
 *
 * Persistencia de reglas jurídicas, técnicas y procedimentales.
 *
 ******************************************************************************/

import { JSONRepository } from "./JSONRepository";

export interface RuleRecord {

    id: string;

    code: string;

    name: string;

    description: string;

    category: string;

    priority: number;

    enabled: boolean;

    version: string;

    expression: string;

    inputs: string[];

    outputs: string[];

    tags: string[];

    metadata: Record<string, unknown>;

}

export class RulesRepository

    extends JSONRepository<RuleRecord> {

    constructor(

        storageDirectory = "./storage/rules"

    ) {

        super(

            storageDirectory,

            "rules.json"

        );

    }

    public async findByCode(

        code: string

    ): Promise<RuleRecord | undefined> {

        const rules =

            await this.readAll();

        return rules.find(

            rule =>

                rule.code === code

        );

    }

    public async findByCategory(

        category: string

    ): Promise<ReadonlyArray<RuleRecord>> {

        const rules =

            await this.readAll();

        return rules.filter(

            rule =>

                rule.category === category

        );

    }

    public async findEnabled()

        : Promise<ReadonlyArray<RuleRecord>> {

        const rules =

            await this.readAll();

        return rules.filter(

            rule =>

                rule.enabled

        );

    }

    public async findByPriority(

        minimumPriority: number

    ): Promise<ReadonlyArray<RuleRecord>> {

        const rules =

            await this.readAll();

        return rules.filter(

            rule =>

                rule.priority >= minimumPriority

        );

    }

    public async findByTag(

        tag: string

    ): Promise<ReadonlyArray<RuleRecord>> {

        const value =

            tag.toLowerCase();

        const rules =

            await this.readAll();

        return rules.filter(

            rule =>

                rule.tags.some(

                    item =>

                        item

                            .toLowerCase()

                            .includes(value)

                )

        );

    }

    public async search(

        text: string

    ): Promise<ReadonlyArray<RuleRecord>> {

        const value =

            text.toLowerCase();

        const rules =

            await this.readAll();

        return rules.filter(

            rule =>

                rule.name

                    .toLowerCase()

                    .includes(value)

                ||

                rule.description

                    .toLowerCase()

                    .includes(value)

                ||

                rule.code

                    .toLowerCase()

                    .includes(value)

        );

    }

    public async enable(

        id: string

    ): Promise<void> {

        const rule =

            await this.findById(id);

        if (

            !rule

        ) {

            throw new Error(

                "Rule not found."

            );

        }

        rule.enabled = true;

        await this.update(

            id,

            rule

        );

    }

    public async disable(

        id: string

    ): Promise<void> {

        const rule =

            await this.findById(id);

        if (

            !rule

        ) {

            throw new Error(

                "Rule not found."

            );

        }

        rule.enabled = false;

        await this.update(

            id,

            rule

        );

    }

    public async listCategories()

        : Promise<ReadonlyArray<string>> {

        const rules =

            await this.readAll();

        return [

            ...new Set(

                rules.map(

                    rule =>

                        rule.category

                )

            )

        ];

    }

}
