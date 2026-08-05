/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * RuleLoader
 * ------------------------------------------------------------
 * Responsable de cargar las reglas jurídicas externas
 * dentro del RuleRepository.
 *
 * Nunca interpreta las reglas.
 * Nunca toma decisiones.
 *
 * ============================================================
 */

import {

    LegalRule,

    RuleRepository

} from "./RuleRepository";

export class RuleLoader {

    constructor(

        private readonly repository: RuleRepository

    ) {}

    /**
     * =====================================================
     * Registrar una colección de reglas.
     * =====================================================
     */
    public load(

        rules: LegalRule[]

    ): void {

        for (const rule of rules) {

            this.repository.register(rule);

        }

    }

    /**
     * =====================================================
     * Registrar una única regla.
     * =====================================================
     */
    public loadRule(

        rule: LegalRule

    ): void {

        this.repository.register(rule);

    }

    /**
     * =====================================================
     * Reiniciar el repositorio.
     * =====================================================
     */
    public reload(

        rules: LegalRule[]

    ): void {

        this.repository.clear();

        this.load(rules);

    }

    /**
     * =====================================================
     * Número de reglas cargadas.
     * =====================================================
     */
    public count(): number {

        return this.repository.size();

    }

}
