/**
 * ============================================================
 * CONTRATA IA
 * KnowledgeEngine
 * ============================================================
 *
 * Motor de conocimiento jurídico.
 *
 * Centraliza el acceso a:
 *
 * • LCSP
 * • Directivas Europeas
 * • Normativa autonómica
 * • Junta Consultiva
 * • Informes
 * • Instrucciones
 * • Base de conocimiento propia
 *
 * Todos los motores consultarán este componente.
 * ============================================================
 */

export interface ReferenciaNormativa {

    norma: string;

    articulo: string;

    apartado?: string;

    descripcion: string;

}

export interface ConsultaNormativa {

    termino: string;

    categoria?: string;

}

export class KnowledgeEngine {

    constructor() {}

    /**
     * Punto de entrada.
     */
    public consultar(
        consulta: ConsultaNormativa
    ): ReferenciaNormativa[] {

        if (!consulta.termino.trim()) {

            throw new Error(
                "Debe indicarse un término de búsqueda."
            );

        }

        return this.buscar(consulta);

    }

    // =====================================================
    // BÚSQUEDA
    // =====================================================

    private buscar(
        consulta: ConsultaNormativa
    ): ReferenciaNormativa[] {

        /**
         * IMPLEMENTACIÓN FUTURA
         *
         * 1. LCSP
         * 2. Reglamento
         * 3. Directivas UE
         * 4. Junta Consultiva
         * 5. Base documental
         * 6. IA
         */

        return [];

    }

    /**
     * Devuelve la normativa relacionada con
     * un artículo concreto.
     */
    public buscarArticulo(
        articulo: string
    ): ReferenciaNormativa[] {

        return [];

    }

    /**
     * Devuelve todas las referencias sobre
     * un procedimiento concreto.
     */
    public buscarProcedimiento(
        procedimiento: string
    ): ReferenciaNormativa[] {

        return [];

    }

    /**
     * Devuelve todas las referencias
     * relacionadas con un CPV.
     */
    public buscarCPV(
        codigo: string
    ): ReferenciaNormativa[] {

        return [];

    }

}
