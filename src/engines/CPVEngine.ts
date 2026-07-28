/**
 * ============================================================
 * CONTRATA IA
 * CPVEngine
 * ============================================================
 *
 * Motor encargado de determinar automáticamente el código
 * CPV más adecuado para el expediente de contratación.
 *
 * En futuras versiones utilizará:
 *
 * - Base oficial CPV
 * - Reglas jurídicas
 * - Sinónimos
 * - IA
 * - Históricos de expedientes
 *
 */

import { Expediente } from "../domain/expediente/Expediente";

export interface ResultadoCPV {

    codigoPrincipal: string;

    descripcionPrincipal: string;

    codigosSecundarios: string[];

    confianza: number;

    observaciones: string[];

}

export class CPVEngine {

    /**
     * Punto de entrada.
     */
    public clasificar(
        expediente: Expediente
    ): ResultadoCPV {

        this.validar(expediente);

        const descripcion =
            this.obtenerDescripcion(expediente);

        return this.buscarCPV(descripcion);

    }

    // =====================================================
    // VALIDACIONES
    // =====================================================

    private validar(
        expediente: Expediente
    ): void {

        if (!expediente) {

            throw new Error(
                "Debe existir un expediente."
            );

        }

    }

    // =====================================================
    // OBTENER TEXTO
    // =====================================================

    private obtenerDescripcion(
        expediente: Expediente
    ): string {

        // Se implementará utilizando el objeto
        // del contrato.

        return "";

    }

    // =====================================================
    // BÚSQUEDA
    // =====================================================

    private buscarCPV(
        descripcion: string
    ): ResultadoCPV {

        /**
         * IMPLEMENTACIÓN FUTURA
         *
         * 1. Diccionario CPV
         * 2. Coincidencias
         * 3. IA
         * 4. Ranking
         */

        return {

            codigoPrincipal: "",

            descripcionPrincipal: "",

            codigosSecundarios: [],

            confianza: 0,

            observaciones: []

        };

    }

}
