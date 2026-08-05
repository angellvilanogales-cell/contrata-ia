/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * RuleRepository
 * ------------------------------------------------------------
 * Repositorio único de reglas jurídicas.
 *
 * Nunca contiene reglas codificadas.
 *
 * Su única responsabilidad consiste en almacenar
 * las reglas cargadas desde knowledge/.
 *
 * ============================================================
 */

export interface LegalRule {

    id: string;

    module: string;

    name: string;

    version: string;

    data: unknown;

}

export class RuleRepository {

    private readonly rules = new Map<string, LegalRule>();

    /**
     * =====================================================
     * Registrar una regla.
     * =====================================================
     */

    public register(

        rule: LegalRule

    ): void {

        this.rules.set(

            rule.id,

            rule

        );

    }

    /**
     * =====================================================
     * Obtener regla.
     * =====================================================
     */

    public get(

        id: string

    ): LegalRule | undefined {

        return this.rules.get(id);

    }

    /**
     * =====================================================
     * Obtener todas.
     * =====================================================
     */

    public getAll(): LegalRule[] {

        return Array.from(

            this.rules.values()

        );

    }

    /**
     * =====================================================
     * Obtener reglas de un módulo.
     * =====================================================
     */

    public getModule(

        module: string

    ): LegalRule[] {

        return this.getAll().filter(

            r => r.module === module

        );

    }

    /**
     * =====================================================
     * Existe una regla.
     * =====================================================
     */

    public exists(

        id: string

    ): boolean {

        return this.rules.has(id);

    }

    /**
     * =====================================================
     * Número de reglas.
     * =====================================================
     */

    public size(): number {

        return this.rules.size;

    }

    /**
     * =====================================================
     * Reiniciar repositorio.
     * =====================================================
     */

    public clear(): void {

        this.rules.clear();

    }

}
