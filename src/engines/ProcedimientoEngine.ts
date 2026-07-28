/**
 * =========================================================
 * CONTRATA IA
 * ProcedimientoEngine
 * =========================================================
 *
 * Motor responsable de determinar el procedimiento de
 * adjudicación aplicable conforme a la LCSP.
 *
 * Funciones principales:
 *
 * - Analizar el expediente.
 * - Evaluar el valor estimado.
 * - Analizar el objeto del contrato.
 * - Comprobar circunstancias especiales.
 * - Seleccionar el procedimiento.
 * - Generar la motivación jurídica.
 * - Devolver el resultado para los generadores documentales.
 */

import { Expediente } from "../domain/expediente/Expediente";
import { ProcedimientoContratacion } from "../domain/expediente/ProcedimientoContratacion";

export class ProcedimientoEngine {

    public determinarProcedimiento(
        expediente: Expediente
    ): ProcedimientoContratacion {

        // -------------------------------------------------
        // PASO 1
        // Comprobación de expediente
        // -------------------------------------------------

        this.validarExpediente(expediente);

        // -------------------------------------------------
        // PASO 2
        // Contrato menor
        // -------------------------------------------------

        if (this.esContratoMenor(expediente)) {
            return ProcedimientoContratacion.NEGOCIADO;
        }

        // -------------------------------------------------
        // PASO 3
        // Procedimiento abierto simplificado
        // -------------------------------------------------

        if (this.esAbiertoSimplificado(expediente)) {
            return ProcedimientoContratacion.ABIERTO_SIMPLIFICADO;
        }

        // -------------------------------------------------
        // PASO 4
        // Procedimiento abierto
        // -------------------------------------------------

        return ProcedimientoContratacion.ABIERTO;

    }

    private validarExpediente(
        expediente: Expediente
    ): void {

        // Implementación futura

    }

    private esContratoMenor(
        expediente: Expediente
    ): boolean {

        // Implementación conforme a LCSP

        return false;

    }

    private esAbiertoSimplificado(
        expediente: Expediente
    ): boolean {

        // Implementación conforme a LCSP

        return false;

    }

}
