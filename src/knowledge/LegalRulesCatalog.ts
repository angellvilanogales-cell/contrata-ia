/**
 * ============================================================
 * CONTRATA IA
 * LegalRulesCatalog
 * ============================================================
 *
 * Catálogo central de reglas jurídicas.
 *
 * Reúne todas las reglas del sistema en un único punto
 * para que el RuleEngine pueda consultarlas.
 * ============================================================
 */

import { LegalRule } from "./LegalRule";

import { NecesidadRules } from "./rules/NecesidadRules";

export class LegalRulesCatalog {

    /**
     * Devuelve todas las reglas registradas.
     */
    public obtenerTodas(): LegalRule[] {

        return [

            ...NecesidadRules

        ];

    }

    /**
     * Devuelve únicamente las reglas activas.
     */
    public obtenerActivas(): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla => regla.activa

            );

    }

    /**
     * Devuelve todas las reglas asociadas
     * a un artículo concreto.
     */
    public buscarPorArticulo(
        articulo: string
    ): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla => regla.articulo === articulo

            );

    }

    /**
     * Devuelve las reglas utilizadas
     * por un motor determinado.
     */
    public buscarPorMotor(
        motor: string
    ): LegalRule[] {

        return this.obtenerTodas()

            .filter(

                regla =>

                    regla.motores.includes(
                        motor
                    )

            );

    }

}
