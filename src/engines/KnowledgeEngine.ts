/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeEngine
 * ============================================================
 *
 * Motor encargado de consultar la base de conocimiento
 * jurídica y proporcionar las reglas aplicables a cada
 * expediente.
 *
 * ============================================================
 */

import { LegalRule } from "../knowledge/LegalRule";
import { LegalRulesCatalog } from "../knowledge/LegalRulesCatalog";

export class KnowledgeEngine {

    private catalogo: LegalRulesCatalog;

    constructor() {

        this.catalogo = new LegalRulesCatalog();

    }

    /**
     * Obtiene todas las reglas activas.
     */
    public obtenerReglas(): LegalRule[] {

        return this.catalogo.obtenerActivas();

    }

    /**
     * Busca reglas por artículo.
     */
    public buscarPorArticulo(
        articulo: string
    ): LegalRule[] {

        return this.catalogo.buscarPorArticulo(
            articulo
        );

    }

    /**
     * Busca reglas por motor.
     */
    public buscarPorMotor(
        motor: string
    ): LegalRule[] {

        return this.catalogo.buscarPorMotor(
            motor
        );

    }

}
