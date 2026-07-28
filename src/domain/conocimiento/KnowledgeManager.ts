/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeManager
 * ============================================================
 *
 * Punto único de acceso al banco de conocimiento.
 *
 * Ningún motor accederá directamente al
 * KnowledgeRepository.
 *
 * ============================================================
 */

import { KnowledgeRepository } from "./KnowledgeRepository";
import { RuleDefinition } from "./RuleLoader";

export class KnowledgeManager {

    constructor(

        private readonly repository: KnowledgeRepository

    ) { }

    // =====================================================
    // ARTÍCULOS
    // =====================================================

    public obtenerArticulo(

        id: string

    ) {

        return this.repository.obtenerArticulo(id);

    }

    public obtenerArticulos() {

        return this.repository.obtenerArticulos();

    }

    // =====================================================
    // REGLAS
    // =====================================================

    public obtenerRegla(

        id: string

    ): RuleDefinition | undefined {

        return this.repository.obtenerRegla(id);

    }

    public obtenerReglas(): RuleDefinition[] {

        return this.repository.obtenerReglas();

    }

    // =====================================================
    // CPV
    // =====================================================

    public obtenerCPV(

        codigo: string

    ) {

        return this.repository.obtenerCPV(codigo);

    }

    public obtenerTodosCPV() {

        return this.repository.obtenerTodosCPV();

    }

    // =====================================================
    // PLANTILLAS
    // =====================================================

    public obtenerPlantillas() {

        return this.repository.obtenerPlantillas();

    }

    // =====================================================
    // CLÁUSULAS
    // =====================================================

    public obtenerClausulas() {

        return this.repository.obtenerClausulas();

    }

    // =====================================================
    // INFORMES
    // =====================================================

    public obtenerInformes() {

        return this.repository.obtenerInformes();

    }

    // =====================================================
    // JURISPRUDENCIA
    // =====================================================

    public obtenerJurisprudencia() {

        return this.repository.obtenerJurisprudencia();

    }

    // =====================================================
    // ESTADÍSTICAS
    // =====================================================

    public estadisticas() {

        return this.repository.estadisticas();

    }

}
